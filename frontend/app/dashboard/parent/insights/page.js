"use client";
import React from 'react';
import { 
  BookOpen, 
  PlayCircle, 
  Star, 
  Search, 
  Filter, 
  ChevronRight, 
  Sparkles,
  Bookmark,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function ParentInsightsPage() {
  // Data Artikel Edukasi
  const resources = [
    { 
      title: "Mendengar Tanpa Menghakimi: Teknik Validasi Emosi", 
      type: "Artikel", 
      time: "5 Menit", 
      category: "Parenting",
      img: "bg-primary/10",
      featured: true
    },
    { 
      title: "Mengenali Tanda-tanda Cyberbullying pada Remaja", 
      type: "Video", 
      time: "12 Menit", 
      category: "Safety",
      img: "bg-secondary/10",
      featured: false
    },
    { 
      title: "Membantu Anak Menentukan Jurusan Kuliah yang Tepat", 
      type: "Panduan", 
      time: "10 Menit", 
      category: "Karir",
      img: "bg-slate-100",
      featured: false
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Wawasan Parenting <BookOpen className="text-primary" size={28} />
          </h2>
          <p className="text-slate-500 font-medium italic text-sm">Tips dan panduan untuk mendampingi setiap langkah pertumbuhan Rizky.</p>
        </div>
        <div className="flex items-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 w-full max-w-sm">
           <Search size={18} className="text-slate-400 mr-2" />
           <input type="text" placeholder="Cari topik..." className="bg-transparent outline-none text-sm w-full font-medium" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* MAIN FEED: ARTICLES & VIDEOS */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rekomendasi Untuk Anda</h4>
            <div className="flex gap-2">
               <button className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm">
                  <Filter size={16} />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resources.map((res, i) => (
              <div key={i} className="group bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer overflow-hidden flex flex-col">
                 <div className={`h-48 ${res.img} flex items-center justify-center group-hover:scale-105 transition-transform duration-700 relative`}>
                    {res.type === "Video" ? (
                      <PlayCircle size={48} className="text-primary opacity-40" />
                    ) : (
                      <BookOpen size={48} className="text-secondary opacity-40" />
                    )}
                    {res.featured && (
                      <span className="absolute top-4 left-4 bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">Terpopuler</span>
                    )}
                 </div>
                 <div className="p-8 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest">{res.category}</span>
                       <h3 className="font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors text-lg">{res.title}</h3>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                       <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          <span className="flex items-center gap-1"><Clock size={12} /> {res.time}</span>
                          <span>•</span>
                          <span>{res.type}</span>
                       </div>
                       <Bookmark size={16} className="text-slate-200 hover:text-secondary transition-colors" />
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR: TOPICS & WEEKLY TIP */}
        <div className="space-y-8">
          {/* WEEKLY FOCUS CARD */}
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <h4 className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <Sparkles size={16} fill="currentColor" /> Fokus Pekan Ini
                </h4>
                <h3 className="text-xl font-bold mb-4 tracking-tight">Membangun Komunikasi Dua Arah</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                   Minggu ini, cobalah teknik "Active Listening". Fokus mendengarkan tanpa memberikan nasihat kecuali diminta oleh anak.
                </p>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                   Pelajari Tekniknya <ArrowRight size={14} />
                </button>
             </div>
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary opacity-20 rounded-full blur-3xl"></div>
          </div>

          {/* TOPICS LIST */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Topik Terkait</h4>
             <div className="space-y-2">
                {["Kesehatan Mental", "Persiapan Kuliah", "Gaya Belajar", "Keamanan Digital"].map((topic, i) => (
                  <button key={i} className="w-full flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                     <span className="text-xs font-bold text-slate-700">{topic}</span>
                     <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-all" />
                  </button>
                ))}
             </div>
          </div>

          {/* SAVE THE DATE CARD */}
          <div className="bg-secondary/10 p-8 rounded-[40px] border border-secondary/20">
             <div className="flex items-center gap-3 mb-4">
                <Star className="text-secondary fill-secondary" size={20} />
                <h4 className="font-bold text-slate-900 text-sm tracking-tight">Webinar Parenting</h4>
             </div>
             <p className="text-[11px] text-slate-700 leading-relaxed font-semibold italic">
                "Cara Menghadapi Tekanan Akademik di Kelas 12" — Sabtu ini pukul 19:00 WIB.
             </p>
             <button className="w-full mt-6 py-3 bg-secondary text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform">Ikuti Sesi</button>
          </div>
        </div>
      </div>
    </div>
  );
}