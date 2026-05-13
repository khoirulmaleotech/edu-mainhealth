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
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      let url = "/api/parent/dashboard";

      const params = new URLSearchParams();

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setDashboard({
          student: data.student,
          moodTrend: data.moodTrend || [],
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

  const student = dashboard.student;

  const moodTrend = dashboard.moodTrend || [];

  const childStats = [
    {
      label: "Stabilitas Emosi",
      value: "85%",
      trend: "Meningkat",
      color: "text-primary",
    },
    {
      label: "Interaksi Sosial",
      value: "Baik",
      trend: "Stabil",
      color: "text-secondary",
    },
    {
      label: "Kepatuhan Misi",
      value: "92%",
      trend: "Sangat Baik",
      color: "text-green-500",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Halo, Ayah/Bunda! 👋
          </h2>

          <p className="text-slate-500 mt-1 font-medium italic">
            Pantau perkembangan emosional dan bakat buah hati Anda secara
            real-time.
          </p>
        </div>

        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shadow-inner">
            {student?.fullname?.charAt(0) || "R"}
          </div>

          <div>
            <p className="text-xs font-black text-slate-800 leading-none">
              {student?.fullname || "Rizky Ramadhan"}
            </p>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
              Kelas {student?.class_name || "12A"} •{" "}
              {student?.school_name || "SMK Maleo"}
            </p>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {childStats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                {stat.label}
              </p>

              <h3 className={`text-4xl font-black ${stat.color}`}>
                {stat.value}
              </h3>

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
                Tren Mood{" "}
                {student?.fullname?.split(" ")[0] || "Rizky"}
              </h4>

              {/* FILTER */}
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 px-4 rounded-2xl border border-slate-200 text-xs font-bold outline-none focus:border-primary"
                />

                <span className="text-xs font-black text-slate-400">
                  s/d
                </span>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11 px-4 rounded-2xl border border-slate-200 text-xs font-bold outline-none focus:border-primary"
                />

                <button
                  onClick={fetchDashboard}
                  className="h-11 px-5 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* CHART */}
            <div className="flex items-end justify-between h-48 gap-4 px-2">
              {moodTrend.length > 0 ? (
                moodTrend.map((item, i) => {
                  const value = Number(item?.value || 0);

                  return (
                    <div
                      key={i}
                      className="flex-1 h-full flex flex-col items-center justify-end gap-3 group"
                    >
                      {/* BAR */}
                      <div className="w-full h-full flex items-end">
                        <div
                          className="w-full rounded-t-2xl bg-primary shadow-lg shadow-primary/20 transition-all duration-1000 ease-out group-hover:opacity-80"
                          style={{
                            height: `${value}%`,
                            minHeight: "12px",
                          }}
                        ></div>
                      </div>

                      {/* LABEL */}
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-center">
                        {item.day}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-sm text-slate-400 font-medium">
                    Belum ada data mood
                  </p>
                </div>
              )}
            </div>

            {/* AI INSIGHT */}
            <div className="mt-10 p-6 bg-primary/5 rounded-[30px] border border-primary/10 flex gap-4 items-start">
              <div className="p-2 bg-white rounded-xl shadow-sm text-primary">
                <Lightbulb size={20} />
              </div>

              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {student?.fullname || "Rizky"} menunjukkan stabilitas emosi
                yang sangat baik. AI kami mendeteksi dia sedang merasa percaya
                diri dengan kemajuan belajarnya.
              </p>
            </div>
          </div>

  
          {/* TALENT */}
  
          <div className="bg-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="space-y-4">
                <h4 className="text-secondary font-black text-xs uppercase tracking-[0.2em]">
                  Potensi Masa Depan
                </h4>

                <h3 className="text-3xl font-black tracking-tight leading-tight">
                  Komunikasi &
                  <br />
                  <span className="text-primary font-black italic">
                    Creative Thinking
                  </span>
                </h3>

                <p className="text-sm opacity-70 max-w-sm font-medium leading-relaxed">
                  Bakat{" "}
                  {student?.fullname?.split(" ")[0] || "Rizky"} di bidang
                  interpersonal sangat menonjol. Dia memiliki potensi besar
                  sebagai pemimpin tim atau mediator profesional.
                </p>

                <button className="flex items-center gap-2 text-secondary font-black text-xs uppercase tracking-widest mt-4 group hover:gap-4 transition-all">
                  Pelajari Bakat Anak <ChevronRight size={16} />
                </button>
              </div>

              <div className="w-40 h-40 bg-white/5 rounded-[40px] border border-white/10 flex items-center justify-center rotate-12">
                <Star size={64} className="text-secondary shadow-2xl" />
              </div>
            </div>

            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary opacity-20 rounded-full blur-3xl"></div>
          </div>
        </div>


        {/* SIDEBAR */}

        <div className="space-y-8">
          {/* AI TIP */}
          <div className="bg-primary p-9 rounded-[40px] text-white shadow-xl shadow-primary/30 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-secondary">
                Parenting Insight 💡
              </h4>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[28px] border border-white/20">
                  <p className="text-[10px] font-black text-secondary tracking-widest uppercase mb-3">
                    Saran Interaksi
                  </p>

                  <p className="text-sm leading-relaxed font-bold italic opacity-90">
                    "Hari ini{" "}
                    {student?.fullname?.split(" ")[0] || "Rizky"} sedang
                    dalam kondisi mood yang optimal. Ini waktu yang tepat
                    untuk mendiskusikan rencana kuliah atau cita-citanya."
                  </p>
                </div>

                <button className="w-full py-4 bg-white text-primary rounded-[22px] font-black text-xs hover:bg-secondary hover:text-slate-900 transition-all uppercase tracking-widest shadow-lg">
                  Lihat Tips Lainnya
                </button>
              </div>
            </div>

            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          </div>

          {/* SCHEDULE */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Jadwal Terdekat
            </h4>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] font-black text-primary leading-none uppercase">
                  Mei
                </span>

                <span className="text-lg font-black text-slate-800 leading-none mt-1">
                  12
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800 leading-none">
                  Konsultasi Bakat
                </p>

                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-2">
                  <Calendar size={10} />
                  Bersama Psikolog (Online)
                </p>
              </div>
            </div>

            <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
              Konfirmasi Kehadiran
            </button>
          </div>

          {/* PRIVACY */}
          <div className="bg-green-50/50 p-8 rounded-[40px] border border-green-100 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm">
              <ShieldCheck size={28} />
            </div>

            <h4 className="font-bold text-slate-800 text-sm tracking-tight">
              Privasi Aman
            </h4>

            <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tighter">
              Kami memproses data secara anonim. Ruang pribadi chat anak
              Anda tetap terjaga kerahasiaannya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}