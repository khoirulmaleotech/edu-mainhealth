"use client";
import React from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  UserPlus, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function TeacherStudentsPage() {
  // Data Statistik untuk Guru [cite: 415-419]
  const statsData = [
    { label: "Total Siswa", value: "32", sub: "Aktif Semester Ini", color: "text-primary", icon: null },
    { label: "Butuh Perhatian", value: "3", sub: "Kasus Risiko Tinggi", color: "text-red-500", icon: <AlertCircle size={20} /> },
    { label: "Rata-rata Mood", value: "Stabil", sub: "Berdasarkan AI Insight", color: "text-secondary", icon: <TrendingUp size={20} /> }
  ];

  // Data Siswa sesuai Blueprint [cite: 421-424, 432-436]
  const studentsList = [
    { id: 1, name: "Budi Santoso", mood: "🤩", risk: "Low", talent: "Creative", lastActive: "2 menit lalu" },
    { id: 2, name: "Siti Aminah", mood: "😐", risk: "Low", talent: "Analytical", lastActive: "1 jam lalu" },
    { id: 3, name: "Rizky Ramadhan", mood: "😢", risk: "High", talent: "Communicative", lastActive: "Baru saja" },
    { id: 4, name: "Dewi Lestari", mood: "🙂", risk: "Medium", talent: "Empathetic", lastActive: "3 jam lalu" },
    { id: 5, name: "Aditya Pratama", mood: "🤩", risk: "Low", talent: "Analytical", lastActive: "5 jam lalu" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Data Siswa</h2>
          <p className="text-slate-500 mt-1 font-medium italic text-sm">Manajemen profil, kesejahteraan, dan potensi siswa Kelas 12A. [cite: 278-283]</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all uppercase tracking-widest">
          <UserPlus size={18} /> Tambah Siswa
        </button>
      </div>

      {/* QUICK STATS - Diperbaiki agar tidak ada error 's is not defined' */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((item, index) => (
          <div key={index} className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="flex justify-between items-start z-10">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                <h3 className={`text-3xl font-black ${item.color}`}>{item.value}</h3>
              </div>
              {item.icon && <div className={`${item.color} p-2 bg-slate-50 rounded-xl`}>{item.icon}</div>}
            </div>
            <p className="text-xs font-medium text-slate-400 mt-4 z-10">{item.sub}</p>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
          </div>
        ))}
      </div>

      {/* TABLE SECTION [cite: 430-436] */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center bg-slate-50 px-4 py-2.5 rounded-xl w-full max-w-sm border border-slate-100">
            <Search size={18} className="text-slate-400 mr-2" />
            <input type="text" placeholder="Cari nama siswa..." className="bg-transparent outline-none text-sm w-full font-medium" />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
              <Filter size={18} />
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Filter: Semua</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-5">Identitas Siswa [cite: 432]</th>
                <th className="px-8 py-5">Mood Terakhir [cite: 428]</th>
                <th className="px-8 py-5">Tingkat Risiko [cite: 434]</th>
                <th className="px-8 py-5">Bakat Dominan [cite: 286]</th>
                <th className="px-8 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {studentsList.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Aktif {student.lastActive}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-2xl" title={student.mood}>{student.mood}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                      student.risk === 'High' ? 'bg-red-50 text-red-500 border-red-100' :
                      student.risk === 'Medium' ? 'bg-orange-50 text-orange-500 border-orange-100' :
                      'bg-green-50 text-green-500 border-green-100'
                    }`}>
                      {student.risk} Risk [cite: 434]
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-xs text-slate-600">
                    {student.talent} [cite: 466]
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                        <ExternalLink size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex justify-center">
           <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1 transition-all">
             Tampilkan Lebih Banyak <ChevronRight size={14} />
           </button>
        </div>
      </div>
    </div>
  );
}