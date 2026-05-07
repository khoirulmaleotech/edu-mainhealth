"use client";
import React from 'react';
import { 
  Heart, 
  Activity, 
  ShieldCheck, 
  Info, 
  AlertTriangle, 
  Calendar,
  CloudRain,
  Sun,
  ArrowUpRight
} from 'lucide-react';

export default function ParentWellbeingPage() {
  // Data indikator kesejahteraan
  const indicators = [
    { label: "Manajemen Stres", value: 78, status: "Stabil", color: "bg-primary" },
    { label: "Kualitas Mood", value: 82, status: "Sangat Baik", color: "bg-secondary" },
    { label: "Resiliensi", value: 65, status: "Perlu Dukungan", color: "bg-orange-400" },
    { label: "Interaksi Sosial", value: 90, status: "Aktif", color: "bg-green-500" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          Wellbeing Report <Heart className="text-red-500 fill-red-500" size={28} />
        </h2>
        <p className="text-slate-500 font-medium italic text-sm">Analisis mendalam kondisi psikologis Rizky minggu ini.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* EMOTIONAL INDEX MAIN CARD */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-12">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Indeks Kebahagiaan</h4>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
               <Calendar size={14} className="text-slate-400" />
               <span className="text-[10px] font-bold text-slate-500 uppercase italic">Mei 2026</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
             {/* Progress Ring Visual */}
             <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                  <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="628" strokeDashoffset="125" className="text-primary transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-5xl font-black text-slate-800 tracking-tighter">80%</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sangat Sehat</span>
                </div>
             </div>

             <div className="flex-1 space-y-6 w-full">
                {indicators.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-slate-600">{item.label}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.status}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }}></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-[30px] border border-slate-100">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sun size={14} className="text-secondary" /> Observasi Sistem
            </h5>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              "Rizky menunjukkan pemulihan yang cepat setelah periode ujian. Penggunaan fitur meditasi di aplikasi meningkat, yang membantu stabilitas emosinya tetap terjaga di angka 80%."
            </p>
          </div>
        </div>

        {/* SIDEBAR: ACTION & SAFETY */}
        <div className="space-y-8">
          {/* PARENTAL ADVICE CARD */}
          <div className="bg-primary p-9 rounded-[40px] text-white shadow-xl shadow-primary/30 relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h4 className="font-bold text-lg flex items-center gap-2 text-secondary">
                Saran Pekan Ini <ArrowUpRight size={20} />
              </h4>
              <p className="text-sm leading-relaxed font-semibold italic opacity-90">
                "Berikan apresiasi pada Rizky atas kemampuannya mengelola waktu belajar. Pujian kecil akan sangat meningkatkan resiliensinya saat ini."
              </p>
              <button className="w-full py-4 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary hover:text-slate-900 transition-all shadow-lg">
                Panduan Komunikasi
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* RISK MONITORING */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Risiko</h4>
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm">
                  <ShieldCheck size={24} />
               </div>
               <div>
                  <p className="text-xs font-black text-green-600 uppercase">Aman</p>
                  <p className="text-[10px] text-green-700 font-medium tracking-tight">Tidak ada indikasi krisis.</p>
               </div>
            </div>
          </div>

          {/* PRIVACY INFO */}
          <div className="p-6 border-2 border-dashed border-slate-100 rounded-[30px] flex items-start gap-4">
             <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                <Info size={18} />
             </div>
             <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-tighter">
                Laporan ini dibuat secara otomatis oleh AI berdasarkan analisis sentimen dan aktivitas aplikasi, tanpa membaca pesan teks secara manual.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}