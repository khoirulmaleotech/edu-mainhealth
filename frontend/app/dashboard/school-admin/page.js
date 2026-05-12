"use client";
import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Users,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  FileText,
  ExternalLink,
  Search,
  Bell,
  FileDown,
  LayoutDashboard,
  HeartPulse,
  Activity,
  AlertCircle,
  Loader2,
  School2Icon,
  FileExclamationPoint,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// HELPER: Buat ID anonim yang KONSISTEN dari reporterId.
// Route mengembalikan reporterId agar frontend bisa membuat ID
// anonim yang stabil (tidak berubah antar render) via hash ringan.
// ─────────────────────────────────────────────────────────────
function makeAnonymousId(reporterId = "") {
  let hash = 0;
  for (let i = 0; i < reporterId.length; i++) {
    hash = (hash * 31 + reporterId.charCodeAt(i)) >>> 0;
  }
  // Tiga digit 100–999 supaya selalu ada 3 angka
  return 100 + (hash % 900);
}

export default function SchoolDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/school-admin/dashboard");
        const json = await res.json();
        if (!json.success) throw new Error(json.message ?? "Gagal memuat data");
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // ── Derived values ──────────────────────────────────────────
  const stats = data?.stats ?? {};
  const riskDistribution = data?.riskDistribution ?? {
    low: 100,
    medium: 0,
    high: 0,
  };

  // Filter laporan berdasarkan search (nama / tipe / status)
  const filteredReports = (data?.incidentReports ?? []).filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q) ||
      r.class?.toLowerCase().includes(q)
    );
  });

  // ── Skeleton / Error states ─────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 size={36} className="animate-spin text-[#00adb5]" />
          <p className="text-sm font-semibold">Memuat data dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-8">
        <div className="bg-white border border-rose-100 rounded-3xl p-10 max-w-md text-center shadow-lg">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-black text-slate-800 mb-2">
            Gagal Memuat Dashboard
          </h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#00adb5] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#00adb5]/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-10 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Dashboard Sekolah
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            Pantau kesejahteraan mental dan laporan insiden di lingkungan
            sekolah Anda.
          </p>
        </div>
        {/* <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <FileDown size={16} /> Laporan CSV
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#00adb5] text-white rounded-2xl text-xs font-bold shadow-lg shadow-[#00adb5]/20 hover:scale-[1.02] active:scale-95 transition-all">
            <Activity size={16} /> Analitik Penuh
          </button>
        </div> */}
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Siswa Aktif"
          value={stats.totalStudents ?? "-"}
          icon={<GraduationCap className="text-[#00adb5]" />}
          trend="Terdaftar di sistem"
          trendColor="text-[#00adb5]"
          trendBg="bg-[#00adb5]/10"
        />
        <StatCard
          title="Guru Terhubung"
          value={stats.totalTeachers ?? "-"}
          icon={<Users className="text-blue-500" />}
          // Guru = semua teacher di sekolah (wali kelas & BK, lihat route comment)
          trend="Wali Kelas & BK"
          trendColor="text-blue-500"
          trendBg="bg-blue-50"
        />
        <StatCard
          title="Laporan Insiden"
          value={stats.totalIncidents ?? "-"}
          icon={<FileText className="text-amber-500" />}
          // pendingIncidents diambil dari route untuk label dinamis
          trend={
            stats.pendingIncidents != null
              ? `${stats.pendingIncidents} Menunggu respon`
              : "Memuat…"
          }
          trendColor="text-amber-600"
          trendBg="bg-amber-50"
        />
        <StatCard
          title="Siswa Risiko Tinggi"
          value={stats.highRiskStudents ?? "-"}
          icon={<ShieldAlert className="text-rose-500" />}
          trend="Butuh Intervensi Pakar"
          trendColor="text-rose-600"
          trendBg="bg-rose-50"
        />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: INCIDENT TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                <ShieldAlert size={20} />
              </div>
              <h3 className="font-black text-slate-800 text-lg">
                Laporan Masuk Terbaru
              </h3>
            </div>
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={16}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari laporan…"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#00adb5]/20 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Nama / Anonim</th>
                  <th className="px-8 py-5">Kategori</th>
                  <th className="px-8 py-5">Status & Risiko</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-8 py-12 text-center text-sm text-slate-400 font-medium"
                    >
                      {search
                        ? "Tidak ada laporan yang cocok."
                        : "Belum ada laporan masuk."}
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    // ── Anonimisasi di frontend sesuai komentar route ──
                    // Skema tidak punya is_anonymous; frontend yang bertanggung
                    // jawab menampilkan nama anonim berdasarkan kebijakan privasi.
                    // Saat ini: SEMUA pelapor ditampilkan dengan nama asli jika ada,
                    // atau "Siswa Tidak Dikenal" dari route → tampilkan sebagai anonim.
                    const isUnknown = report.name === "Siswa Tidak Dikenal";
                    const displayName = isUnknown
                      ? `Anonim (#ID-${makeAnonymousId(report.reporterId)})`
                      : report.name;

                    return (
                      <IncidentRow
                        key={report.id}
                        id={report.id}
                        name={displayName}
                        classInfo={report.class ?? "-"}
                        type={report.type ?? "-"}
                        status={report.status}
                        risk={report.risk}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: SCHOOL WELLBEING & ACTIONS */}
        <div className="space-y-8">
          {/* WELLBEING STATUS */}
          <div className="bg-[#0b0e14] rounded-[35px] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00adb5]/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-lg">Distribusi Risiko Siswa</h3>
                <HeartPulse className="text-[#00adb5] animate-pulse" />
              </div>
              <div className="space-y-5">
                {/* Persentase dari riskDistribution API */}
                <RiskItem
                  label="Risiko Rendah (Aman)"
                  percentage={`${riskDistribution.low}%`}
                  color="bg-emerald-500"
                />
                <RiskItem
                  label="Risiko Sedang (Pantau)"
                  percentage={`${riskDistribution.medium}%`}
                  color="bg-amber-500"
                />
                <RiskItem
                  label="Risiko Tinggi (Intervensi)"
                  percentage={`${riskDistribution.high}%`}
                  color="bg-rose-500"
                />
              </div>

              {/*
               * CATATAN: Tren Kesejahteraan ("Membaik" / "Memburuk") DIHAPUS
               * karena skema tidak menyimpan snapshot historis agregat per sekolah.
               * Implementasi yang benar butuh scheduled job (wellbeing_snapshots).
               * Lihat komentar IMPOSSIBLE di route handler.
               */}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-[35px] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 text-lg mb-6">
              Aksi Cepat Sekolah
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionButton
                label="Lihat Laporan"
                href="/dashboard/reports"
                icon={<FileExclamationPoint size={18} />}
                color="bg-rose-50 text-rose-500"
              />
              <QuickActionButton
                label="Assign Wali kelas"
                href="/dashboard/homeroom"
                icon={<Users size={18} />}
                color="bg-[#00adb5]/10 text-[#00adb5]"
              />
              <QuickActionButton
                label="Update Profil Sekolah"
                href="/dashboard/profile"
                icon={<School2Icon size={18} />}
                color="bg-amber-50 text-amber-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function StatCard({ title, value, icon, trend, trendColor, trendBg }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {title}
      </p>
      <h2 className="text-2xl md:text-3xl font-black text-slate-800 mt-1">
        {value}
      </h2>
      <p
        className={`text-[10px] font-bold mt-2 ${trendColor} ${trendBg} inline-block px-2 py-1 rounded-lg italic`}
      >
        {trend}
      </p>
    </div>
  );
}

function IncidentRow({ id, name, classInfo, type, status, risk }) {
  const getRiskColor = (r) => {
    if (r === "Tinggi") return "text-rose-600 bg-rose-50";
    if (r === "Sedang") return "text-amber-600 bg-amber-50";
    return "text-emerald-600 bg-emerald-50";
  };

  const getStatusColor = (s) => {
    if (s === "Menunggu") return "border-amber-200 text-amber-600";
    if (s === "Selesai") return "border-emerald-200 text-emerald-600";
    return "border-blue-200 text-blue-600";
  };

 

  return (
    <tr
      className="hover:bg-slate-50/80 transition-all cursor-pointer group"
    >
      <td className="px-8 py-5">
        <p className="font-bold text-slate-800 text-sm">{name}</p>
        <p className="text-[10px] text-slate-400 font-medium italic">
          {classInfo}
        </p>
      </td>
      <td className="px-8 py-5">
        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600">
          {type}
        </span>
      </td>
      <td className="px-8 py-5 flex flex-col gap-1 items-start">
        <span
          className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getStatusColor(status)}`}
        >
          {status}
        </span>
        <span
          className={`px-2 py-0.5 rounded text-[9px] font-black ${getRiskColor(risk)}`}
        >
          Risiko {risk}
        </span>
      </td>
      
    </tr>
  );
}

function RiskItem({ label, percentage, color }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <span className="text-xs font-black text-white">{percentage}</span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-700`}
          style={{ width: percentage }}
        />
      </div>
    </div>
  );
}

function QuickActionButton({ label, icon, color, href }) {
  return (
    <a 
      href={href} 
      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[25px] transition-all hover:scale-105 active:scale-95 ${color} bg-opacity-50 cursor-pointer`}
    >
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest text-center">
        {label}
      </span>
    </a>
  );
}
