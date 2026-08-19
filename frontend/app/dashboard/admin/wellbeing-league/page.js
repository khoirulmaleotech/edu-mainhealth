"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  UserCheck, 
  Smile, 
  ShieldAlert, 
  AlertTriangle, 
  HelpCircle, 
  Compass, 
  Award, 
  CheckCircle2, 
  QrCode, 
  MessageSquare,
  Sparkles,
  BookOpen,
  Briefcase,
  BrainCircuit,
  Gift,
  Heart,
  ChevronRight,
  Database
} from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import Image from "next/image";

// Custom styles for charts
const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#EF4444"];

export default function WellbeingLeaguePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const getStats = async () => {
      try {
        setLoading(true);
        const res = await fetchInstance("/api/admin/wellbeing-league");
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Error fetching wellbeing league stats:", err);
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, []);

  if (!isMounted) {
    return <div className="p-8 text-center text-slate-500">Memuat modul...</div>;
  }

  // Fallback if API hasn't resolved yet
  const currentData = stats;

  // Render a progress bar for statistics lists
  const renderProgressBar = (value, colorClass = "bg-[#00adb5]", max = 100) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClass} rounded-full transition-all duration-1000`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-black text-slate-700 w-8 text-right">{value}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 font-sans max-w-[1600px] mx-auto pb-16">
      
      {/* 1. HEADER BANNER */}
      <div className="relative overflow-hidden rounded-[35px] bg-gradient-to-r from-[#eef2f7] via-white to-[#eef2f7] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left Side: Telkom Indonesia */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
            <Image src="/images/telkom-indonesia.png" alt="Telkom Indonesia" width={100} height={50} className="h-8 w-auto object-contain" />
            <div className="h-6 w-[1px] bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">the world in your hand</span>
          </div>
          <div className="hidden md:flex gap-1.5 mt-2">
            <span className="text-[11px] bg-red-50 text-red-600 font-bold px-3 py-1 rounded-full border border-red-100">Binaan TJSL Telkom</span>
            <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">Pilot Program</span>
          </div>
        </div>

        {/* Center: Title & Slogan */}
        <div className="text-center flex-1 max-w-2xl px-4">
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-none">
            <span className="text-[#0052cc]">EduMind</span>{" "}
            <span className="text-slate-800">Wellbeing League</span>
          </h1>
          <p className="text-sm md:text-md text-slate-500 font-semibold mt-3 max-w-lg mx-auto">
            Kompetisi untuk Membangun Sekolah Paling Aman, Sehat dan Peduli di Indonesia
          </p>
          
          {/* Badge Satu Gerakan • Satu Tujuan • Satu Dampak */}
          <div className="inline-flex items-center gap-2 bg-[#0052cc]/10 text-[#0052cc] border border-[#0052cc]/20 rounded-full px-5 py-1.5 mt-5 text-xs md:text-sm font-black tracking-wide uppercase">
            <span>Satu Gerakan</span>
            <span className="opacity-40">•</span>
            <span>Satu Tujuan</span>
            <span className="opacity-40">•</span>
            <span>Satu Dampak</span>
          </div>
        </div>

        {/* Right Side: EduMind Brand Logo & Student Illustration */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <div className="flex items-center gap-2">
            <Image src="/images/logo-edumind-transparan.png" alt="EduMind AI" width={55} height={55} className="h-10 w-auto" />
            <div className="text-left">
              <span className="block text-md font-black text-slate-800 leading-none">EduMind</span>
              <span className="block text-[9px] font-bold text-[#00adb5] tracking-widest uppercase">AI for Wellbeing</span>
            </div>
          </div>
          
          {/* Decorative Student Art Card */}
          <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 mt-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">🎓</div>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">👨‍🏫</div>
            <span className="text-[10px] font-bold text-slate-500 pr-2">Ecosystem Siswa & Guru</span>
          </div>
        </div>
      </div>

      {/* 2. DESCRIPTION HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[25px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="text-[#00adb5]" size={20} />
            Dashboard Ringkasan & Peta Inteligensia (Khusus Siswa & Guru)
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Lihat pencapaian, reduksi tingkat keparahan, profil gaya belajar, dan dominasi otak siswa serta partisipasi aktif guru (Data Real-time).
          </p>
        </div>
      </div>

      {loading && (
        <div className="p-20 text-center bg-white rounded-[35px] border border-slate-100">
          <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#00adb5] rounded-full" />
          <p className="text-slate-400 mt-2 text-sm font-bold">Menghubungkan & mengagregasikan statistik...</p>
        </div>
      )}

      {!loading && currentData && (
        <>
          {/* 3. FIVE TOP METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Card 1: School Wellbeing Index */}
            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">School Wellbeing Index</span>
                <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
                  <Trophy size={16} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-850">{currentData.summary.wellbeingIndex}</span>
                  <span className="text-sm font-semibold text-slate-400">/100</span>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">Sehat</span>
                <div className="flex items-center gap-1 text-[11px] font-black text-emerald-600 mt-3">
                  <TrendingUp size={12} />
                  <span>+{currentData.summary.wellbeingIndexChange} poin dibanding baseline</span>
                </div>
              </div>
            </div>

            {/* Card 2: Bullying Reduction */}
            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Bullying Reduction</span>
                <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
                  <ShieldAlert size={16} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-850">▼ {currentData.summary.bullyingReduction}%</span>
                </div>
                <span className="text-xs font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md inline-block mt-1">
                  {currentData.summary.bullyingCasesBaseline} → {currentData.summary.bullyingCasesCurrent} kasus
                </span>
                <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 mt-3">
                  <span>Kasus terdeteksi & dilaporkan</span>
                </div>
              </div>
            </div>

            {/* Card 3: Risk Reduction */}
            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Wellbeing Risk Reduction</span>
                <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl">
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-850">▼ {currentData.summary.riskReduction}%</span>
                </div>
                <span className="text-xs font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md inline-block mt-1">
                  {currentData.summary.riskBaseline}% → {currentData.summary.riskCurrent}% siswa
                </span>
                <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 mt-3">
                  <span>Kategori At Risk + Critical</span>
                </div>
              </div>
            </div>

            {/* Card 4: Help-Seeking Improvement */}
            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Help-Seeking Improvement</span>
                <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl">
                  <Smile size={16} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-850">▲ {currentData.summary.helpSeekingImprovement}%</span>
                </div>
                <span className="text-xs font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md inline-block mt-1">
                  {currentData.summary.helpSeekingBaseline}% → {currentData.summary.helpSeekingCurrent}% mencari bantuan
                </span>
                <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 mt-3">
                  <span>Konsultasi bimbingan aktif</span>
                </div>
              </div>
            </div>

            {/* Card 5: Teacher Engagement Rate */}
            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Teacher Engagement Rate</span>
                <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl">
                  <Users size={16} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-850">{currentData.summary.teacherEngagement}%</span>
                </div>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
                  ▲ +{currentData.summary.teacherEngagementChange}%
                </span>
                <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 mt-3">
                  <span>Keaktifan guru di dashboard</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. PROGRAM COVERAGE, IMPACT DASHBOARD & WELLBEING INTELLIGENCE */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Box: Program Coverage */}
            <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Coverage</span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-6">
                  <Compass className="text-[#00adb5]" size={20} />
                  Program Coverage
                </h3>
                
                <div className="space-y-6">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <span className="block text-xs text-slate-400 font-bold uppercase">Sekolah Aktif</span>
                        <span className="block text-lg font-black text-slate-850">{currentData.coverage.activeSchools} Sekolah</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-500 bg-slate-50 px-3 py-1 rounded-full">100% implementasi</span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                        <UserCheck size={18} />
                      </div>
                      <div>
                        <span className="block text-xs text-slate-400 font-bold uppercase">Guru Aktif</span>
                        <span className="block text-lg font-black text-slate-850">{currentData.coverage.activeTeachers} Guru</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-500 bg-slate-50 px-3 py-1 rounded-full">92% aktif dashboard</span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl">
                        <Users size={18} />
                      </div>
                      <div>
                        <span className="block text-xs text-slate-400 font-bold uppercase">Siswa Terdaftar</span>
                        <span className="block text-lg font-black text-slate-850">{currentData.coverage.registeredStudents} Siswa</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-500 bg-slate-50 px-3 py-1 rounded-full">91% target onboarding</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Box: Impact Dashboard */}
            <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Impact</span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-6">
                  <TrendingUp className="text-[#00adb5]" size={20} />
                  Impact Dashboard
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-3 pr-2">KPI Utama</th>
                        <th className="py-3 px-2 text-center">Baseline</th>
                        <th className="py-3 px-2 text-center">Saat Ini</th>
                        <th className="py-3 pl-2 text-right">Perubahan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700">
                      {currentData.kpiTable.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-4 pr-2 font-bold text-xs text-slate-800">{row.kpi}</td>
                          <td className="py-4 px-2 text-center text-xs font-bold text-slate-500">{row.baseline}</td>
                          <td className="py-4 px-2 text-center text-xs font-black text-slate-800">{row.current}</td>
                          <td className={`py-4 pl-2 text-right text-xs font-black ${
                            row.isPositive ? "text-emerald-600" : "text-amber-500"
                          }`}>
                            {row.change}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Box: Wellbeing Intelligence */}
            <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Intelligence</span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-4">
                  <BrainCircuit className="text-[#00adb5]" size={20} />
                  Distribusi Wellbeing Siswa
                </h3>
                
                {/* Donut Chart and Legend */}
                <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                  <div className="h-[140px] w-[140px] relative flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currentData.wellbeingDist}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {currentData.wellbeingDist.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-850 leading-none">
                        {currentData.summary.wellbeingIndex}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Index</span>
                    </div>
                  </div>

                  {/* Legend List */}
                  <div className="flex-1 space-y-2.5 w-full">
                    {currentData.wellbeingDist.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-bold text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-black text-slate-850 text-right">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Text below Donut Chart */}
                <div className="mt-4 bg-[#00adb5]/5 p-4 rounded-2xl border border-[#00adb5]/10 flex items-start gap-2.5">
                  <div className="text-md mt-0.5">💡</div>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    Faktor risiko terbesar masih berasal dari tekanan akademik. Dibandingkan bulan pertama, kasus bullying turun 41%.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. TOP 5 RISK FACTORS & ENGAGEMENT DASHBOARD */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Top 5 Risk Factors (Progress bars) */}
            <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm xl:col-span-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Intelligence Risk</span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-6">
                  <AlertTriangle className="text-red-500" size={20} />
                  Top 5 Risk Factors
                </h3>

                <div className="space-y-5">
                  {currentData.riskFactors.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>{item.name}</span>
                      </div>
                      {renderProgressBar(item.value, "bg-red-500")}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold mt-4">
                * Diambil dari asesmen kuesioner Pre-Test & Post-Test
              </p>
            </div>

            {/* Engagement Dashboard (Progress bars) */}
            <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm xl:col-span-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Engagement</span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-6">
                  <MessageSquare className="text-[#00adb5]" size={20} />
                  Engagement Dashboard
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {currentData.engagement.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>{item.name}</span>
                      </div>
                      {renderProgressBar(item.value, "bg-[#00adb5]")}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold mt-4">
                * Menunjukkan tingkat partisipasi aktif siswa terhadap fitur utama aplikasi EduMind.
              </p>
            </div>
          </div>

          {/* 6. STUDENT INTELLIGENCE (LEARNING STYLES, CAREER INTEREST, BRAIN PREF, TALENT PROFILE) */}
          <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Student Profiling</span>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <BrainCircuit className="text-indigo-500" size={24} />
                Student Intelligence
              </h3>
              <p className="text-xs text-slate-450 mt-1">Agregasi kecenderungan belajar, preferensi belahan otak, minat karir, dan potensi kepemimpinan.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Learning Style Donut */}
              <div className="space-y-4 border-r border-slate-100 pr-0 lg:pr-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={16} className="text-blue-500" />
                  Learning Style
                </h4>
                
                <div className="h-[120px] w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentData.learningStyles}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {currentData.learningStyles.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-1.5">
                  {currentData.learningStyles.map((style, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.color }} />
                        <span className="font-bold text-slate-600">{style.name}</span>
                      </div>
                      <span className="font-black text-slate-700">{style.value}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  68% siswa memiliki gaya belajar Visual-Kinestetik sehingga metode pembelajaran berbasis praktik dan visual lebih efektif.
                </p>
              </div>

              {/* Career Interest Top 5 */}
              <div className="space-y-4 border-r border-slate-100 pr-0 lg:pr-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={16} className="text-purple-500" />
                  Career Interest (Top 5)
                </h4>
                
                <div className="space-y-3.5">
                  {currentData.careerInterests.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600">
                        <span>{item.name}</span>
                        <span className="font-black">{item.value}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Mayoritas siswa menunjukkan minat pada bidang teknologi, kesehatan, dan pendidikan.
                </p>
              </div>

              {/* Brain Preference Donut */}
              <div className="space-y-4 border-r border-slate-100 pr-0 lg:pr-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BrainCircuit size={16} className="text-emerald-500" />
                  Brain Preference
                </h4>
                
                <div className="h-[120px] w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentData.brainPreference}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {currentData.brainPreference.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5">
                  {currentData.brainPreference.map((brain, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brain.color }} />
                        <span className="font-bold text-slate-600">{brain.name}</span>
                      </div>
                      <span className="font-black text-slate-700">{brain.value}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Proporsi siswa dengan kecenderungan kreatif masih rendah. Tingkatkan pembelajaran berbasis proyek seni dan inovasi.
                </p>
              </div>

              {/* Talent Intelligence Top 5 */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={16} className="text-rose-500" />
                  Talent Intelligence
                </h4>

                <div className="space-y-3.5">
                  {currentData.talentIntelligence.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600">
                        <span>{item.name}</span>
                        <span className="font-black">{item.value}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  25% siswa memiliki potensi kepemimpinan tinggi. Dapat diprioritaskan menjadi Duta Anti Bullying / Student Ambassador.
                </p>
              </div>

            </div>
          </div>


        </>
      )}
    </div>
  );
}
