"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { 
  MessageCircle, 
  ShieldAlert, 
  Star, 
  Loader2,
  CheckCircle2,
  Heart
} from 'lucide-react';

export default function StudentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [selectedMood, setSelectedMood] = useState(null);
  const [isMoodLoading, setIsMoodLoading] = useState(false);
  const [lastMood, setLastMood] = useState(null); // State untuk mood terakhir

  const firstName = session?.user?.fullname?.split(' ')[0] || "Student";

  const moodEmojis = [
    { emoji: "😢", label: "Sedih" },
    { emoji: "😕", label: "Bingung" },
    { emoji: "😐", label: "Biasa" },
    { emoji: "🙂", label: "Senang" },
    { emoji: "🤩", label: "Hebat" }
  ];

  // 1. Ambil Mood Terakhir saat halaman dimuat
  useEffect(() => {
    const fetchLastMood = async () => {
      try {
        const res = await fetch('/api/student/mood');
        const data = await res.json();
        if (data.success && data.logs.length > 0) {
          // Ambil log paling atas (terbaru)
          setLastMood(data.logs[0]);
        }
      } catch (err) {
        console.error("Gagal mengambil mood terakhir:", err);
      }
    };

    if (session?.user?.id) {
      fetchLastMood();
    }
    
  }, [session?.user?.id]); 

  const quickAccess = [
    { 
      title: "Curhat Aman", 
      href: "/dashboard/student/chat", 
      icon: <MessageCircle className="text-[#00adb5]" />, 
      color: "bg-[#00adb5]/10", 
      desc: "Ngobrol bareng AI Mood Buddy untuk melepas penatmu." 
    },
    { 
      title: "Lapor Bullying", 
      href: "/dashboard/student/report", 
      icon: <ShieldAlert className="text-rose-500" />, 
      color: "bg-rose-50", 
      desc: "Laporkan tindakan tidak nyaman atau perundungan secara rahasia." 
    },
    { 
      title: "Talent Mapping", 
      href: "/dashboard/student/talent", 
      icon: <Star className="text-[#fbcd2b]" />, 
      color: "bg-[#fbcd2b]/15", 
      desc: "Temukan minat dan bakatmu untuk masa depan yang cerah." 
    }
  ];

  const handleMoodCheckIn = async (moodData) => {
    setIsMoodLoading(true);
    try {
      const res = await fetch('/api/student/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mood: moodData.emoji, 
          label: moodData.label 
        }),
      });

      if (res.ok) {
        // Update tampilan secara instan
        setLastMood({ mood: moodData.emoji, label: moodData.label });
        setSelectedMood(moodData.label);
        setTimeout(() => setSelectedMood(null), 5000);
      }
    } catch (err) {
      console.error("Gagal mencatat mood harian:", err);
    } finally {
      setIsMoodLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* SECTION WELCOME & MOOD CHECK-IN */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Halo, {firstName}! 👋</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Bagaimana kabarmu hari ini? Klik emoji yang paling mewakilimu.</p>
        </div>
        
        <div className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 flex flex-wrap items-center gap-4 transition-all">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Mood Check-in:</p>
          <div className="flex gap-2 items-center min-h-[40px]">
            {isMoodLoading ? (
              <Loader2 className="animate-spin text-[#00adb5] mx-8" size={20} />
            ) : lastMood ? (
              <div className="flex items-center gap-3 animate-in zoom-in">
                <div className="text-2xl">{lastMood.mood}</div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                  <CheckCircle2 size={14} /> Mood {lastMood.label} Tercatat
                </div>
                {/* Tombol ganti mood jika user salah klik */}
                <button 
                  onClick={() => setLastMood(null)} 
                  className="text-[10px] text-slate-400 underline hover:text-[#00adb5] font-bold ml-1"
                >
                  Ganti
                </button>
              </div>
            ) : (
              moodEmojis.map((m, i) => (
                <button 
                  key={i} 
                  onClick={() => handleMoodCheckIn(m)}
                  className="text-2xl hover:scale-125 transition-transform active:scale-95 hover:drop-shadow-md p-1"
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* GRID KONTEN UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Access Menu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickAccess.map((item, i) => (
              <div 
                key={i} 
                onClick={() => router.push(item.href)}
                className={`group p-8 rounded-[40px] ${item.color} border border-transparent hover:border-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer ${i === 2 ? 'md:col-span-2' : ''}`}
              >
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:rotate-6 transition-transform">
                  {React.cloneElement(item.icon, { size: 28 })}
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Banner Insight */}
          <div className="bg-[#00adb5] p-10 rounded-[45px] text-white relative overflow-hidden shadow-2xl shadow-[#00adb5]/20">
            <div className="relative z-10 max-w-xl">
              <h4 className="text-[#fbcd2b] font-black text-xl mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                Insight Hari Ini ✨
              </h4>
              <p className="text-xl opacity-95 leading-relaxed font-bold italic">
                "Kesehatan mentalmu adalah prioritas utama. Luangkan waktu sejenak untuk mendengarkan diri sendiri hari ini."
              </p>
              <button 
                onClick={() => router.push('/dashboard/student/chat')}
                className="mt-8 bg-white/20 hover:bg-white/40 backdrop-blur-md px-10 py-4 rounded-2xl text-sm font-black transition-all border border-white/20 uppercase tracking-widest"
              >
                Mulai Cerita
              </button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* SIDEBAR RIGHT */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#00adb5] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#00adb5]/20">
                <Heart className="text-white" size={24} />
              </div>
              <h4 className="text-lg font-black mb-3 leading-tight">Butuh teman bicara yang ahli?</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium mb-8">
                Tim psikolog profesional kami siap mendengarkan ceritamu tanpa menghakimi.
              </p>
              <button 
                onClick={() => router.push('/dashboard/student/chat/psychologist')}
                className="w-full py-4 bg-[#00adb5] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#00c2cb] transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#00adb5]/20"
              >
                Hubungi Psikolog
              </button>
            </div>
          </div>

          <div className="bg-[#fbcd2b]/10 p-8 rounded-[40px] border border-[#fbcd2b]/20 relative overflow-hidden group">
            <h4 className="text-[10px] font-black text-[#fbcd2b] mb-3 uppercase tracking-[0.2em]">Tips Wellbeing 💡</h4>
            <p className="text-sm text-slate-700 leading-relaxed font-bold italic">
              "Tarik napas dalam-dalam selama 4 hitungan, tahan selama 7, dan buang selama 8. Teknik ini ampuh meredakan cemas."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}