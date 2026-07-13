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
  Users,
  X,
  Check,
  Bell,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Pending Parent Request Card
// ─────────────────────────────────────────────────────────────

function ParentRequestCard({ link, onRespond }) {
  const [loading, setLoading] = useState(null);

  const handleAction = async (action) => {
    setLoading(action);
    await onRespond(link._id, action);
    setLoading(null);
  };

  return (
    <div className="flex items-center justify-between gap-4 bg-white border-2 border-amber-100 rounded-[24px] p-5 shadow-sm animate-in slide-in-from-top-2">
      <div className="flex items-center gap-4">
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

// ─────────────────────────────────────────────────────────────
// Parent Requests Section
// ─────────────────────────────────────────────────────────────

function ParentRequestsSection({ studentId }) {
  const [requests, setRequests] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [toasts, setToasts] = useState([]);

  const pushToast = (msg, type = "success") => {
    const id = Date.now();

    setToasts((t) => [...t, { id, msg, type }]);

    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  };

  const fetchRequests = useCallback(async () => {
    if (!studentId) return;

    setFetching(true);

    try {
      const res = await fetch("/api/family/pending");
      const data = await res.json();

      if (data.success) {
        setRequests(data.requests);
      }
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link_id: linkId,
          action,
        }),
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

  if (fetching) return null;
  if (requests.length === 0) return null;

  return (
    <>
      {/* Toast */}
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

      {/* Section */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-100 rounded-[32px] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Bell className="text-amber-600" size={20} />
              </div>

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
            className="text-amber-500 hover:text-amber-700"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="bg-white/70 text-[11px] text-slate-500 font-medium px-4 py-3 rounded-2xl leading-relaxed border border-amber-100">
          Jika kamu menyetujui, orang tua dapat melihat{" "}
          <strong>ringkasan mood</strong> dan{" "}
          <strong>laporan perkembanganmu</strong>. Data percakapan pribadi{" "}
          <strong>tidak akan dibagikan</strong>.
        </div>

        <div className="space-y-3">
          {requests.map((r) => (
            <ParentRequestCard
              key={r._id}
              link={r}
              onRespond={handleRespond}
            />
          ))}
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Mood Check-in (LOGIKA UPDATE PER HARI & BISA GANTI)
// ─────────────────────────────────────────────────────────────

function MoodCheckIn({ sessionId }) {
  const [isMoodLoading, setIsMoodLoading] = useState(false);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
  const [lastMood, setLastMood] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [hoveredMood, setHoveredMood] = useState(null);
  const [note, setNote] = useState("");

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
        if (data.success && data.logs?.length > 0) {
          const latestLog = data.logs[0];
          
          // Filter ketat membandingkan tanggal log terakhir dengan tanggal lokal hari ini
          const todayStr = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
          const logDateStr = new Date(latestLog.createdAt).toLocaleDateString('en-CA');

          if (todayStr === logDateStr) {
            setLastMood(latestLog); // Jika hari ini sudah isi, tampilkan rangkumannya
          } else {
            setLastMood(null); // Jika sudah ganti hari esoknya, buka form baru otomatis
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsInitialCheckDone(true));
  }, [sessionId]);

  const handleMoodCheckIn = async () => {
    if (!selectedMood) return;

    setIsMoodLoading(true);

    try {
      const res = await fetch("/api/student/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood: selectedMood.emoji,
          label: selectedMood.label,
          note,
        }),
      });

      if (res.ok) {
        setLastMood({
          mood: selectedMood.emoji,
          label: selectedMood.label,
          note,
          createdAt: new Date().toISOString() // Simpan timestamp lokal untuk pembacaan state
        });

        setSelectedMood(null);
        setNote("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMoodLoading(false);
    }
  };

  if (!isInitialCheckDone) {
    return (
      <div className="bg-white border border-slate-100 rounded-[26px] shadow-sm p-4 w-full h-32 flex items-center justify-center">
         <Loader2 className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <>
      {/* Modal View for Forced Check-In */}
      {!lastMood && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl p-6 md:p-8 w-full max-w-md space-y-6 transform scale-100 animate-in zoom-in-95 duration-300">
             <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">Bagaimana Perasaanmu Hari Ini?</h3>
                <p className="text-sm text-slate-500">Pilih salah satu mood yang paling menggambarkan perasaanmu saat ini untuk melanjutkan explore.</p>
             </div>

             <div className="flex gap-3 justify-center flex-wrap">
                {moodEmojis.map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoveredMood(m.label)}
                    onMouseLeave={() => setHoveredMood(null)}
                    onClick={() => setSelectedMood(m)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all duration-300 ${
                      selectedMood?.label === m.label
                        ? "border-[#00adb5] bg-[#00adb5]/10 scale-110"
                        : "border-slate-100 bg-slate-50/50 hover:border-[#00adb5]/30 hover:scale-105"
                    }`}
                  >
                    {m.emoji}
                  </button>
                ))}
             </div>
             <div className="text-center h-4 flex items-center justify-center">
               {(hoveredMood || selectedMood) && (
                 <span className="text-sm font-bold text-[#00adb5]">
                   {hoveredMood || selectedMood?.label}
                 </span>
               )}
             </div>

             <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ada yang ingin diceritakan? (opsional)"
                className="w-full h-24 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#00adb5] resize-none"
              />

              <button
                onClick={handleMoodCheckIn}
                disabled={!selectedMood || isMoodLoading}
                className="w-full h-12 rounded-2xl bg-[#00adb5] hover:bg-[#00929a] text-white text-sm font-black uppercase tracking-[0.2em] disabled:opacity-40 flex items-center justify-center gap-2 transition-colors"
              >
                {isMoodLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Lanjutkan"
                )}
              </button>
          </div>
        </div>
      )}

      {/* Summary View for Sidebar */}
      {lastMood && (
        <div className="bg-white border border-slate-100 rounded-[26px] shadow-sm p-4 w-full space-y-4">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Mood Check-in
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 min-w-0">
              <div className="text-3xl">{lastMood.mood}</div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold w-fit">
                  <CheckCircle2 size={13} />
                  {lastMood.label}
                </div>

                {lastMood.note && (
                  <p className="text-xs text-slate-500 mt-1 truncate max-w-[180px]">
                    "{lastMood.note}"
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedMood(moodEmojis.find(m => m.emoji === lastMood.mood) || null);
                setNote(lastMood.note || "");
                setLastMood(null); 
              }}
              className="text-[10px] font-bold text-slate-400 hover:text-[#00adb5] shrink-0"
            >
              Ganti
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────

export default function StudentPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const firstName = session?.user?.fullname?.split(" ")[0] || "Student";

  const quickAccess = [
    {
      title: "Student Diary Buddy",
      href: "/dashboard/student/chat",
      icon: <MessageCircle className="text-[#00adb5]" />,
      color: "bg-[#00adb5]/10",
      desc: "Ruang aman untuk bercerita, memahami perasaanmu, dan mendapatkan dukungan awal saat kamu membutuhkannya. ",
    },
    {
      title: "Student Safe Space",
      href: "/dashboard/student/report",
      icon: <ShieldAlert className="text-rose-500" />,
      color: "bg-rose-50",
      desc: "Kamu berhak merasa aman di lingkungan sekolah. Jika ada situasi yang membuatmu merasa tidak aman atau tidak nyaman, seperti perundungan, kekerasan verbal, atau lainnya kamu bisa bercerita secara rahasia di sini. ",
    },
    {
      title: "Self Explorer",
      href: "/dashboard/student/talent",
      icon: <Star className="text-[#fbcd2b]" />,
      color: "bg-[#fbcd2b]/15",
      desc: "Kenali minat dan kekuatan diri untuk menggali potensi terbaikmu.",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome */}
      <section>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
          Halo {firstName}! 👋
        </h2>

        <p className="text-slate-500 mt-1 font-medium italic">
          Senang melihatmu hari ini. <br/>
          Yuk, luangkan sedikit waktu untuk mengecek kabar dirimu. 

        </p>
      </section>

      {/* Parent Requests */}
      <ParentRequestsSection studentId={session?.user?.id} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Access */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickAccess.map((item, i) => (
              <div
                key={i}
                onClick={() => router.push(item.href)}
                className={`group p-8 rounded-[40px] ${item.color} border border-transparent hover:border-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer ${
                  i === 2 ? "md:col-span-2" : ""
                }`}
              >
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6">
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
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <MoodCheckIn sessionId={session?.user?.id} />

          <ConnectedParentsWidget studentId={session?.user?.id} />

          <div className="bg-[#fbcd2b]/10 p-8 rounded-[40px] border border-[#fbcd2b]/20">
            <h4 className="text-[10px] font-black text-[#fbcd2b] mb-3 uppercase tracking-[0.2em]">
              Tips Wellbeing 💡
            </h4>

            <p className="text-sm text-slate-700 leading-relaxed font-bold italic">
              "Tarik napas dalam-dalam selama 4 hitungan, tahan selama 7, dan
              buang selama 8, Teknik ini ampuh meredakan cemas"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Connected Parents Widget
// ─────────────────────────────────────────────────────────────

function ConnectedParentsWidget({ studentId }) {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!studentId) return;

    fetch("/api/family/active")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setParents(d.parents);
        }
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

              <p className="text-[10px] text-slate-400">
                {p.parent_email}
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard/student/family")}
              className="text-slate-300 hover:text-[#00adb5]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/dashboard/student/family")}
        className="w-full text-[10px] font-black text-slate-400 hover:text-[#00adb5] uppercase tracking-widest"
      >
        Kelola Koneksi Keluarga →
      </button>
    </div>
  );
}