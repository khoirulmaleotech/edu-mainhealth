"use client";
import React from 'react';
import { 
  MessageCircle, 
  ShieldAlert, 
  Star, 
  Wind, 
} from 'lucide-react';

export default function StudentPage() {
  const moodEmojis = [
    { emoji: "😢", label: "Sedih" },
    { emoji: "😕", label: "Bingung" },
    { emoji: "😐", label: "Biasa" },
    { emoji: "🙂", label: "Senang" },
    { emoji: "🤩", label: "Hebat" }
  ];

  const quickAccess = [
    { title: "Curhat Aman", icon: <MessageCircle className="text-primary" />, color: "bg-[#00adb5]/10", desc: "Ngobrol bareng AI Mood Buddy" },
    { title: "Lapor Bullying", icon: <ShieldAlert className="text-red-500" />, color: "bg-red-50", desc: "Laporkan tindakan tidak nyaman" },
    { title: "Talent Mapping", icon: <Star className="text-secondary" />, color: "bg-[#fbcd2b]/15", desc: "Temukan minat dan bakatmu" },
    { title: "Relaksasi", icon: <Wind className="text-primary" />, color: "bg-[#00adb5]/5", desc: "Latihan pernapasan & ketenangan" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Halo, Student! 👋</h2>
          <p className="text-slate-500 mt-1 font-medium">Senang melihatmu kembali. Bagaimana kabarmu hari ini?</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
          <p className="text-sm font-bold text-slate-600 pl-2">Mood Check-in:</p>
          <div className="flex gap-3">
            {moodEmojis.map((m, i) => (
              <button key={i} title={m.label} className="text-2xl hover:scale-125 transition-transform active:scale-95">
                {m.emoji}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickAccess.map((item, i) => (
              <div key={i} className={`group p-8 rounded-[35px] ${item.color} border border-transparent hover:border-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer`}>
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  {React.cloneElement(item.icon, { size: 28 })}
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-primary p-9 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="relative z-10 max-w-xl">
              <h4 className="text-secondary font-black text-xl mb-4 flex items-center gap-2 uppercase tracking-widest">
                Insight Hari Ini ✨
              </h4>
              <p className="text-lg opacity-95 leading-relaxed font-bold italic">
                "Kamu sudah menunjukkan kemajuan besar dalam mengelola emosi minggu ini. Tetap semangat, setiap langkah kecil sangat berarti!"
              </p>
              <button className="mt-8 bg-white/20 hover:bg-white/30 backdrop-blur-md px-8 py-3 rounded-2xl text-sm font-bold transition-all border border-white/10 uppercase tracking-wide">
                Lihat Analisis Detail
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-secondary opacity-10 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[35px] shadow-sm border border-slate-100">
            <h4 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-tight">Progress Mingguan</h4>
            <div className="space-y-8">
              <ProgressItem label="Mood Stability" value={75} color="bg-primary" />
              <ProgressItem label="Interaksi AI" value={40} color="bg-secondary" />
              <ProgressItem label="Misi Harian" value={90} color="bg-green-400" />
            </div>
          </div>

          <div className="bg-secondary/10 p-9 rounded-[35px] border border-secondary/20 relative overflow-hidden">
            <h4 className="text-lg font-black text-slate-900 mb-4 text-center uppercase tracking-tighter">Tips Wellbeing 💡</h4>
            <p className="text-sm text-slate-700 text-center leading-relaxed font-semibold">
              Cobalah teknik pernapasan 4-7-8 selama 2 menit jika kamu merasa cemas sebelum ujian.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressItem({ label, value, color }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-slate-700">{value}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}