"use client";
import React from 'react';
import { 
  Star, 
  Target, 
  Compass, 
  Sparkles, 
  ChevronRight, 
  GraduationCap,
  Lightbulb,
  Award,
  Zap
} from 'lucide-react';

export default function ParentTalentPage() {
  // Data Bakat Anak
  const talentProfiles = [
    { label: "Kreativitas Visual", value: 92, color: "bg-primary", desc: "Sangat menonjol dalam pemecahan masalah visual." },
    { label: "Komunikasi Interpersonal", value: 85, color: "bg-secondary", desc: "Mampu memimpin diskusi dan berempati dengan baik." },
    { label: "Analisis Logika", value: 60, color: "bg-slate-300", desc: "Memiliki pemahaman dasar logika yang cukup." },
  ];

  const careerRecommendations = ["Content Strategist", "Public Relations", "Creative Director", "UX Researcher"];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          Potensi & Bakat Anak <Star className="text-secondary fill-secondary" size={28} />
        </h2>
        <p className="text-slate-500 font-medium italic text-sm">Mengenal lebih dalam kekuatan unik dan peluang masa depan Rizky.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* MAIN CONTENT: TALENT MAPPING */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-secondary/20 rounded-2xl text-secondary shadow-inner">
                <Compass size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 tracking-tight">Profil Kekuatan Dominan</h4>
            </div>

            <div className="space-y-10">
              {talentProfiles.map((talent, idx) => (
                <div key={idx} className="space-y-3 group">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors">{talent.label}</span>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">{talent.desc}</p>
                    </div>
                    <span className="text-xl font-black text-slate-800">{talent.value}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-50 rounded-full border border-slate-100 shadow-inner overflow-hidden">
                    <div 
                      className={`h-full ${talent.color} rounded-full transition-all duration-1000 ease-out`} 
                      style={{ width: `${talent.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* CAREER PREDICTION */}
            <div className="mt-12 p-8 bg-slate-900 rounded-[35px] text-white relative overflow-hidden shadow-2xl">
               <div className="relative z-10">
                  <h5 className="font-bold text-secondary text-[11px] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap size={16} fill="currentColor" /> Prediksi Karier Ideal
                  </h5>
                  <div className="flex flex-wrap gap-3">
                    {careerRecommendations.map((job, i) => (
                      <span key={i} className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition-all cursor-default">
                        {job}
                      </span>
                    ))}
                  </div>
                  <p className="mt-6 text-sm opacity-60 font-medium leading-relaxed italic">
                    "Berdasarkan analisis minat dan gaya komunikasinya, Rizky memiliki potensi 90% sukses di industri kreatif dan sosial."
                  </p>
               </div>
               <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary opacity-20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>

        {/* SIDEBAR: ACTIONABLE INSIGHTS */}
        <div className="space-y-8">
          {/* LEARNING STYLE CARD */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gaya Belajar Anak</h4>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                🎧
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg leading-tight tracking-tight">Auditory Learner</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Sangat baik dalam Diskusi</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  Saran: Rizky akan lebih cepat paham jika materi pelajaran dibahas melalui obrolan langsung atau podcast edukasi.
               </p>
            </div>
          </div>

          {/* SCHOLARSHIP / OPPORTUNITY CARD */}
          <div className="bg-secondary p-8 rounded-[40px] shadow-xl shadow-secondary/20 relative overflow-hidden group">
            <div className="relative z-10">
              <GraduationCap className="text-slate-900 mb-4 group-hover:scale-110 transition-transform" size={36} />
              <h4 className="font-black text-slate-900 text-xl mb-2 tracking-tighter">Peluang Beasiswa</h4>
              <p className="text-xs text-slate-800 font-bold leading-relaxed mb-6 italic opacity-80">
                Ada 3 program pengembangan bakat seni dan komunikasi yang cocok untuk Rizky bulan depan.
              </p>
              <button className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2">
                Lihat Peluang <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* PARENTING TIP FOR TALENT */}
          <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/20 space-y-4">
            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
              <Lightbulb size={18} /> Tips Mengasah Bakat
            </div>
            <p className="text-sm text-slate-700 font-bold leading-relaxed italic">
              "Puji proses kreatif Rizky, bukan hanya hasilnya. Ini akan membangun mental juara yang resilien."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TalentBar({ label, value, color }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-slate-800 font-black">{value}%</span>
      </div>
      <div className="w-full h-3 bg-slate-50 rounded-full border border-slate-100 shadow-inner overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}