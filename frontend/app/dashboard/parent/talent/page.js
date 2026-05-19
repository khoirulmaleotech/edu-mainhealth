"use client";

import React, { useEffect, useState } from "react";
import {
  Star,
  Compass,
  Lightbulb,
  Zap,
  Loader2,
  Trophy,
  Target,
  Rocket,
} from "lucide-react";

export default function ParentTalentPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    student: null,
    talents: [],
    careerRecommendations: [],
    insights: null,
  });

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        const res = await fetch("/api/parent/talents", {
          cache: "no-store",
        });
        const result = await res.json();

        if (result.success) {
          setData({
            student: result.student || null,
            talents: result.talents || [],
            careerRecommendations: result.careerRecommendations || [],
            insights: result.insights || null,
          });
        }
      } catch (error) {
        console.error("FETCH TALENT ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTalent();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="relative flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
          <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse rounded-full"></div>
        </div>
        <p className="text-slate-400 font-medium animate-pulse">Menganalisis Potensi...</p>
      </div>
    );
  }

  const { student, talents, careerRecommendations, insights } = data;
  const firstName = student?.fullname?.split(" ")[0] || "Anak";

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* HEADER SECTION */}
      <header className="relative p-8 rounded-[40px] bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-secondary text-xs font-bold uppercase tracking-widest">
              <Trophy size={14} /> Personal Talent Mapping
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">
              Eksplorasi Bakat <span className="text-primary">{firstName}</span>
            </h2>
            <p className="text-slate-300 font-medium max-w-md leading-relaxed">
              Peta kekuatan unik dan panduan strategis untuk memaksimalkan potensi masa depan.
            </p>
          </div>
          <div className="hidden md:block p-4 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10">
             <Star className="text-yellow-400 fill-yellow-400 animate-bounce" size={40} />
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
      </header>

        
        {/* MAIN CONTENT: TALENTS */}
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
            
            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 relative z-10">
              <div className="flex items-center gap-5">
                <div className="p-5 bg-gradient-to-br from-primary to-primary/80 rounded-[24px] text-white shadow-lg shadow-primary/20">
                  <Target size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                    Profil Kekuatan Dominan
                  </h4>
                  <p className="text-slate-500 font-medium">
                    Analisis mendalam mengenai potensi paling menonjol pada diri <span className="text-primary font-bold">{firstName}</span>.
                  </p>
                </div>
              </div>
              
              {/* Legend / Status */}
              <div className="hidden md:flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div> Skor Tinggi</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200"></div> Potensi Dasar</span>
              </div>
            </div>

            {/* TALENT GRID - Tetap 2 kolom di desktop agar tidak terlalu panjang ke bawah */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12 relative z-10">
              {talents.length > 0 ? (
                talents.map((talent, idx) => {
                  const value = Math.min(100, Math.max(0, Number(talent.value || 0)));
                  return (
                    <div key={idx} className="group cursor-default">
                      <div className="flex justify-between items-end mb-4">
                        <div className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 group-hover:text-primary transition-colors duration-300">
                            {talent.label}
                          </span>
                          <div className="h-0.5 w-0 group-hover:w-full bg-primary/30 transition-all duration-500"></div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-800 tracking-tighter">{value}</span>
                          <span className="text-sm font-bold text-slate-400">%</span>
                        </div>
                      </div>
                      
                      <div className="relative w-full h-5 bg-slate-100/80 rounded-2xl overflow-hidden border border-slate-100 p-1 shadow-inner">
                        <div
                          className={`h-full ${talent.color || "bg-primary"} rounded-xl transition-all duration-[1500ms] cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[40px] bg-slate-50/50">
                  <div className="mx-auto w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                    <Compass size={32} className="text-slate-300 animate-pulse" />
                  </div>
                  <h5 className="text-slate-800 font-bold text-lg">Belum Ada Data Tersedia</h5>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 font-medium">
                    Selesaikan beberapa aktivitas atau penilaian untuk melihat analisis bakat di sini.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
    </div>
  );
}