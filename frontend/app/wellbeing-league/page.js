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
  Database,
  X
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
import { useRouter } from "next/navigation";

// Custom styles for charts
const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#EF4444"];

export default function StandaloneWellbeingLeaguePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Info Modal states
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoSection, setInfoSection] = useState("all");

  const openInfoModal = (section) => {
    setInfoSection(section);
    setInfoModalOpen(true);
  };

  useEffect(() => {
    setIsMounted(true);
    const getStats = async () => {
      try {
        setLoading(true);
        const res = await fetchInstance("/api/admin/wellbeing-league?cities=Bukittinggi,Makassar");
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
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
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => openInfoModal("all")}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200/60"
            >
              <HelpCircle size={14} className="text-[#00adb5]" />
              Info Parameter BK
            </button>
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
            {/* 3. THREE TOP METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: School Wellbeing Index */}
              <div
                onClick={() => router.push("/dashboard/admin/tilik-diri")}
                className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:scale-[1.03] hover:shadow-md hover:border-[#00adb5]/30 cursor-pointer transition-all duration-300 relative group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">School Wellbeing Index</span>
                    <HelpCircle
                      size={13}
                      className="text-slate-350 hover:text-[#00adb5] transition-all cursor-help"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInfoModal("wellbeing");
                      }}
                    />
                  </div>
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
              <div
                onClick={() => router.push("/dashboard/admin/reports")}
                className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:scale-[1.03] hover:shadow-md hover:border-[#00adb5]/30 cursor-pointer transition-all duration-300 relative group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Bullying Reduction</span>
                    <HelpCircle
                      size={13}
                      className="text-slate-350 hover:text-[#00adb5] transition-all cursor-help"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInfoModal("bullying");
                      }}
                    />
                  </div>
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
              <div
                onClick={() => router.push("/dashboard/admin/tilik-diri")}
                className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:scale-[1.03] hover:shadow-md hover:border-[#00adb5]/30 cursor-pointer transition-all duration-300 relative group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Wellbeing Risk Reduction</span>
                    <HelpCircle
                      size={13}
                      className="text-slate-350 hover:text-[#00adb5] transition-all cursor-help"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInfoModal("risk");
                      }}
                    />
                  </div>
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
                    <div
                      onClick={() => router.push("/dashboard/admin/verify-schools")}
                      className="flex items-center justify-between border-b border-slate-50 pb-4 cursor-pointer hover:bg-slate-50/50 p-2 rounded-xl transition-all"
                    >
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
                    <div
                      onClick={() => router.push("/dashboard/admin/users")}
                      className="flex items-center justify-between border-b border-slate-50 pb-4 cursor-pointer hover:bg-slate-50/50 p-2 rounded-xl transition-all"
                    >
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
                    <div
                      onClick={() => router.push("/dashboard/admin/users")}
                      className="flex items-center justify-between pb-2 cursor-pointer hover:bg-slate-50/50 p-2 rounded-xl transition-all"
                    >
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
                            <td className={`py-4 pl-2 text-right text-xs font-black ${row.isPositive ? "text-emerald-600" : "text-amber-500"
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
                <p className="text-xs text-slate-455 mt-1">Agregasi kecenderungan belajar, preferensi belahan otak, minat karir, dan potensi kepemimpinan.</p>
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

          {/* 6B. STUDENT INTELLIGENCE - JUMLAH SISWA (RIIL COUNT) */}
          <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Student Profiling</span>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Users size={20} className="text-indigo-500" />
                JStudent Intelligence
              </h3>
              <p className="text-xs text-slate-450 mt-1">Jumlah siswa pada tiap kategori asesmen (dari total siswa yang mengikuti tes).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

              {/* Learning Style Count */}
              <div className="space-y-4 border-r border-slate-100 pr-0 lg:pr-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={16} className="text-blue-500" />
                  Learning Style
                </h4>
                <div className="space-y-2.5">
                  {currentData.learningStyles.map((style, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.color }} />
                        <span className="font-bold text-slate-600">{style.name}</span>
                      </div>
                      <span className="font-black text-slate-700">{style.count ?? 0} siswa</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Total {currentData.learningStyleCounts?.total ?? 0} siswa mengikuti Tes Gaya Belajar.
                </p>
              </div>

              {/* Career Interest Count */}
              <div className="space-y-4 border-r border-slate-100 pr-0 lg:pr-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={16} className="text-purple-500" />
                  Career Interest
                </h4>
                <div className="space-y-2.5">
                  {currentData.careerInterests.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-600">{item.name}</span>
                      <span className="font-black text-slate-700">{item.count ?? 0} siswa</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Total {currentData.careerInterestCounts?.total ?? 0} siswa mengikuti Tes Karir (RIASEC).
                </p>
              </div>

              {/* Brain Preference Count */}
              <div className="space-y-4 border-r border-slate-100 pr-0 lg:pr-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BrainCircuit size={16} className="text-emerald-500" />
                  Brain Preference
                </h4>
                <div className="space-y-2.5">
                  {currentData.brainPreference.map((brain, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brain.color }} />
                        <span className="font-bold text-slate-600">{brain.name}</span>
                      </div>
                      <span className="font-black text-slate-700">{brain.count ?? 0} siswa</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Total {currentData.brainPreferenceCounts?.total ?? 0} siswa mengikuti Tes Otak Kiri-Kanan.
                </p>
              </div>

              {/* Talent Intelligence Count */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={16} className="text-rose-500" />
                  Talent Intelligence
                </h4>
                <div className="space-y-2.5">
                  {currentData.talentIntelligence.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-600">{item.name}</span>
                      <span className="font-black text-slate-700">{item.count ?? 0} siswa</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Total {currentData.talentIntelligenceCounts?.total ?? 0} siswa mengikuti Talent Mapping.
                </p>
              </div>

            </div>
          </div>

        </>
        )}


        {/* 9. INFORMATION MODAL */}
        {infoModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
            <div className="bg-white rounded-[35px] border border-slate-100 max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col justify-between transition-all duration-300 transform scale-100">
              <div>
                {/* Modal Header */}
                <div className="flex justify-between items-start border-b border-slate-50 pb-4 mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                      <Sparkles className="text-amber-500" size={22} />
                      Parameter & Indikator Pengukuran
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">
                      Pelajari bagaimana masing-masing metrik diukur dan diklasifikasikan dalam sistem EduMind.
                    </p>
                  </div>
                  <button
                    onClick={() => setInfoModalOpen(false)}
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-650 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Tabs */}
                <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1 mb-6 overflow-x-auto">
                  {[
                    { key: "all", label: "Semua" },
                    { key: "wellbeing", label: "Wellbeing" },
                    { key: "bullying", label: "Bullying" },
                    { key: "risk", label: "Risk" },
                    { key: "coverage", label: "Coverage" },
                    { key: "intelligence", label: "Intelligence" }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setInfoSection(tab.key)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${infoSection === tab.key
                          ? "bg-[#00adb5] text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Modal Content */}
                <div className="space-y-6">
                  {(infoSection === "all" || infoSection === "wellbeing") && (
                    <div className="bg-blue-50/35 border border-blue-100 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Trophy size={18} />
                        <h4 className="text-sm font-black uppercase tracking-wider">School Wellbeing Index</h4>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed font-bold">
                        <strong>Definisi:</strong> Indeks representasi tingkat kesehatan mental rata-rata seluruh siswa di sekolah.
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        <strong>Cara Kerja:</strong> Sistem menghitung nilai rata-rata skor asesmen kuesioner <span className="font-bold text-slate-750">Tilik Diri</span> siswa (skor maksimum 30). Nilai tersebut dikonversi ke skala 100 dengan rumus: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-bold">(Rata-rata Skor / 30) * 100</code>.
                      </p>
                    </div>
                  )}

                  {(infoSection === "all" || infoSection === "bullying") && (
                    <div className="bg-red-50/35 border border-red-100 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-red-600">
                        <ShieldAlert size={18} />
                        <h4 className="text-sm font-black uppercase tracking-wider">Bullying Reduction</h4>
                      </div>
                      <p className="text-xs text-slate-655 leading-relaxed font-bold">
                        <strong>Definisi:</strong> Persentase penurunan kasus perundungan (verbal, fisik, cyberbullying) di sekolah.
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        <strong>Cara Kerja:</strong> Diambil dari total aduan anonim di modul <span className="font-bold text-slate-750">Laporan Insiden</span>. Dibandingkan secara berkala dengan baseline kasus terdaftar untuk mendeteksi tren perbaikan iklim kenyamanan sekolah.
                      </p>
                    </div>
                  )}

                  {(infoSection === "all" || infoSection === "risk") && (
                    <div className="bg-amber-50/35 border border-amber-100 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle size={18} />
                        <h4 className="text-sm font-black uppercase tracking-wider">Wellbeing Risk Reduction</h4>
                      </div>
                      <p className="text-xs text-slate-655 leading-relaxed font-bold">
                        <strong>Definisi:</strong> Persentase penurunan jumlah siswa dalam kategori kesehatan mental rentan/kritis.
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        <strong>Cara Kerja:</strong> Hasil Tilik Diri dengan klasifikasi keparahan <span className="font-bold text-slate-750">Depresi Sedang</span> (At Risk) dan <span className="font-bold text-slate-750">Depresi Berat</span> (Critical) dijumlahkan, kemudian dipantau rasionya terhadap total siswa aktif agar intervensi BK dapat dioptimalkan.
                      </p>
                    </div>
                  )}

                  {(infoSection === "all" || infoSection === "coverage") && (
                    <div className="bg-teal-50/35 border border-teal-100 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-teal-600">
                        <Compass size={18} />
                        <h4 className="text-sm font-black uppercase tracking-wider">Program Coverage</h4>
                      </div>
                      <ul className="text-xs text-slate-500 space-y-2.5 list-disc pl-4">
                        <li><strong>Sekolah Aktif:</strong> Jumlah institusi sekolah yang terverifikasi dan aktif mengimplementasikan program.</li>
                        <li><strong>Guru Aktif:</strong> Jumlah guru penggerak yang aktif mengakses dashboard untuk memantau siswa.</li>
                        <li><strong>Siswa Terdaftar:</strong> Jumlah siswa teronboarding yang aktif menggunakan aplikasi EduMind.</li>
                      </ul>
                    </div>
                  )}

                  {(infoSection === "all" || infoSection === "intelligence") && (
                    <div className="bg-purple-50/35 border border-purple-100 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-purple-600">
                        <BrainCircuit size={18} />
                        <h4 className="text-sm font-black uppercase tracking-wider">Student Intelligence</h4>
                      </div>
                      <ul className="text-xs text-slate-500 space-y-2.5 list-disc pl-4">
                        <li><strong>Learning Style:</strong> Gaya belajar dominan siswa (Visual, Kinestetik, Auditori, Reading/Writing).</li>
                        <li><strong>Brain Preference:</strong> Profil kecenderungan belahan otak berpikir siswa (Analitis vs Kreatif).</li>
                        <li><strong>Talent Intelligence:</strong> Pemetaan potensi bakat utama siswa untuk penempatan Duta Anti-Bullying.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-8 pt-4 border-t border-slate-50 flex justify-end">
                <button
                  onClick={() => setInfoModalOpen(false)}
                  className="px-5 py-2.5 bg-[#0b0e14] hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
