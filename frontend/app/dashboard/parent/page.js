"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  ShieldCheck,
  Lightbulb,
  Calendar,
  ChevronRight,
  Star,
  Activity,
} from "lucide-react";

export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dashboard, setDashboard] = useState({
    student: null,
    moodTrend: [],
    stats: {},
    insights: null,
    schedule: null,
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const url = `/api/parent/dashboard${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setDashboard({
          student: data.student,
          moodTrend: data.moodTrend || [],
          stats: data.stats || {},
          insights: data.insights || null,
          schedule: data.schedule || null,
        });
      }
    } catch (error) {
      console.error("ERROR FETCH DASHBOARD:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { student, moodTrend, stats, insights, schedule } = dashboard;
  const firstName = student?.fullname?.split(" ")[0] || "Anak";

  const childStats = [
    {
      label: "Stabilitas Emosi",
      value: stats?.emotional_stability?.value ? `${stats.emotional_stability.value}%` : "-",
      trend: stats?.emotional_stability?.trend || "0%",
      color: "text-primary",
    },
    {
      label: "Konsistensi Check-in",
      value: stats?.checkin_consistency?.value ? `${stats.checkin_consistency.value}%` : "-",
      trend: stats?.checkin_consistency?.trend || "0%",
      color: "text-secondary",
    },
    {
      label: "Bakat Utama",
      value: stats?.dominant_talent?.value || "-",
      trend: stats?.dominant_talent?.trend || "Stabil",
      color: "text-green-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 p-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Halo, Ayah/Bunda! 👋
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic">
            Pantau perkembangan emosional dan bakat buah hati Anda secara real-time.
          </p>
        </div>

        {student && (
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shadow-inner">
              {student.fullname?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 leading-none">
                {student.fullname}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                {student.class_name} • {student.school_name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {childStats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <h3 className={`text-4xl font-black ${stat.color}`}>{stat.value}</h3>
              <p className="text-xs font-bold text-slate-400 mt-4 flex items-center gap-1">
                <TrendingUp size={14} className="text-green-500" />
                {stat.trend} minggu ini
              </p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-all duration-700 opacity-50"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* MOOD CHART */}
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
              <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                <Activity className="text-primary" />
                Tren Mood {firstName}
              </h4>

              <div className="flex flex-wrap items-center gap-2">
                {/* Container Input Group */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 gap-2 focus-within:border-primary/50 focus-within:bg-white transition-all shadow-sm">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent h-8 text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
                  />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">s/d</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent h-8 text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
                  />
                </div>

                {/* Button Filter Ringkas */}
                <button
                  onClick={fetchDashboard}
                  className="h-10 px-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95"
                >
                  Filter
                </button>
              </div>
            </div>

            <div className="flex items-end justify-between h-48 gap-4 px-2">
              {moodTrend.length > 0 ? (
                moodTrend.map((item, i) => (
                  <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-3 group">
                    <div className="w-full h-full flex items-end">
                      <div
                        className="w-full rounded-t-2xl bg-primary shadow-lg shadow-primary/20 transition-all duration-1000 ease-out group-hover:opacity-80"
                        style={{ height: `${item.value}%`, minHeight: "12px" }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-center">
                      {item.day}
                    </span>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-sm text-slate-400 font-medium">Belum ada data mood untuk periode ini</p>
                </div>
              )}
            </div>

            {insights?.mood_summary && (
              <div className="mt-10 p-6 bg-primary/5 rounded-[30px] border border-primary/10 flex gap-4 items-start">
                <div className="p-2 bg-white rounded-xl shadow-sm text-primary">
                  <Lightbulb size={20} />
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {insights.mood_summary}
                </p>
              </div>
            )}
          </div>

          {/* TALENT POTENTIAL */}
          {insights?.talent_potential && (
            <div className="bg-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="space-y-4 text-center md:text-left">
                  <h4 className="text-secondary font-black text-xs uppercase tracking-[0.2em]">Potensi Masa Depan</h4>
                  <h3 className="text-3xl font-black tracking-tight leading-tight">
                    {insights.talent_potential.title}
                  </h3>
                  <p className="text-sm opacity-70 max-w-sm font-medium leading-relaxed">
                    {insights.talent_potential.description}
                  </p>
                  <button className="flex items-center gap-2 text-secondary font-black text-xs uppercase tracking-widest mt-4 group hover:gap-4 transition-all mx-auto md:mx-0">
                    Pelajari Bakat Anak <ChevronRight size={16} />
                  </button>
                </div>
                <div className="w-40 h-40 bg-white/5 rounded-[40px] border border-white/10 flex items-center justify-center rotate-12 shrink-0">
                  <Star size={64} className="text-secondary shadow-2xl" />
                </div>
              </div>
              <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary opacity-20 rounded-full blur-3xl"></div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-8">
          {/* AI INTERACTION TIP */}
          {insights?.interaction_tip && (
            <div className="bg-primary p-9 rounded-[40px] text-white shadow-xl shadow-primary/30 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-secondary">
                  Parenting Insight 💡
                </h4>
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-[28px] border border-white/20">
                    <p className="text-[10px] font-black text-secondary tracking-widest uppercase mb-3">Saran Interaksi</p>
                    <p className="text-sm leading-relaxed font-bold italic opacity-90">
                      "{insights.interaction_tip}"
                    </p>
                  </div>
                  <button className="w-full py-4 bg-white text-primary rounded-[22px] font-black text-xs hover:bg-secondary hover:text-slate-900 transition-all uppercase tracking-widest shadow-lg">
                    Lihat Tips Lainnya
                  </button>
                </div>
              </div>
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            </div>
          )}

          {/* SCHEDULE */}
          {schedule && (
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jadwal Terdekat</h4>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm shrink-0">
                  <span className="text-[10px] font-black text-primary leading-none uppercase">{schedule.month}</span>
                  <span className="text-lg font-black text-slate-800 leading-none mt-1">{schedule.date}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-none">{schedule.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-2">
                    <Calendar size={10} /> {schedule.type}
                  </p>
                </div>
              </div>
              <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                Konfirmasi Kehadiran
              </button>
            </div>
          )}

          {/* PRIVACY */}
          <div className="bg-green-50/50 p-8 rounded-[40px] border border-green-100 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm">
              <ShieldCheck size={28} />
            </div>
            <h4 className="font-bold text-slate-800 text-sm tracking-tight">Privasi Aman</h4>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tighter">
              Kami memproses data secara anonim. Ruang pribadi chat buah hati Anda tetap terjaga kerahasiaannya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}