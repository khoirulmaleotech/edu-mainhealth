"use client";

import React, { useEffect, useState } from "react";
import {
  Star,
  Compass,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  Zap,
  Loader2,
} from "lucide-react";

export default function ParentTalentPage() {

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [talentProfiles, setTalentProfiles] = useState([]);
  const [careerRecommendations, setCareerRecommendations] = useState([]);

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        const res = await fetch("/api/parent/talents", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success) {
          setStudent(data.student || null);
          setTalentProfiles(data.talents || []);
          setCareerRecommendations(data.careerRecommendations || []);
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
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const firstName = student?.fullname?.split(" ")[0] || "Rizky";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* HEADER */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          Potensi & Bakat Anak
          <Star className="text-secondary fill-secondary" size={28} />
        </h2>

        <p className="text-slate-500 font-medium italic text-sm">
          Mengenal lebih dalam kekuatan unik dan peluang masa depan {firstName}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-8">

          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">

            {/* TITLE */}
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-secondary/20 rounded-2xl text-secondary shadow-inner">
                <Compass size={24} />
              </div>

              <h4 className="text-xl font-bold text-slate-800 tracking-tight">
                Profil Kekuatan Dominan
              </h4>
            </div>

            {/* TALENT LIST */}
            <div className="space-y-10">

              {talentProfiles.length > 0 ? (
                talentProfiles.map((talent, idx) => {
                  const value = Math.min(100, Math.max(0, Number(talent.value || 0)));

                  const barColor = talent.color || "bg-primary";

                  return (
                    <div key={idx} className="space-y-3 group">

                      <div className="flex justify-between items-end">

                        <div>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors">
                            {talent.label}
                          </span>
                        </div>

                        <span className="text-xl font-black text-slate-800">
                          {value}%
                        </span>

                      </div>

                      {/* BAR */}
                      <div className="w-full h-3 bg-slate-50 rounded-full border border-slate-100 shadow-inner overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${value}%` }}
                        />
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center">
                  <p className="text-slate-400 font-medium">
                    Belum ada data bakat tersedia
                  </p>
                </div>
              )}

            </div>

            {/* CAREER */}
            <div className="mt-12 p-8 bg-slate-900 rounded-[35px] text-white relative overflow-hidden">

              <div className="relative z-10">

                <h5 className="font-bold text-secondary text-[11px] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap size={16} fill="currentColor" />
                  Prediksi Karier Ideal
                </h5>

                <div className="flex flex-wrap gap-3">
                  {careerRecommendations.length > 0 ? (
                    careerRecommendations.map((job, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-xs font-bold"
                      >
                        {job}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">
                      Belum ada rekomendasi karier
                    </span>
                  )}
                </div>

                <p className="mt-6 text-sm opacity-60 italic">
                  Analisis AI menunjukkan potensi kuat pada komunikasi, kreativitas, dan kepemimpinan.
                </p>

              </div>

              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary opacity-20 rounded-full blur-3xl"></div>
            </div>

          </div>

        </div>

        {/* SIDEBAR */}
        <div className="space-y-8">

          {/* LEARNING STYLE */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100">

            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Gaya Belajar Anak
            </h4>

            <div className="flex items-center gap-5 mt-4">

              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl">
                🎧
              </div>

              <div>
                <p className="font-bold text-slate-800 text-lg">
                  Auditory Learner
                </p>

                <p className="text-[10px] text-slate-500 font-bold uppercase">
                  Diskusi & Audio
                </p>
              </div>

            </div>

          </div>

          {/* SCHOLARSHIP */}
          <div className="bg-secondary p-8 rounded-[40px]">

            <GraduationCap className="text-slate-900 mb-4" size={36} />

            <h4 className="font-black text-slate-900 text-xl">
              Peluang Beasiswa
            </h4>

            <p className="text-xs text-slate-800 mt-2 mb-6">
              Program pengembangan bakat tersedia bulan ini.
            </p>

            <button className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase">
              Lihat Peluang
            </button>

          </div>

          {/* TIPS */}
          <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/20">

            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase">
              <Lightbulb size={18} />
              Tips Mengasah Bakat
            </div>

            <p className="text-sm text-slate-700 mt-3 italic">
              Fokus pada proses, bukan hasil akhir.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}