"use client";
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, Target, Award, 
  Heart, Brain, Zap, ShieldCheck, Compass, Loader2 
} from 'lucide-react';

export default function StudentProgressPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch data dari API Progress
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
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#00adb5]" size={48} />
        <p className="text-sm font-bold text-slate-400 tracking-widest italic">Menganalisis progresmu...</p>
      </div>
    );
  }

  const summary = data?.summary || { happiness_index: 0, career_readiness: 0, behavior_points: 100, streak_count: 0 };
  const moodChart = data?.mood_chart || [];
  const cognitiveSkills = data?.cognitive_skills || [];
  const badges = data?.badges || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Header dengan Summary Eksekutif */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Rangkuman Progres</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm tracking-wide opacity-80">
            Status: {summary.happiness_index > 7 ? 'Kesehatan Mental Stabil' : 'Perlu Perhatian Khusus'}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl text-xs font-bold text-slate-600 border border-slate-100 shadow-sm">
            <Calendar size={18} className="text-[#00adb5]" /> Periode Mei 2026
          </div>
        </div>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Heart size={24}/>} 
          label="Indeks Kebahagiaan" 
          value={`${summary.happiness_index}/10`} 
          desc="Berdasarkan interaksi harian"
          color="bg-rose-50 text-rose-500" 
        />
        <StatCard 
          icon={<Compass size={24}/>} 
          label="Kesiapan Karir" 
          value={`${summary.career_readiness}%`} 
          desc="Berdasarkan Talent Mapping"
          color="bg-amber-50 text-amber-600" 
        />
        <StatCard 
          icon={<ShieldCheck size={24}/>} 
          label="Poin Perilaku" 
          value={summary.behavior_points} 
          desc="Catatan kedisiplinan sekolah"
          color="bg-emerald-50 text-emerald-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Mental Health Tracker */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h4 className="text-2xl font-bold text-slate-800 tracking-tight">Grafik Kesejahteraan</h4>
                <p className="text-sm text-slate-400 font-bold tracking-widest mt-1 uppercase text-[10px]">Mental Health Monitoring</p>
              </div>
              <div className="px-4 py-2 bg-[#00adb5]/10 text-[#00adb5] rounded-xl text-[10px] font-bold uppercase tracking-widest">
                Live Data
              </div>
            </div>

            <div className="flex items-end justify-between h-56 gap-4 mt-4">
              {moodChart.length > 0 ? moodChart.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="w-full relative flex flex-col justify-end h-full">
                    <div 
                      className={`w-full ${item.value > 70 ? 'bg-[#00adb5]' : 'bg-[#00adb5]/20'} group-hover:scale-x-110 rounded-t-2xl transition-all duration-500 ease-out relative`}
                      style={{ height: `${item.value}%` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap">
                        {item.label}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.day}</span>
                </div>
              )) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-sm">Belum ada data aktivitas minggu ini</div>
              )}
            </div>
          </div>

          {/* 4. Talent Progress */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                 <Brain size={24} />
               </div>
               <div>
                 <h4 className="text-lg font-bold text-slate-800 tracking-tight">Hasil EduMind Talent</h4>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-[10px]">Kekuatan Potensi Diri</p>
               </div>
            </div>
            
            <div className="space-y-6">
              {cognitiveSkills.length > 0 ? cognitiveSkills.map((skill, i) => (
                <SkillBar key={i} label={skill.label} value={skill.value} color={skill.color} />
              )) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-[30px]">
                  <p className="text-sm text-slate-400 font-bold italic mb-4">Hasil talent mapping belum tersedia.</p>
                  <button 
                    onClick={() => window.location.href='/dashboard/student/talent'}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest"
                  >
                    Mulai Asesmen Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. Sidebar: Streak & Badges */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Zap className="text-amber-400 fill-amber-400" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-xl leading-none">{summary.streak_count} Hari</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Streak Curhat</p>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-400 leading-relaxed">
              Luar biasa! Konsistensimu membantu kami memberikan analisis yang lebih akurat.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 tracking-tight">
               <Award className="text-amber-500" size={22} /> Pencapaian
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {badges.length > 0 ? badges.map((badge, i) => (
                <BadgeBox key={i} icon={badge.icon} label={badge.label} color={badge.color} />
              )) : (
                <div className="col-span-2 text-center py-4 text-slate-300 text-[10px] font-bold uppercase">Belum ada badge</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// UI Helpers
function StatCard({ icon, label, value, desc, color }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md group">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <h3 className="text-3xl font-bold text-slate-800 mb-2">{value}</h3>
      <p className="text-xs font-medium text-slate-400 leading-tight">{desc}</p>
    </div>
  );
}

function SkillBar({ label, value, color }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-700 tracking-wide">{label}</span>
        <span className="text-xs font-bold text-slate-800">{value}%</span>
      </div>
      <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function BadgeBox({ icon, label, color }) {
  return (
    <div className={`${color} p-4 rounded-[24px] flex flex-col items-center justify-center gap-2 border border-white transition-transform hover:scale-105`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-[9px] font-bold text-slate-800 uppercase tracking-widest">{label}</span>
    </div>
  );
}