"use client";
import React from 'react';
import { 
  Search, 
  Filter, 
  ClipboardList, 
  MessageCircle, 
  History, 
  AlertCircle,
  ChevronRight,
  Stethoscope,
  MoreHorizontal
} from 'lucide-react';

export default function PsychologistPatientsPage() {
  // Data Pasien Rujukan sesuai Struktur User
  const patients = [
    { 
      id: 1, 
      name: "Rizky Ramadhan", 
      origin: "Rujukan Guru BK (Pak Anwar)", 
      issue: "Indikasi Depresi & Cyberbullying", 
      priority: "Critical", 
      lastSession: "Belum ada",
      status: "Waiting"
    },
    { 
      id: 2, 
      name: "Sinta Wijaya", 
      origin: "AI Early Detection", 
      issue: "Kecemasan Akademik Berat", 
      priority: "High", 
      lastSession: "02 Mei 2026",
      status: "On-Going"
    },
    { 
      id: 3, 
      name: "Budi Santoso", 
      origin: "Self-Report", 
      issue: "Masalah Komunikasi Keluarga", 
      priority: "Medium", 
      lastSession: "28 April 2026",
      status: "Scheduled"
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Manajemen Pasien <Stethoscope className="text-primary" size={32} />
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic">Tinjau rujukan kasus dan kelola catatan konseling klinis.</p>
        </div>
        <div className="flex items-center bg-white px-5 py-3 rounded-2xl w-full max-w-md shadow-sm border border-slate-100">
          <Search size={18} className="text-slate-400 mr-2" />
          <input type="text" placeholder="Cari nama atau ID pasien..." className="bg-transparent outline-none text-sm w-full font-medium" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* PATIENT LIST TABLE */}
        <div className="lg:col-span-3 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Antrean Rujukan Aktif</h4>
            <button className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
              Filter Prioritas <Filter size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pasien & Asal</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Isu Utama</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Prioritas</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-800">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium italic">{p.origin}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} className={p.priority === 'Critical' ? 'text-red-500' : 'text-orange-400'} />
                        <span className="text-xs font-semibold text-slate-600">{p.issue}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        p.priority === 'Critical' ? 'bg-red-50 text-red-500' : 
                        p.priority === 'High' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                      }`}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-700">{p.status}</span>
                        <span className="text-[9px] text-slate-400">Sesi Terakhir: {p.lastSession}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm" title="Buka Catatan Klinis">
                          <ClipboardList size={18} />
                        </button>
                        <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50/30 text-center">
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
              Lihat Riwayat Pasien Selesai
            </button>
          </div>
        </div>

        {/* SIDEBAR ANALYTICS & TOOLS */}
        <div className="space-y-8">
          {/* PSYCHOLOGIST NOTES CARD */}
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                Quick Action ⚡
              </h4>
              <div className="space-y-3">
                <button className="w-full py-3 bg-primary rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                  <MessageCircle size={16} /> Konsultasi Baru
                </button>
                <button className="w-full py-3 bg-white/10 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
                  <History size={16} /> Rekap Bulanan
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary opacity-10 rounded-full blur-3xl"></div>
          </div>

          {/* INSIGHT CARD */}
          <div className="bg-secondary/10 p-8 rounded-[40px] border border-secondary/20 space-y-4">
            <h4 className="font-black text-[10px] text-secondary uppercase tracking-[0.2em]">Kapasitas Layanan</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-600">Beban Kerja</span>
                <span className="text-xs font-black text-slate-800">75%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-[75%] h-full bg-secondary rounded-full"></div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                Anda memiliki 3 antrean prioritas tinggi yang membutuhkan intervensi dalam 24 jam ke depan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}