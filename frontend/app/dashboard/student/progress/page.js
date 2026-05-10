"use client";
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Brain, Zap, Clock, Info, Loader2 
} from 'lucide-react';
import { useSession } from "next-auth/react"; // Tambahkan import session

export default function StudentProgressPage() {
  const { data: session } = useSession(); // Ambil data session
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/student/progress');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Gagal memuat data progres:", err);
      } finally {
        setLoading(false);
      }
    };

    // Tambahkan gate session agar API hanya dipanggil jika session sudah ada
    if (session?.user?.id) {
      fetchProgress();
    }
  }, [session?.user?.id]); // Gunakan session user ID sebagai dependensi agar stabil

  if (loading) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#00adb5]" size={48} />
        <p className="text-sm font-bold text-slate-400 tracking-widest italic">Memuat progresmu...</p>
      </div>
    );
  }

  const cognitiveSkills = data?.cognitive_skills || [];
  const recentMoods = data?.mood_history || [];
  const streakCount = data?.streak_count || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SIMPLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Rangkuman Progres</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm tracking-wide">
            Analisis aktivitas dan perkembangan diri secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl text-xs font-black text-slate-600 border border-slate-100 shadow-sm">
          <Calendar size={18} className="text-[#00adb5]" /> MEI 2026
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: MOOD & TALENT */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* RIWAYAT MOOD */}
          <div className="bg-white p-8 md:p-10 rounded-[45px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-xl font-bold text-slate-800 tracking-tight">Riwayat Perasaan</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Check-in Terakhir</p>
              </div>
              <Clock size={20} className="text-slate-300" />
            </div>

            <div className="space-y-4">
              {recentMoods.length > 0 ? recentMoods.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 hover:bg-white hover:shadow-md transition-all rounded-[28px] border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-5">
                    <div className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{log.mood}</div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm">Merasa {log.label}</h5>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(log.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-[#00adb5] bg-[#00adb5]/10 px-3 py-1 rounded-lg uppercase">Tercatat</div>
                </div>
              )) : (
                <div className="text-center py-10 text-slate-300 italic text-sm">Belum ada riwayat aktivitas</div>
              )}
            </div>
          </div>

          {/* TALENT PROGRESS */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Brain size={24} /></div>
               <div>
                 <h4 className="text-lg font-bold text-slate-800 tracking-tight">Hasil EduMind Talent</h4>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-[10px]">Potensi Diri</p>
               </div>
            </div>
            <div className="space-y-6">
              {cognitiveSkills.length > 0 ? cognitiveSkills.map((skill, i) => (
                <SkillBar key={i} label={skill.label} value={skill.value} color={skill.color} />
              )) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-[35px]">
                  <p className="text-sm text-slate-400 font-bold italic mb-4">Data belum tersedia.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (SIDEBAR) */}
        <div className="space-y-8">
          {/* STREAK CARD */}
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Zap className="text-amber-400 fill-amber-400" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-xl leading-none">{streakCount} Hari</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Konsistensi</p>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
              "Lanjutkan kebiasaan baikmu untuk menjaga kesehatan mental yang stabil."
            </p>
          </div>

          {/* INFO CARD */}
          <div className="bg-[#00adb5]/5 p-8 rounded-[40px] border border-[#00adb5]/10 shadow-sm">
            <div className="flex items-center gap-2 text-[#00adb5] mb-3">
              <Info size={18} />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Info Sistem</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Halaman ini menyajikan rangkuman dari interaksi harianmu dengan AI Mood Buddy dan hasil asesmen minat bakat.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// UI HELPER
function SkillBar({ label, value, color }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-700 tracking-wide">{label}</span>
        <span className="text-xs font-black text-slate-800">{value}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}