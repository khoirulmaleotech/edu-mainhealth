"use client";
import React from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  User, 
  Lock, 
  Download,
  MoreVertical,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function PsychologistNotesPage() {
  // Data Catatan Klinis (Mock Data)
  const clinicalNotes = [
    { 
      id: "CLN-001", 
      student: "Rizky Ramadhan", 
      date: "06 Mei 2026", 
      topic: "Intervensi Cyberbullying - Sesi 1", 
      category: "Klinis",
      summary: "Siswa menunjukkan tanda-tanda kecemasan sosial akut setelah insiden di grup chat. Memulai teknik grounding...",
      status: "Finalized"
    },
    { 
      id: "CLN-002", 
      student: "Sinta Wijaya", 
      date: "04 Mei 2026", 
      topic: "Evaluasi Kecemasan Akademik", 
      category: "Edukasi",
      summary: "Siswa merasa tertekan dengan ekspektasi ujian akhir. Disarankan untuk mengikuti workshop manajemen stres...",
      status: "Draft"
    },
    { 
      id: "CLN-003", 
      student: "Budi Santoso", 
      date: "29 April 2026", 
      topic: "Konseling Dinamika Keluarga", 
      category: "Keluarga",
      summary: "Pertemuan dengan orang tua dilakukan. Ada progres dalam pola komunikasi di rumah...",
      status: "Finalized"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Catatan Klinis <FileText className="text-primary" size={32} />
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic text-sm">Dokumentasi rahasia hasil intervensi dan observasi psikologis.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">
            <Plus size={18} /> Catatan Baru
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
        <div className="flex-1 flex items-center bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100">
          <Search size={18} className="text-slate-400 mr-2" />
          <input type="text" placeholder="Cari nama siswa atau ID catatan..." className="bg-transparent outline-none text-sm w-full font-medium" />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={16} /> Kategori
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Calendar size={16} /> Rentang Waktu
          </button>
        </div>
      </div>

      {/* NOTES GRID/LIST */}
      <div className="grid grid-cols-1 gap-6">
        {clinicalNotes.map((note) => (
          <div key={note.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group overflow-hidden">
            <div className="p-8 flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    note.status === 'Finalized' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'
                  }`}>
                    {note.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{note.id}</span>
                </div>
                
                <div>
                  <h3 className="text-xl font-black text-slate-800 group-hover:text-primary transition-colors">{note.topic}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <User size={14} className="text-primary" /> {note.student}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Calendar size={14} /> {note.date}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-2">
                  "{note.summary}"
                </p>
              </div>

              <div className="flex md:flex-col justify-end gap-3 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
                <button className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold text-[11px] uppercase tracking-wider hover:bg-primary hover:text-white transition-all">
                  Lihat Detail <ChevronRight size={16} />
                </button>
                <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">
                  <Download size={18} />
                </button>
                <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SECURITY FOOTER */}
      <div className="bg-primary/5 border border-primary/10 p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
            <Lock size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Privasi Data Terjamin</h4>
            <p className="text-xs text-slate-500 font-medium">Semua catatan dienkripsi dan hanya dapat diakses oleh tenaga ahli medis yang berwenang.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
          <ShieldCheck size={18} /> ISO 27001 Certified
        </div>
      </div>
    </div>
  );
}