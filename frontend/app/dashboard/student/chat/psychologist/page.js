"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MessageCircle, 
  Star, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  Loader2,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from "next-auth/react"; // Tambahkan import session

export default function StudentPsychologistListPage() {
  const { data: session } = useSession(); // Ambil data session
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const res = await fetch('/api/student/psychologists');
        const json = await res.json();
        if (json.success) setPsychologists(json.data);
      } catch (err) {
        console.error("Error fetching psychologists:", err);
      } finally {
        setLoading(false);
      }
    };

    // Pengecekan session sebelum fetch data
    if (session?.user?.id) {
      fetchPsychologists();
    }
    
  }, [session?.user?.id]); // Dependensi ID agar stabil dan tidak loop

  const filteredData = psychologists.filter(p => 
    p.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-slate-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/student/chat" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
              <ArrowLeft size={20} />
            </Link>
            <span className="text-[10px] font-black text-[#00adb5] uppercase tracking-[0.2em]">Konsultasi Profesional</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pilih Psikolog</h2>
          <p className="text-slate-500 mt-1 font-medium italic text-sm">Temukan teman bicara profesional yang siap membantumu kapan saja.</p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-[30px] border border-slate-200 shadow-sm">
        <div className="flex-1 flex items-center bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 focus-within:border-[#00adb5]/30 transition-all">
          <Search size={18} className="text-slate-300 mr-2" />
          <input 
            type="text" 
            placeholder="Cari nama psikolog..." 
            className="bg-transparent outline-none text-sm w-full font-semibold placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
          <Filter size={16} /> Filter Status
        </button>
      </div>

      {/* PSYCHOLOGIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-[#00adb5] mb-4" size={40} />
            <p className="text-sm font-bold text-slate-400">Menghubungkan ke pusat bantuan...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[40px] text-slate-400 font-medium">
            Maaf, tidak ada psikolog yang ditemukan.
          </div>
        ) : (
          filteredData.map((psy) => (
            <div key={psy._id} className="bg-white rounded-[40px] border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden">
              
              {/* Online Badge */}
              <div className={`absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                psy.isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${psy.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                {psy.isOnline ? 'Online' : 'Offline'}
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[32px] bg-slate-100 flex items-center justify-center text-3xl shadow-inner border-4 border-white">
                    {psy.fullname.charAt(0)}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-800 group-hover:text-[#00adb5] transition-colors">{psy.fullname}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Spesialis Psikologi Remaja</p>
                </div>

                <div className="flex items-center gap-6 py-2">
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-800">4.9</p>
                    <div className="flex text-amber-400 gap-0.5 mt-0.5"><Star size={10} fill="currentColor" /></div>
                  </div>
                  <div className="w-px h-6 bg-slate-100"></div>
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-800">80+</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Sesi Selesai</p>
                  </div>
                </div>

                <div className="w-full pt-4">
                  <Link 
                    href={`/dashboard/student/chat/psychologist/${psy._id}`}
                    className={`w-full py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm ${
                      psy.isOnline 
                      ? 'bg-[#00adb5] text-white shadow-[#00adb5]/20 hover:scale-[1.02]' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <MessageCircle size={16} /> {psy.isOnline ? 'Mulai Konsultasi' : 'Sedang Sibuk'}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* INFORMASI TAMBAHAN */}
      <div className="bg-slate-900 text-white p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10 text-center md:text-left">
          <h4 className="font-bold text-lg">Semua Sesi Bersifat Rahasia</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md font-medium">Privasimu adalah prioritas kami. Obrolan hanya bisa diakses oleh kamu dan psikolog pilihanmu.</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex -space-x-3">
             {[1,2,3].map(i => (
               <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">P</div>
             ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#00adb5]">12 Psikolog Aktif</p>
        </div>
      </div>

    </div>
  );
}