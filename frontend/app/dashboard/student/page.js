"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MessageCircle,
  ShieldAlert,
  Star,
  Loader2,
  CheckCircle2,
  Heart,
  Users,
  X,
  Check,
  Bell,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

// ─── Pending Parent Request Card ──────────────────────────────────────────────

function ParentRequestCard({ link, onRespond }) {
  const [loading, setLoading] = useState(null); // 'approve' | 'reject' | null

  const handleAction = async (action) => {
    setLoading(action);
    await onRespond(link._id, action);
    setLoading(null);
  };

  return (
    <div className="flex items-center justify-between gap-4 bg-white border-2 border-amber-100 rounded-[24px] p-5 shadow-sm animate-in slide-in-from-top-2">
      <div className="flex items-center gap-4">
        {/* Avatar placeholder */}
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl flex-shrink-0">
          🏠
        </div>
        <div>
          <p className="text-sm font-black text-slate-800">
            {link.parent_name || "Orang Tua"}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {link.parent_email}
          </p>
          <p className="text-[10px] text-amber-500 font-bold mt-0.5">
            Meminta akses ke data emosionalmu
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        {/* Reject */}
        <button
          onClick={() => handleAction("reject")}
          disabled={!!loading}
          className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all disabled:opacity-50"
          title="Tolak"
        >
          {loading === "reject" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <X size={16} />
          )}
        </button>
        {/* Approve */}
        <button
          onClick={() => handleAction("approve")}
          disabled={!!loading}
          className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-all disabled:opacity-50"
          title="Setujui"
        >
          {loading === "approve" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Parent Requests Section ───────────────────────────────────────────────────

function ParentRequestsSection({ studentId }) {
  const [requests, setRequests] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [toasts, setToasts] = useState([]);

  const pushToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const fetchRequests = useCallback(async () => {
    if (!studentId) return;
    setFetching(true);
    try {
      const res = await fetch("/api/family/pending");
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch {
      console.error("Gagal mengambil permintaan orang tua");
    } finally {
      setFetching(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRespond = async (linkId, action) => {
    try {
      const res = await fetch("/api/family/respond", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link_id: linkId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== linkId));
        pushToast(
          action === "approve"
            ? "Orang tua berhasil dihubungkan! ✅"
            : "Permintaan berhasil ditolak.",
          action === "approve" ? "success" : "info",
        );
      } else {
        pushToast(data.message || "Gagal memproses.", "error");
      }
    } catch {
      pushToast("Koneksi error.", "error");
    }
  };

  if (fetching) return null; // Silent loading — tidak ganggu UI utama
  if (requests.length === 0) return null; // Tidak tampil jika tidak ada request

  return (
    <>
      {/* Toast notifications */}
      <div className="fixed top-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-5 py-3 rounded-2xl text-sm font-bold shadow-xl animate-in slide-in-from-right-4 ${
              t.type === "success"
                ? "bg-emerald-500 text-white"
                : t.type === "info"
                  ? "bg-slate-700 text-white"
                  : "bg-red-500 text-white"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>

      {/* Request banner */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-100 rounded-[32px] p-6 space-y-4 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Bell className="text-amber-600" size={20} />
              </div>
              {/* badge */}
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {requests.length}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">
                Permintaan Koneksi Orang Tua
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {requests.length} permintaan menunggu persetujuan kamu
              </p>
            </div>
          </div>
          <button
            onClick={fetchRequests}
            className="text-amber-500 hover:text-amber-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Info note */}
        <div className="bg-white/70 text-[11px] text-slate-500 font-medium px-4 py-3 rounded-2xl leading-relaxed border border-amber-100">
          💡 Jika kamu menyetujui, orang tua dapat melihat{" "}
          <strong>ringkasan mood</strong> dan{" "}
          <strong>laporan perkembanganmu</strong>. Data percakapan pribadi{" "}
          <strong>tidak akan dibagikan</strong>.
        </div>

        {/* Request cards */}
        <div className="space-y-3">
          {requests.map((r) => (
            <ParentRequestCard key={r._id} link={r} onRespond={handleRespond} />
          ))}
        </div>
      </section>
    </>
  );
}

// ─── Mood Check-in ─────────────────────────────────────────────────────────────

function MoodCheckIn({ sessionId }) {
  const [isMoodLoading, setIsMoodLoading] = useState(false);
  const [lastMood, setLastMood] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);

  const moodEmojis = [
    { emoji: "😢", label: "Sedih" },
    { emoji: "😕", label: "Bingung" },
    { emoji: "😐", label: "Biasa" },
    { emoji: "🙂", label: "Senang" },
    { emoji: "🤩", label: "Hebat" },
  ];

  useEffect(() => {
    if (!sessionId) return;
    fetch("/api/student/mood")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.logs.length > 0) setLastMood(data.logs[0]);
      })
      .catch(console.error);
  }, [sessionId]);

  const handleMoodCheckIn = async (moodData) => {
    setIsMoodLoading(true);
    try {
      const res = await fetch("/api/student/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: moodData.emoji, label: moodData.label }),
      });
      if (res.ok) {
        setLastMood({ mood: moodData.emoji, label: moodData.label });
        setSelectedMood(moodData.label);
        setTimeout(() => setSelectedMood(null), 5000);
      }
    } catch (err) {
      console.error("Gagal mencatat mood:", err);
    } finally {
      setIsMoodLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">
        Mood Check-in:
      </p>
      <div className="flex gap-2 items-center min-h-[40px]">
        {isMoodLoading ? (
          <Loader2 className="animate-spin text-[#00adb5] mx-8" size={20} />
        ) : lastMood ? (
          <div className="flex items-center gap-3 animate-in zoom-in">
            <div className="text-2xl">{lastMood.mood}</div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
              <CheckCircle2 size={14} /> Mood {lastMood.label} Tercatat
            </div>
            <button
              onClick={() => setLastMood(null)}
              className="text-[10px] text-slate-400 underline hover:text-[#00adb5] font-bold ml-1"
            >
              Ganti
            </button>
          </div>
        ) : (
          moodEmojis.map((m, i) => (
            <button
              key={i}
              onClick={() => handleMoodCheckIn(m)}
              className="text-2xl hover:scale-125 transition-transform active:scale-95 hover:drop-shadow-md p-1"
              title={m.label}
            >
              {m.emoji}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function StudentPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const firstName = session?.user?.fullname?.split(" ")[0] || "Student";

  const quickAccess = [
    {
      title: "Curhat Aman",
      href: "/dashboard/student/chat",
      icon: <MessageCircle className="text-[#00adb5]" />,
      color: "bg-[#00adb5]/10",
      desc: "Ngobrol bareng AI Mood Buddy untuk melepas penatmu.",
    },
    {
      title: "Lapor Bullying",
      href: "/dashboard/student/report",
      icon: <ShieldAlert className="text-rose-500" />,
      color: "bg-rose-50",
      desc: "Laporkan tindakan tidak nyaman atau perundungan secara rahasia.",
    },
    {
      title: "Talent Mapping",
      href: "/dashboard/student/talent",
      icon: <Star className="text-[#fbcd2b]" />,
      color: "bg-[#fbcd2b]/15",
      desc: "Temukan minat dan bakatmu untuk masa depan yang cerah.",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ── Welcome + Mood ── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Halo, {firstName}! 👋
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic">
            Bagaimana kabarmu hari ini? Klik emoji yang paling mewakilimu.
          </p>
        </div>
        <MoodCheckIn sessionId={session?.user?.id} />
      </section>

      {/* ── PARENT REQUESTS (muncul hanya jika ada) ── */}
      <ParentRequestsSection studentId={session?.user?.id} />

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Access */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickAccess.map((item, i) => (
              <div
                key={i}
                onClick={() => router.push(item.href)}
                className={`group p-8 rounded-[40px] ${item.color} border border-transparent hover:border-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer ${i === 2 ? "md:col-span-2" : ""}`}
              >
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:rotate-6 transition-transform">
                  {React.cloneElement(item.icon, { size: 28 })}
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">
                  {item.title}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Insight Banner */}
          <div className="bg-[#00adb5] p-10 rounded-[45px] text-white relative overflow-hidden shadow-2xl shadow-[#00adb5]/20">
            <div className="relative z-10 max-w-xl">
              <h4 className="text-[#fbcd2b] font-black text-xl mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                Insight Hari Ini ✨
              </h4>
              <p className="text-xl opacity-95 leading-relaxed font-bold italic">
                "Kesehatan mentalmu adalah prioritas utama. Luangkan waktu
                sejenak untuk mendengarkan diri sendiri hari ini."
              </p>
              <button
                onClick={() => router.push("/dashboard/student/chat")}
                className="mt-8 bg-white/20 hover:bg-white/40 backdrop-blur-md px-10 py-4 rounded-2xl text-sm font-black transition-all border border-white/20 uppercase tracking-widest"
              >
                Mulai Cerita
              </button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-8">
          {/* Psychologist CTA */}
          <div className="bg-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#00adb5] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#00adb5]/20">
                <Heart className="text-white" size={24} />
              </div>
              <h4 className="text-lg font-black mb-3 leading-tight">
                Butuh teman bicara yang ahli?
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium mb-8">
                Tim psikolog profesional kami siap mendengarkan ceritamu tanpa
                menghakimi.
              </p>
              <button
                onClick={() =>
                  router.push("/dashboard/student/chat/psychologist")
                }
                className="w-full py-4 bg-[#00adb5] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#00c2cb] transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#00adb5]/20"
              >
                Hubungi Psikolog
              </button>
            </div>
          </div>

          {/* Connected parents info — shown when student has active links */}
          <ConnectedParentsWidget studentId={session?.user?.id} />

          {/* Tips */}
          <div className="bg-[#fbcd2b]/10 p-8 rounded-[40px] border border-[#fbcd2b]/20 relative overflow-hidden">
            <h4 className="text-[10px] font-black text-[#fbcd2b] mb-3 uppercase tracking-[0.2em]">
              Tips Wellbeing 💡
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed font-bold italic">
              "Tarik napas dalam-dalam selama 4 hitungan, tahan selama 7, dan
              buang selama 8. Teknik ini ampuh meredakan cemas."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Connected Parents Widget ─────────────────────────────────────────────────
// Shows active parent connections + option to revoke

function ConnectedParentsWidget({ studentId }) {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!studentId) return;
    fetch("/api/family/active")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setParents(d.parents);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading || parents.length === 0) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#00adb5]" />
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Orang Tua Terhubung
          </h4>
        </div>
        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
          {parents.length} aktif
        </span>
      </div>

      <div className="space-y-2">
        {parents.map((p) => (
          <div
            key={p._id}
            className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3"
          >
            <div>
              <p className="text-xs font-bold text-slate-700">
                {p.parent_name || "Orang Tua"}
              </p>
              <p className="text-[10px] text-slate-400">{p.parent_email}</p>
            </div>
            <button
              onClick={() => router.push("/dashboard/student/family")}
              className="text-slate-300 hover:text-[#00adb5] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/dashboard/student/family")}
        className="w-full text-[10px] font-black text-slate-400 hover:text-[#00adb5] uppercase tracking-widest transition-colors"
      >
        Kelola Koneksi Keluarga →
      </button>
    </div>
  );
}
