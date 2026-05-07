"use client";
import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award, 
  ArrowUpRight, 
  Heart,
  Brain,
  Zap
} from 'lucide-react';

export default function StudentProgressPage() {
  const weeklyActivities = [
    { day: "Sen", value: 65 },
    { day: "Sel", value: 45 },
    { day: "Rab", value: 80 },
    { day: "Kam", value: 90 },
    { day: "Jum", value: 70 },
    { day: "Sab", value: 85 },
    { day: "Min", value: 60 },
  ];

  const badges = [
    { name: "Early Bird", icon: "🌅", desc: "Check-in mood 5 hari berturut-turut pagi hari", color: "bg-blue-50 text-blue-600" },
    { name: "Mindfulness Master", icon: "🧘", desc: "Menyelesaikan 10 sesi relaksasi", color: "bg-purple-50 text-purple-600" },
    { name: "Open Heart", icon: "💬", desc: "Berbagi cerita dengan AI Buddy selama 7 hari", color: "bg-pink-50 text-pink-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Progress Saya</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Lihat sejauh mana kamu telah berkembang minggu ini.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl text-sm font-bold text-slate-600 border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
            <Calendar size={18} className="text-primary" /> 7 Hari Terakhir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Main Charts & Stats */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* MOOD STABILITY CHART (Simplified Visual) */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="text-xl font-bold text-slate-800">Stabilitas Mood</h4>
                <p className="text-sm text-slate-400 font-medium">Tren emosional mingguanmu</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                <TrendingUp size={14} /> +12% Stabil
              </div>
            </div>

            {/* CHART VISUALIZATION */}
            <div className="flex items-end justify-between h-48 gap-3 mt-4">
              {weeklyActivities.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full relative flex flex-col justify-end h-full">
                    <div 
                      className="w-full bg-primary/10 group-hover:bg-primary/20 rounded-t-xl transition-all duration-700 ease-out relative"
                      style={{ height: `${item.value}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        {item.value}%
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-slate-400 uppercase">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DETAILED STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatSmallCard icon={<Heart size={20}/>} label="Mood Positif" value="82%" color="text-red-500" />
            <StatSmallCard icon={<Brain size={20}/>} label="Ketenangan" value="74%" color="text-primary" />
            <StatSmallCard icon={<Zap size={20}/>} label="Energi" value="68%" color="text-secondary" />
          </div>
        </div>

        {/* RIGHT COLUMN: Achievements & Targets */}
        <div className="space-y-8">
          {/* TARGET CARD */}
          <div className="bg-primary p-8 rounded-[40px] text-white shadow-2xl shadow-primary/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Target size={20} className="text-secondary" />
              </div>
              <h4 className="font-bold text-lg">Misi Mingguan</h4>
            </div>
            <div className="space-y-5">
              <TaskItem label="3x Relaksasi Pernapasan" done={true} />
              <TaskItem label="Cerita ke AI Buddy" done={false} />
              <TaskItem label="Lengkapi Profil Bakat" done={false} />
            </div>
            <button className="w-full mt-8 py-3 bg-secondary text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform">
              Lihat Semua Misi
            </button>
          </div>

          {/* BADGES SECTION */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Award className="text-secondary" size={20} /> Pencapaian
            </h4>
            <div className="space-y-4">
              {badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:border-slate-100 transition-colors">
                  <div className={`w-12 h-12 ${badge.color} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
                    {badge.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{badge.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatSmallCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 bg-slate-50 rounded-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-xl font-black text-slate-800">{value}</h3>
      </div>
    </div>
  );
}

function TaskItem({ label, done }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${done ? 'bg-secondary border-secondary' : 'border-white/30'}`}>
        {done && <div className="w-2 h-2 bg-slate-900 rounded-sm"></div>}
      </div>
      <span className={`text-sm font-bold ${done ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </div>
  );
}