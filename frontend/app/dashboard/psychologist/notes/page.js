"use client";
import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Plus, Filter, Calendar, 
  User, Lock, Download, MoreVertical, 
  ChevronRight, ShieldCheck, Loader2 
} from 'lucide-react';

export default function PsychologistNotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/psychologist/notes');
      const json = await res.json();
      if (json.success) setNotes(json.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter(n => 
    n.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-slate-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Catatan Klinis <FileText className="text-[#00adb5]" size={32} />
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic text-sm md:text-base">Dokumentasi rahasia hasil intervensi dan observasi psikologis.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#00adb5] transition-all shadow-lg">
          <Plus size={18} /> Catatan Baru
        </button>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-[30px] border border-slate-200 shadow-sm">
        <div className="flex-1 flex items-center bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100 focus-within:border-[#00adb5]/30 transition-all">
          <Search size={18} className="text-slate-300 mr-2" />
          <input 
            type="text" 
            placeholder="Cari nama siswa atau topik..." 
            className="bg-transparent outline-none text-sm w-full font-semibold placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={16} /> Kategori
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Calendar size={16} /> Waktu
          </button>
        </div>
      </div>

      {/* NOTES LIST */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-[#00adb5] mb-4" size={40} />
            <p className="text-sm font-bold text-slate-400">Membuka brankas data medis...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[40px] text-slate-400 italic">
            Belum ada catatan klinis yang dibuat.
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note._id} className="bg-white rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      note.status === 'Finalized' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {note.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">#{note._id.slice(-6)}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-slate-800 group-hover:text-[#00adb5] transition-colors leading-tight">{note.topic}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <User size={14} className="text-[#00adb5]" /> {note.student}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Calendar size={14} className="text-slate-300" /> {note.date}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-2 italic">
                    "{note.summary}"
                  </p>
                </div>

                <div className="flex md:flex-col justify-end gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                  <button className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-50 text-slate-600 rounded-2xl font-bold text-[11px] uppercase tracking-wider hover:bg-[#00adb5] hover:text-white transition-all shadow-sm">
                    Detail <ChevronRight size={16} />
                  </button>
                  <div className="flex md:justify-center gap-2">
                    <button className="p-3 text-slate-300 hover:bg-slate-50 hover:text-slate-600 rounded-2xl transition-all"><Download size={18} /></button>
                    <button className="p-3 text-slate-300 hover:bg-slate-50 hover:text-slate-600 rounded-2xl transition-all"><MoreVertical size={18} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SECURITY FOOTER */}
      <div className="bg-[#00adb5]/5 border border-[#00adb5]/10 p-6 md:p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="p-4 bg-[#00adb5] text-white rounded-[24px] shadow-lg shadow-[#00adb5]/20">
            <Lock size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Privasi Data Medis Terjamin</h4>
            <p className="text-[11px] md:text-xs text-slate-400 font-medium max-w-md">Semua catatan dienkripsi end-to-end dan hanya dapat diakses oleh Psikolog yang berwenang sesuai standar HIPAA.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#00adb5] font-black text-[9px] uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-full border border-[#00adb5]/10">
          <ShieldCheck size={16} /> Secured System
        </div>
      </div>
    </div>
  );
}