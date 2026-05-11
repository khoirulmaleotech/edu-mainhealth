"use client";
import React, { useState } from 'react';
import { 
  GraduationCap, Users, ShieldAlert, ArrowUpRight, 
  Clock, CheckCircle2, FileText, ExternalLink,
  Search, Bell, FileDown, LayoutDashboard, 
  HeartPulse, UserPlus, Activity
} from 'lucide-react';

export default function SchoolDashboardPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-10 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Sekolah</h1>
          <p className="text-slate-400 font-medium mt-1">Pantau kesejahteraan mental dan laporan insiden di lingkungan sekolah Anda.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <FileDown size={16} /> Laporan CSR
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#00adb5] text-white rounded-2xl text-xs font-bold shadow-lg shadow-[#00adb5]/20 hover:scale-[1.02] active:scale-95 transition-all">
            <Activity size={16} /> Analitik Penuh
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Siswa Aktif" value="842" icon={<GraduationCap className="text-[#00adb5]" />} trend="Terdaftar di sistem" trendColor="text-[#00adb5]" trendBg="bg-[#00adb5]/10" />
        <StatCard title="Guru Terhubung" value="32" icon={<Users className="text-blue-500" />} trend="Wali Kelas & BK" trendColor="text-blue-500" trendBg="bg-blue-50" />
        <StatCard title="Laporan Insiden" value="5" icon={<FileText className="text-amber-500" />} trend="2 Menunggu respon" trendColor="text-amber-600" trendBg="bg-amber-50" />
        <StatCard title="Siswa Risiko Tinggi" value="3" icon={<ShieldAlert className="text-rose-500" />} trend="Butuh Intervensi Pakar" trendColor="text-rose-600" trendBg="bg-rose-50" />
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
              <h3 className="font-black text-slate-800 text-lg">Laporan Masuk Terbaru</h3>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Cari laporan..." 
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
                  <th className="px-8 py-5 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <IncidentRow name="Anonim (#ID-992)" classInfo="Kelas X-IPA 2" type="Verbal Bullying" status="Menunggu" risk="Tinggi" />
                <IncidentRow name="Budi Purnomo" classInfo="Kelas XI-IPS 1" type="Cyberbullying" status="Diproses" risk="Sedang" />
                <IncidentRow name="Anonim (#ID-881)" classInfo="Kelas XII-IPA 4" type="Social Exclusion" status="Selesai" risk="Rendah" />
                <IncidentRow name="Siti Aisyah" classInfo="Kelas X-IPA 1" type="Mental Crisis (AI)" status="Menunggu" risk="Tinggi" />
              </tbody>
            </table>
          </div>
          <div className="p-6 text-center border-t border-slate-50">
            <button className="text-xs font-black text-[#00adb5] hover:underline uppercase tracking-widest">Lihat Semua Laporan</button>
          </div>
        </div>

        {/* RIGHT: SCHOOL WELLBEING & ACTIONS */}
        <div className="space-y-8">
          
          {/* WELLBEING STATUS */}
          <div className="bg-[#0b0e14] rounded-[35px] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00adb5]/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-lg">Distribusi Risiko Siswa</h3>
                <HeartPulse className="text-[#00adb5] animate-pulse" />
              </div>
              <div className="space-y-5">
                <RiskItem label="Risiko Rendah (Aman)" percentage="82%" color="bg-emerald-500" />
                <RiskItem label="Risiko Sedang (Pantau)" percentage="15%" color="bg-amber-500" />
                <RiskItem label="Risiko Tinggi (Intervensi)" percentage="3%" color="bg-rose-500" />
              </div>
              <hr className="my-8 border-white/5" />
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Tren Kesejahteraan</p>
                  <p className="text-sm font-black text-emerald-400 flex items-center gap-1 mt-1">
                    <ArrowUpRight size={14} /> Membaik
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-[35px] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 text-lg mb-6">Aksi Cepat Sekolah</h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionButton label="Tambah Siswa" icon={<UserPlus size={18} />} color="bg-blue-50 text-blue-600" />
              <QuickActionButton label="Assign Guru" icon={<Users size={18} />} color="bg-[#00adb5]/10 text-[#00adb5]" />
              <QuickActionButton label="Blast Notif" icon={<Bell size={18} />} color="bg-amber-50 text-amber-600" />
              <QuickActionButton label="Kontak Pakar" icon={<HeartPulse size={18} />} color="bg-rose-50 text-rose-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, icon, trend, trendColor, trendBg }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <h2 className="text-2xl md:text-3xl font-black text-slate-800 mt-1">{value}</h2>
      <p className={`text-[10px] font-bold mt-2 ${trendColor} ${trendBg} inline-block px-2 py-1 rounded-lg italic`}>
        {trend}
      </p>
    </div>
  );
}

function IncidentRow({ name, classInfo, type, status, risk }) {
  const getRiskColor = (r) => {
    if (r === 'Tinggi') return 'text-rose-600 bg-rose-50';
    if (r === 'Sedang') return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const getStatusColor = (s) => {
    if (s === 'Menunggu') return 'border-amber-200 text-amber-600';
    if (s === 'Selesai') return 'border-emerald-200 text-emerald-600';
    return 'border-blue-200 text-blue-600';
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-all cursor-pointer group">
      <td className="px-8 py-5">
        <p className="font-bold text-slate-800 text-sm">{name}</p>
        <p className="text-[10px] text-slate-400 font-medium italic">{classInfo}</p>
      </td>
      <td className="px-8 py-5">
        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600">
          {type}
        </span>
      </td>
      <td className="px-8 py-5 flex flex-col gap-1 items-start">
        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getStatusColor(status)}`}>
          {status}
        </span>
        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${getRiskColor(risk)}`}>
          Risiko {risk}
        </span>
      </td>
      <td className="px-8 py-5 text-right">
        <button className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-[#00adb5] hover:border-[#00adb5]/20 rounded-xl shadow-sm transition-all group-hover:scale-110">
          <ExternalLink size={16} />
        </button>
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
        <div className={`h-full ${color}`} style={{ width: percentage }}></div>
      </div>
    </div>
  );
}

function QuickActionButton({ label, icon, color }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[25px] transition-all hover:scale-105 active:scale-95 ${color} bg-opacity-50`}>
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest text-center">{label}</span>
    </button>
  );
}