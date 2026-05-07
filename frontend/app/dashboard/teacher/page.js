"use client";
import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3, 
  MoreVertical,
  Filter,
  ArrowUpRight,
  ClipboardList,
} from 'lucide-react';

export default function TeacherPage() {
  const stats = [
    { label: "Total Siswa", value: "124", icon: <Users className="text-primary" />, trend: "+2% bulan ini" },
    { label: "Alert Kasus", value: "5", icon: <AlertTriangle className="text-red-500" />, trend: "Perlu tindakan segera", isAlert: true },
    { label: "Intervensi Aktif", value: "8", icon: <ClipboardList className="text-primary" />, trend: "Dalam proses" },
    { label: "Mood Rata-rata", value: "Stabil", icon: <CheckCircle className="text-secondary" />, trend: "Kondisi Kelas Baik" }
  ];

  const students = [
    { id: 1, name: "Budi Santoso", mood: "Sedih", risk: "High", trend: "Menurun", color: "bg-red-100 text-red-700" },
    { id: 2, name: "Siti Aminah", mood: "Biasa", risk: "Medium", trend: "Stabil", color: "bg-yellow-100 text-yellow-700" },
    { id: 3, name: "Ahmad Fauzi", mood: "Senang", risk: "Low", trend: "Meningkat", color: "bg-green-100 text-green-700" },
    { id: 4, name: "Larasati", mood: "Senang", risk: "Low", trend: "Stabil", color: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="space-y-10">
      {/* STATS CARDS [cite: 415-419] */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className={`p-7 bg-white rounded-[32px] shadow-sm border ${s.isAlert ? 'border-red-100 ring-4 ring-red-50/50' : 'border-slate-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">{s.icon}</div>
              <ArrowUpRight size={18} className="text-slate-300" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{s.label}</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{s.value}</h3>
              <p className={`text-[11px] mt-2 font-bold ${s.isAlert ? 'text-red-500' : 'text-slate-400'}`}>{s.trend}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* HEATMAP TABLE [cite: 420-424, 194] */}
        <div className="xl:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
            <div>
              <h4 className="text-xl font-bold text-slate-800 tracking-tight">Heatmap Kesejahteraan Kelas</h4>
              <p className="text-sm text-slate-400 font-medium italic">Monitoring kondisi emosional real-time siswa [cite: 123]</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 border border-slate-100 hover:bg-slate-100 transition-colors">
              <Filter size={14} /> Filter Kelas
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr className="text-slate-400 text-[10px] uppercase tracking-[0.15em] font-black">
                  <th className="px-8 py-5">Nama Siswa</th>
                  <th className="px-8 py-5">Mood</th>
                  <th className="px-8 py-5">Risiko</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-700">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wide">NISN: 0092831{s.id}</p>
                    </td>
                    <td className="px-8 py-6 text-sm">
                      <span className="text-lg mr-2">{s.mood === "Senang" ? '🙂' : s.mood === "Sedih" ? '😢' : '😐'}</span>
                      {s.mood}
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${s.risk === 'High' ? 'bg-red-500 w-full' : s.risk === 'Medium' ? 'bg-secondary w-1/2' : 'bg-green-400 w-1/4'}`}></div>
                      </div>
                    </td>
                    <td className="px-8 py-6 uppercase">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-tight ${s.color}`}>
                        {s.risk === 'High' ? 'Intervensi' : s.risk === 'Medium' ? 'Observasi' : 'Stabil'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all">
                        <MoreVertical size={18} className="text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI SYSTEM EXPERIENCE & RECOMMENDATIONS [cite: 487-497, 204] */}
        <div className="space-y-8">
          <div className="bg-primary p-9 rounded-[40px] text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <BarChart3 size={20} className="text-secondary" />
                </div>
                <h4 className="font-bold text-xl">AI Alert Center 🤖</h4>
              </div>
              
              <div className="space-y-5">
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-[24px] border border-white/20">
                  <p className="text-[10px] font-black text-secondary tracking-widest uppercase mb-2">Deteksi Perundungan [cite: 20]</p>
                  <p className="text-sm leading-relaxed font-medium">
                    Sistem mendeteksi anomali pada pola interaksi siswa <b className="text-secondary">Budi Santoso</b> melalui input laporan anonim.
                  </p>
                </div>

                <button className="w-full py-4 bg-secondary text-slate-900 rounded-[20px] font-black text-sm hover:scale-[1.02] transition-transform shadow-lg shadow-yellow-500/20 uppercase tracking-wider">
                  Mulai Intervensi [cite: 67]
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white opacity-10 rounded-full blur-3xl"></div>
          </div>

          {/* ANALYTICS SUMMARY [cite: 425-429] */}
          <div className="bg-white p-9 rounded-[40px] border border-slate-100 shadow-sm">
            <h4 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Efikasi Intervensi [cite: 78]</h4>
            <div className="space-y-7">
              <ProgressIndicator label="Kasus Teratasi" value={82} color="bg-primary" />
              <ProgressIndicator label="Response Time" value={95} color="bg-secondary" />
              <ProgressIndicator label="Data Integrity" value={100} color="bg-green-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressIndicator({ label, value, color }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-slate-700">{value}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}