"use client";
import React from 'react';
import { 
  Star, 
  Lightbulb, 
  Rocket, 
  BrainCircuit, 
  Compass, 
  ChevronRight,
  Target,
  Sparkles
} from 'lucide-react';

export default function StudentTalentPage() {
  // Data Mapping Bakat berdasarkan Blueprint 
  const talentStats = [
    { label: "Kreatif", value: 85, color: "bg-primary" },
    { label: "Analitis", value: 60, color: "bg-secondary" },
    { label: "Komunikatif", value: 90, color: "bg-blue-400" },
    { label: "Empatik", value: 75, color: "bg-pink-400" },
  ];

  const recommendations = [
    { title: "Public Speaking", desc: "Asah kemampuan komunikasimu dengan ikut klub debat.", icon: <Sparkles className="text-secondary" /> },
    { title: "Creative Design", desc: "Potensi kreatifmu sangat tinggi, coba pelajari desain UI/UX.", icon: <Lightbulb className="text-primary" /> },
    { title: "Leadership", desc: "Kemampuan empatikmu cocok untuk memimpin tim.", icon: <Target className="text-orange-400" /> },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HEADER SECTION [cite: 31, 286] */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Talent Mapping</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Temukan potensi terbaikmu untuk masa depan yang lebih cerah. ✨</p>
        </div>
        <button className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all uppercase tracking-widest">
          Ambil Tes Ulang
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN: Talent Radar & Personality [cite: 35, 467] */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
            <h4 className="text-xl font-bold text-slate-800 mb-10 flex items-center gap-3">
              <Compass className="text-primary" /> Kekuatan Utama Kamu
            </h4>
            
            {/* Visual Talent Bars (Representasi Radar Chart sederhana)  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {talentStats.map((stat, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-slate-700 uppercase tracking-widest text-xs">{stat.label}</span>
                    <span className="font-black text-primary text-lg">{stat.value}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                    <div 
                      className={`h-full ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${stat.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-slate-50 rounded-[30px] border border-dashed border-slate-200">
              <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <BrainCircuit size={18} className="text-primary" /> Personality Insight: "The Inspiring Communicator"
              </h5>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Kamu memiliki kemampuan alami untuk memahami emosi orang lain dan menyampaikannya kembali dengan sangat baik. Fokuslah pada pengembangan karir di bidang komunikasi atau sosial. [cite: 35, 41]
              </p>
            </div>
          </div>

          {/* LEARNING STYLE  */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-6 uppercase text-xs tracking-widest text-slate-400">Gaya Belajar</h4>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-secondary/20 rounded-3xl flex items-center justify-center text-3xl shadow-inner">
                  🎧
                </div>
                <div>
                  <h5 className="font-black text-slate-800 text-xl tracking-tight">Auditory Learner</h5>
                  <p className="text-sm text-slate-500 font-medium">Kamu lebih cepat paham melalui diskusi dan suara.</p>
                </div>
              </div>
            </div>
            <div className="bg-primary p-8 rounded-[35px] text-white shadow-xl shadow-primary/20 flex flex-col justify-between">
              <h4 className="font-black text-xs uppercase tracking-widest opacity-70">Potensi Karir</h4>
              <h3 className="text-2xl font-black mt-4 text-secondary italic">Psikolog, Guru, Hubungan Masyarakat. [cite: 41]</h3>
              <Rocket className="self-end opacity-20" size={40} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recommendations [cite: 37, 472] */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h4 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3 tracking-tight">
               <Star className="text-secondary" size={24} /> Rekomendasi Aksi [cite: 37]
            </h4>
            <div className="space-y-6">
              {recommendations.map((rec, i) => (
                <div key={i} className="group p-5 rounded-3xl border border-slate-50 hover:border-primary/20 hover:bg-slate-50/50 transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      {rec.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 mb-1">{rec.title}</p>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{rec.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-primary mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MOTIVATIONAL CARD */}
          <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-4">Ingatlah! 💡</h4>
              <p className="text-sm opacity-80 leading-relaxed font-medium">
                "Bakat adalah benih, namun latihan adalah air yang membuatnya tumbuh menjadi pohon yang kuat."
              </p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary opacity-20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}