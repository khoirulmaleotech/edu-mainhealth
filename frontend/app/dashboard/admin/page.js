"use client";
import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, ShieldAlert, ArrowUpRight, 
  Clock, CheckCircle2, MoreHorizontal, ExternalLink,
  Search, Bell, Filter, Download, LayoutDashboard, 
  ShieldCheck, HeartPulse
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-10 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Kontrol</h1>
          <p className="text-slate-400 font-medium mt-1">Selamat datang kembali, Super Admin. Pantau ekosistem EduMind Anda.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} /> Export Data
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#00adb5] text-white rounded-2xl text-xs font-bold shadow-lg shadow-[#00adb5]/20 hover:scale-[1.02] active:scale-95 transition-all">
            <LayoutDashboard size={16} /> Laporan Utama
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Siswa" value="12,482" icon={<Users className="text-[#00adb5]" />} trend="+12% bulan ini" />
        <StatCard title="Sekolah Aktif" value="48" icon={<Building2 className="text-blue-500" />} trend="+2 sekolah baru" />
        <StatCard title="Pakar Terverifikasi" value="156" icon={<CheckCircle2 className="text-green-500" />} trend="8 pending" />
        <StatCard title="Butuh Verifikasi" value="12" icon={<ShieldAlert className="text-amber-500" />} trend="Prioritas Tinggi" />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: VERIFICATION TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Clock size={20} />
              </div>
              <h3 className="font-black text-slate-800 text-lg">Antrean Verifikasi</h3>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Cari institusi..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#00adb5]/20 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Nama Institusi / Pakar</th>
                  <th className="px-8 py-5">Kategori</th>
                  <th className="px-8 py-5">Tanggal Daftar</th>
                  <th className="px-8 py-5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <VerificationRow name="SMA Negeri 1 Jakarta" sub="Jakarta Pusat" type="Sekolah" date="08 Mei 2026" />
                <VerificationRow name="Dr. Sarah Quinn, M.Psi" sub="SIPP: 12345-678" type="Psikolog" date="07 Mei 2026" />
                <VerificationRow name="SMK Maleo Sejahtera" sub="Tangerang Selatan" type="Sekolah" date="07 Mei 2026" />
                <VerificationRow name="Praktek Mandiri Harmoni" sub="Klinik Psikologi" type="Psikolog" date="06 Mei 2026" />
              </tbody>
            </table>
          </div>
          <div className="p-6 text-center border-t border-slate-50">
            <button className="text-xs font-black text-[#00adb5] hover:underline uppercase tracking-widest">Lihat Semua Antrean</button>
          </div>
        </div>

        {/* RIGHT: SYSTEM HEALTH & ACTIVITY */}
        <div className="space-y-8">
          {/* SYSTEM HEALTH */}
          <div className="bg-[#0b0e14] rounded-[35px] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00adb5]/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-lg">Status Sistem</h3>
                <HeartPulse className="text-[#00adb5] animate-pulse" />
              </div>
              <div className="space-y-5">
                <HealthItem label="API Server" status="Optimal" color="bg-[#00adb5]" />
                <HealthItem label="Database" status="Connected" color="bg-green-500" />
                <HealthItem label="Storage (S3)" status="92% Free" color="bg-blue-500" />
              </div>
              <hr className="my-8 border-white/5" />
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Uptime</p>
                  <p className="text-sm font-black text-white">99.98%</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Backup</p>
                  <p className="text-sm font-black text-white">2h ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-[35px] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 text-lg mb-6">Aksi Cepat</h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionButton label="Blast Notif" icon={<Bell size={18} />} color="bg-amber-50 text-amber-600" />
              <QuickActionButton label="Kelola Role" icon={<ShieldCheck size={18} />} color="bg-blue-50 text-blue-600" />
              <QuickActionButton label="Log Audit" icon={<Filter size={18} />} color="bg-slate-50 text-slate-600" />
              <QuickActionButton label="Setting AI" icon={<MoreHorizontal size={18} />} color="bg-green-50 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, icon, trend }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <ArrowUpRight size={18} className="text-slate-300" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <h2 className="text-2xl md:text-3xl font-black text-slate-800 mt-1">{value}</h2>
      <p className="text-[10px] font-bold text-green-500 mt-2 bg-green-50 inline-block px-2 py-1 rounded-lg italic">
        {trend}
      </p>
    </div>
  );
}

function VerificationRow({ name, sub, type, date }) {
  return (
    <tr className="hover:bg-slate-50/80 transition-all cursor-pointer group">
      <td className="px-8 py-5">
        <p className="font-bold text-slate-800 text-sm">{name}</p>
        <p className="text-[10px] text-slate-400 font-medium italic">{sub}</p>
      </td>
      <td className="px-8 py-5">
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
          type === 'Sekolah' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
        }`}>
          {type}
        </span>
      </td>
      <td className="px-8 py-5 text-[11px] font-bold text-slate-500">{date}</td>
      <td className="px-8 py-5 text-right">
        <button className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-[#00adb5] hover:border-[#00adb5]/20 rounded-xl shadow-sm transition-all group-hover:scale-110">
          <ExternalLink size={16} />
        </button>
      </td>
    </tr>
  );
}

function HealthItem({ label, status, color }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-white uppercase tracking-widest">{status}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
      </div>
    </div>
  );
}

function QuickActionButton({ label, icon, color }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[25px] transition-all hover:scale-105 active:scale-95 ${color} bg-opacity-50`}>
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}