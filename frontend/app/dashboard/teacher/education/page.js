"use client";
import React from 'react';
import { 
  PlayCircle, 
  BookOpen, 
  FileText, 
  Search, 
  Clock, 
  Star, 
  ChevronRight,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export default function TeacherEducationPage() {
  // Data Konten Edukasi [cite: 476-485]
  const courses = [
    { 
      id: 1, 
      title: "Mendeteksi Dini Gejala Depresi pada Remaja", 
      category: "Mental Health", 
      type: "Video", 
      duration: "15 Menit", 
      rating: 4.9,
      img: "bg-primary/20"
    },
    { 
      id: 2, 
      title: "Teknik Mediasi Konflik Antar Siswa", 
      category: "Communication", 
      type: "Modul", 
      duration: "10 Halaman", 
      rating: 4.8,
      img: "bg-secondary/20"
    },
    { 
      id: 3, 
      title: "Membangun Ekosistem Sekolah Aman (Anti-Bullying)", 
      category: "School Safety", 
      type: "Webinar", 
      duration: "45 Menit", 
      rating: 5.0,
      img: "bg-blue-100"
    }
  ];

  const articles = [
    { title: "Memahami Gen Z: Cara Berkomunikasi yang Efektif", date: "05 Mei 2026", readTime: "5 min" },
    { title: "Panduan Penggunaan Dashboard EduMind untuk Intervensi", date: "02 Mei 2026", readTime: "8 min" },
    { title: "Tanda-tanda Tersembunyi Cyberbullying", date: "28 April 2026", readTime: "6 min" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HEADER SECTION [cite: 412] */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Edukasi Guru <GraduationCap className="text-primary" size={32} />
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic">Tingkatkan kapasitas diri untuk mendukung kesejahteraan siswa. [cite: 200]</p>
        </div>
        <div className="flex items-center bg-white px-4 py-2.5 rounded-2xl w-full max-w-md shadow-sm border border-slate-100">
          <Search size={18} className="text-slate-400 mr-2" />
          <input type="text" placeholder="Cari topik atau materi..." className="bg-transparent outline-none text-sm w-full font-medium" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FEATURED COURSES  */}
        <div className="lg:col-span-2 space-y-8">
          <h4 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-widest text-xs opacity-50">Kursus Pilihan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer overflow-hidden">
                <div className={`h-48 ${course.img} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                  {course.type === "Video" ? <PlayCircle size={48} className="text-primary opacity-40" /> : <BookOpen size={48} className="text-secondary opacity-40" />}
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{course.category}</span>
                    <div className="flex items-center gap-1 text-secondary">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] font-bold text-slate-400">{course.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors">{course.title}</h3>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={14} />
                      <span className="text-[10px] font-bold uppercase">{course.duration}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{course.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR: ARTICLES & TIPS [cite: 255-259] */}
        <div className="space-y-8">
          {/* DAILY TIP CARD */}
          <div className="bg-primary p-8 rounded-[40px] text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-secondary">
                Daily Tip <Sparkles size={20} />
              </h4>
              <p className="text-sm opacity-90 leading-relaxed font-medium italic">
                "Validasi emosi siswa adalah langkah pertama intervensi yang sukses. Dengarkan tanpa menghakimi."
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* RECENT ARTICLES [cite: 483] */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Artikel Terbaru</h4>
            <div className="space-y-6">
              {articles.map((article, index) => (
                <div key={index} className="group cursor-pointer">
                  <h5 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors leading-relaxed mb-1">
                    {article.title}
                  </h5>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    <span>{article.date}</span>
                    <span>{article.readTime} Baca</span>
                  </div>
                  {index !== articles.length - 1 && <hr className="mt-6 border-slate-50" />}
                </div>
              ))}
            </div>
            <button className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-2">
              Lihat Semua <ChevronRight size={14} />
            </button>
          </div>

          {/* RESOURCE DOWNLOAD */}
          <div className="bg-secondary/10 p-8 rounded-[40px] border border-secondary/20">
            <h4 className="font-bold text-slate-900 text-sm mb-4">Download Panduan PDF</h4>
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm cursor-pointer hover:scale-[1.02] transition-transform">
              <FileText className="text-secondary" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">SOP Penanganan Bullying.pdf</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">2.4 MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}