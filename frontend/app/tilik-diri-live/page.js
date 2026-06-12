"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { HeartPulse, Activity, MessageCircle, Lock } from "lucide-react";

export default function TilikDiriLivePage() {
  const [data, setData] = useState({
    totalRespondents: 0,
    severityChart: [],
    recentFeelings: []
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("chart"); // "chart" | "bubble"
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === "edumind2026") {
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Password salah!");
    }
  };

  // Polling for real-time updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/tilik-diri-live");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Error fetching live data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
      const intervalId = setInterval(fetchData, 3000); // Poll every 3 seconds
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated]);

  const SEVERITY_COLORS = {
    "Tidak Terdeteksi": "#10b981", // emerald-500
    "Depresi Ringan": "#f59e0b",   // amber-500
    "Depresi Sedang": "#3b82f6",   // blue-500
    "Depresi Berat": "#ef4444",    // red-500
    "Depresi Berat / Sangat Berat": "#9f1239" // rose-800
  };

  const getChartColors = (name) => {
    return SEVERITY_COLORS[name] || "#64748b";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Akses Terkunci</h2>
            <p className="text-sm text-slate-400">Masukkan kata sandi untuk melihat grafik secara live.</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Kata sandi..."
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                autoFocus
              />
              {passwordError && <p className="text-rose-400 text-xs mt-2 font-medium">{passwordError}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              Buka Kunci
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-8 md:p-12 overflow-x-hidden font-sans text-white">
      {/* Header */}
      <div className="mb-10 text-center relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-3 bg-white/10 px-5 py-2 rounded-full mb-6 border border-white/20 backdrop-blur-md">
          <HeartPulse className="text-rose-500 animate-pulse" size={24} />
          <span className="font-bold tracking-widest uppercase text-sm text-slate-200">Live Streaming Asesmen</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mb-6 drop-shadow-lg leading-tight">
          Hasil Tilik Diri Siswa
        </h1>
        
        {/* Total Counter */}
        <div className="flex flex-col items-center mt-4">
          <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm mb-2">Total Responden</span>
          <div className="text-7xl md:text-9xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {data.totalRespondents}
          </div>
        </div>
      </div>

      {/* View Toggles */}
      <div className="flex justify-center mb-12 relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-full shadow-xl p-1.5 flex border border-slate-700/50">
          <button
            onClick={() => setViewMode("chart")}
            className={`px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${
              viewMode === "chart" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <Activity size={18} />
            Distribusi Kondisi
          </button>
          <button
            onClick={() => setViewMode("bubble")}
            className={`px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${
              viewMode === "bubble" ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <MessageCircle size={18} />
            Suara Hati Siswa
          </button>
        </div>
      </div>

      {/* Results Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto relative z-10 flex flex-col justify-center">
        {loading && data.totalRespondents === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
          </div>
        ) : data.totalRespondents === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-slate-500 text-2xl italic font-medium">Belum ada data Tilik Diri...</p>
          </div>
        ) : viewMode === "chart" ? (
          <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-xl rounded-[40px] p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
            <h3 className="text-center text-xl font-bold text-slate-300 mb-8 uppercase tracking-widest">Tingkat Keparahan (Severity)</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.severityChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={160}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.severityChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getChartColors(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-slate-300 font-bold ml-2">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-center content-center animate-in fade-in duration-500 min-h-[400px]">
            {data.recentFeelings.length === 0 ? (
              <p className="text-slate-500 text-xl italic">Belum ada tanggapan perasaan...</p>
            ) : (
              data.recentFeelings.map((item, index) => {
                const colors = [
                  "bg-emerald-500/20 text-emerald-100 border-emerald-500/30",
                  "bg-sky-500/20 text-sky-100 border-sky-500/30",
                  "bg-indigo-500/20 text-indigo-100 border-indigo-500/30",
                  "bg-fuchsia-500/20 text-fuchsia-100 border-fuchsia-500/30",
                  "bg-amber-500/20 text-amber-100 border-amber-500/30",
                  "bg-rose-500/20 text-rose-100 border-rose-500/30",
                ];
                const sizes = ["text-lg", "text-xl", "text-2xl", "text-lg", "text-xl"];
                
                const colorClass = colors[index % colors.length];
                const sizeClass = sizes[index % sizes.length];
                
                return (
                  <div
                    key={item._id || index}
                    className={`px-6 py-4 rounded-[30px] border shadow-2xl backdrop-blur-md transform transition-all duration-700 hover:scale-110 hover:z-20 cursor-default ${colorClass}`}
                    style={{
                      animation: `float ${3 + (index % 3)}s ease-in-out infinite`,
                      animationDelay: `${(index % 10) * 0.2}s`,
                    }}
                  >
                    <span className={`font-semibold tracking-wide ${sizeClass}`}>
                      "{item.feeling}"
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
