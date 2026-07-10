"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  LogIn,
  ClipboardCheck,
  Search,
  Filter,
  RotateCcw,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  AlertCircle,
  MessageSquare,
  Smile,
  AlertTriangle,
  BookOpen,
  Compass,
  Brain,
  Award,
  X,
  Clock,
  ExternalLink
} from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";

export default function ActivityMonitoringPage() {
  // Activity logs & aggregation states
  const [activities, setActivities] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [stats, setStats] = useState({
    logins: { student: 0, teacher: 0 },
    tilikDiriCount: 0,
    totalActivities: 0
  });

  // Selected date breakdown details
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  // Drill-down Modal State
  const [modalDetail, setModalDetail] = useState(null); // { date, activityType, label, data: [], loading: false }

  // Filter states
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Pagination & Loading
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async (currentPage = 1) => {
    try {
      setLoading(true);
      setError("");

      let url = `/api/admin/activity-logs?page=${currentPage}&limit=12`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (role) url += `&role=${encodeURIComponent(role)}`;
      if (type) url += `&type=${encodeURIComponent(type)}`;
      if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
      if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;

      const res = await fetchInstance(url);
      if (res && res.success) {
        setActivities(res.data.activities || []);
        
        const heatmapData = res.data.heatmap || [];
        setHeatmap(heatmapData);
        
        // Default select today or the latest available day
        if (heatmapData.length > 0) {
          setSelectedDayDetail(prev => {
            if (prev) {
              const matched = heatmapData.find(d => d.date === prev.date);
              if (matched) return matched;
            }
            return heatmapData[heatmapData.length - 1];
          });
        } else {
          setSelectedDayDetail(null);
        }

        setStats(res.data.stats || {
          logins: { student: 0, teacher: 0 },
          tilikDiriCount: 0,
          totalActivities: 0
        });
        setTotalPages(res.data.pagination.pages || 1);
        setPage(res.data.pagination.page || 1);
      } else {
        setError("Gagal memuat log aktivitas.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan sistem saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [role, type, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleReset = () => {
    setSearch("");
    setRole("");
    setType("");
    setStartDate("");
    setEndDate("");
    setTimeout(() => fetchLogs(1), 0);
  };

  // Helper date selector
  const selectQuickRange = (days) => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - days);
    
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  // Heatmap cell color calculator based on total activity count
  const getHeatmapColor = (total) => {
    if (total === 0) return "bg-slate-100 border-slate-200 text-slate-300 hover:bg-slate-200/80";
    if (total < 5) return "bg-teal-50 border-teal-100 text-teal-600 hover:bg-teal-100/80";
    if (total < 15) return "bg-teal-200 border-teal-300 text-teal-800 hover:bg-teal-300/80";
    return "bg-[#00adb5] border-[#00adb5]/20 text-white hover:bg-[#00929a]/90";
  };

  // Helper to format date in Indonesian long format
  const formatIndoDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Dynamic Calendar Header Title based on filters
  const getCalendarTitle = () => {
    if (startDate && endDate) {
      const startFmt = new Date(startDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
      const endFmt = new Date(endDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
      return `Kalender keaktifan harian (${startFmt} - ${endFmt})`;
    }
    return "Kalender keaktifan harian (30 hari terakhir)";
  };

  const getRoleDisplayName = (r) => {
    if (r === "student") return "Siswa";
    if (r === "teacher") return "Guru";
    return r;
  };

  // Fetch detailed drill-down users list for popup
  const openDetailModal = async (activityType, label) => {
    if (!selectedDayDetail) return;
    
    setModalDetail({
      date: selectedDayDetail.date,
      activityType,
      label,
      data: [],
      loading: true
    });

    try {
      const url = `/api/admin/activity-logs/detail?date=${selectedDayDetail.date}&activityType=${activityType}`;
      const res = await fetchInstance(url);
      if (res && res.success) {
        setModalDetail(prev => prev ? { ...prev, data: res.data || [], loading: false } : null);
      } else {
        setModalDetail(prev => prev ? { ...prev, loading: false } : null);
      }
    } catch (err) {
      console.error(err);
      setModalDetail(prev => prev ? { ...prev, loading: false } : null);
    }
  };

  // Sub-component to render feature activity progress bar
  const renderStatBar = (label, count, icon, colorClass, activityType, maxValOverride = null) => {
    const maxVal = maxValOverride || Math.max(selectedDayDetail?.studentStats?.totalUniqueStudents || 1, 1);
    const hasData = count > 0;
    return (
      <div 
        onClick={() => hasData && openDetailModal(activityType, label)}
        className={`group/bar space-y-1 ${hasData ? 'cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-xl transition-all' : 'opacity-50'}`}
      >
        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium group-hover/bar:text-[#00adb5] transition-colors">
            {icon}
            {label}
          </span>
          <span className="text-slate-800 font-extrabold text-[10px] bg-slate-100 px-2 py-0.5 rounded-md group-hover/bar:bg-cyan-50 group-hover/bar:text-[#00adb5] transition-all flex items-center gap-1">
            {count} orang
            {hasData && <ExternalLink size={10} className="opacity-60" />}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className={`${colorClass} h-full rounded-full transition-all duration-700 ease-out`} 
            style={{ width: `${Math.min((count / maxVal) * 100, 100)}%` }} 
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-10 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Activity className="text-[#00adb5] animate-pulse" size={32} />
            Monitoring aktivitas user
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            Pantau interaksi harian (login, tilik diri, asesmen) siswa dan guru.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
        >
          <RotateCcw size={14} />
          Reset filter
        </button>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm mb-8 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <Filter size={16} className="text-[#00adb5]" />
          <h3 className="text-sm font-bold text-slate-800">Filter pencarian aktivitas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Cari user</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nama atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 focus:border-[#00adb5] focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 outline-none transition-all"
              />
              <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
          </form>

          {/* Role Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Peran (role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 focus:border-[#00adb5] focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer"
            >
              <option value="">Semua peran</option>
              <option value="student">Siswa (student)</option>
              <option value="teacher">Guru (teacher)</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Jenis aktivitas</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 focus:border-[#00adb5] focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer"
            >
              <option value="">Semua aktivitas</option>
              <option value="login">🔑 Login akun (global)</option>
              <option value="platform_use">💻 Penggunaan platform (spesifik)</option>
            </select>
          </div>

          {/* Date Picker Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Calendar size={12} /> Rentang tanggal
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer focus:bg-white focus:border-[#00adb5]"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer focus:bg-white focus:border-[#00adb5]"
              />
            </div>
          </div>
        </div>

        {/* Quick select buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50">
          <span className="text-[10px] font-bold text-slate-400">Pilih cepat:</span>
          <button
            type="button"
            onClick={() => selectQuickRange(7)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-[#00adb5] hover:text-white transition-all rounded-lg text-[10px] font-bold text-slate-600"
          >
            7 hari
          </button>
          <button
            type="button"
            onClick={() => selectQuickRange(14)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-[#00adb5] hover:text-white transition-all rounded-lg text-[10px] font-bold text-slate-600"
          >
            14 hari
          </button>
          <button
            type="button"
            onClick={() => selectQuickRange(30)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-[#00adb5] hover:text-white transition-all rounded-lg text-[10px] font-bold text-slate-600"
          >
            30 hari
          </button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-cyan-50 text-[#00adb5] rounded-xl flex items-center justify-center shrink-0">
            <LogIn size={24} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold">Login siswa</p>
            <h4 className="text-2xl font-black text-slate-800 mt-0.5">{stats.logins.student} logins</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
            <LogIn size={24} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold">Login guru</p>
            <h4 className="text-2xl font-black text-slate-800 mt-0.5">{stats.logins.teacher} logins</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold">Penggunaan platform</p>
            <h4 className="text-2xl font-black text-slate-800 mt-0.5">{stats.tilikDiriCount} aksi</h4>
          </div>
        </div>
      </div>

      {/* Side-by-Side: Heatmap & Daily Details breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
        
        {/* Heatmap Card */}
        <div className="xl:col-span-3 bg-white border border-slate-100 rounded-[30px] p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-800">{getCalendarTitle()}</h2>
                <p className="text-xs text-slate-400 font-medium">Klik pada tanggal untuk melihat detail bedah aktivitas siswa & guru.</p>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 select-none">
                <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-slate-100 border border-slate-200 rounded-md"></span> kosong</span>
                <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-teal-100 rounded-md"></span> ringan</span>
                <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-teal-200 rounded-md"></span> sedang</span>
                <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-[#00adb5] rounded-md"></span> padat</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-30 gap-2 mb-6">
              {heatmap.map((day) => {
                const displayDate = new Date(day.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short"
                });
                const isSelected = selectedDayDetail?.date === day.date;
                return (
                  <div
                    key={day.date}
                    onClick={() => setSelectedDayDetail(day)}
                    className={`relative group flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "ring-4 ring-[#00adb5] ring-offset-2 scale-105 shadow-md"
                        : "hover:scale-102"
                    } ${getHeatmapColor(day.total)}`}
                  >
                    <span className="text-[10px] font-black tracking-tight">{displayDate}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-30 bg-slate-800 text-white text-[10px] font-medium p-3 rounded-xl shadow-2xl w-48 text-left pointer-events-none">
                      <p className="font-black border-b border-slate-700 pb-1 mb-2">
                        {new Date(day.date).toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="flex justify-between"><span>🔑 Logins:</span> <span className="font-extrabold">{day.logins}</span></p>
                      <p className="flex justify-between text-[#00adb5] font-extrabold mt-1">
                        <span>👨‍🎓 Siswa Aktif:</span>
                        <span>{day.studentStats.totalUniqueStudents} orang</span>
                      </p>
                      <p className="text-[9px] text-slate-400 italic mt-1">Klik untuk bedah detail lengkap</p>
                    </div>
                  </div>
                );
              })}
              {heatmap.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs font-bold text-slate-400">
                  Tidak ada data untuk rentang tanggal ini.
                </div>
              )}
            </div>
          </div>

          {/* Daily Activity Status Checklist */}
          {heatmap.length > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-auto">
              <h3 className="text-xs font-bold text-slate-500 mb-2">Checklist keaktifan harian (seminggu terakhir)</h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {heatmap.slice(-7).map((day) => {
                  const dateLabel = new Date(day.date).toLocaleDateString("id-ID", {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  });
                  const hasActivity = day.total > 0;
                  return (
                    <div key={day.date} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${hasActivity ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-rose-50 border-rose-300 text-rose-500'}`}>
                        {hasActivity ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                          <span className="text-[10px] font-black -mt-[1px]">!</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{dateLabel}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${hasActivity ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {hasActivity ? `${day.total} aksi` : "tidak ada"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Date Detail Panel (Bedah Aktivitas Siswa & Guru) */}
        <div className="bg-white border border-slate-100 rounded-[30px] p-6 shadow-sm flex flex-col">
          {selectedDayDetail ? (
            <>
              <div className="border-b border-slate-100 pb-4 mb-4">
                <span className="text-[10px] font-bold text-[#00adb5] bg-cyan-50 px-3 py-1 rounded-lg">
                  Bedah aktivitas tanggal
                </span>
                <h3 className="text-sm font-black text-slate-800 mt-2 leading-snug">
                  {formatIndoDate(selectedDayDetail.date)}
                </h3>
              </div>

              {/* Core metrics */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-400 leading-tight">Siswa aktif</span>
                  <p className="text-base font-black text-slate-800 mt-1">
                    {selectedDayDetail.studentStats.totalUniqueStudents} orang
                  </p>
                </div>

                <div 
                  onClick={() => selectedDayDetail.uniqueLogins > 0 && openDetailModal("login", "Login Akun")}
                  className={`border border-slate-100 rounded-xl p-2.5 text-center flex flex-col justify-between transition-all ${
                    selectedDayDetail.uniqueLogins > 0 
                      ? "bg-slate-50 hover:bg-cyan-50/50 hover:border-[#00adb5]/20 cursor-pointer group/login" 
                      : "bg-slate-50 opacity-60"
                  }`}
                >
                  <span className="text-[9px] font-bold text-slate-400 leading-tight group-hover/login:text-[#00adb5] transition-colors flex items-center justify-center gap-0.5">
                    User login (unik)
                    {selectedDayDetail.uniqueLogins > 0 && <ExternalLink size={8} />}
                  </span>
                  <p className="text-base font-black text-[#00adb5] mt-1">
                    {selectedDayDetail.uniqueLogins} orang
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-400 leading-tight">Total login</span>
                  <p className="text-base font-black text-slate-800 mt-1">
                    {selectedDayDetail.logins} kali
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown for Student Features */}
              <div className="space-y-4 flex-1">
                <h4 className="text-[10px] font-bold text-slate-400">
                  Detail penggunaan fitur siswa:
                </h4>

                {renderStatBar(
                  "Asesmen Tilik Diri", 
                  selectedDayDetail.studentStats.tilikDiri, 
                  <ClipboardCheck size={13} className="text-amber-500" />, 
                  "bg-amber-500",
                  "tilik_diri"
                )}

                {renderStatBar(
                  "Tes Gaya Belajar (VAK)", 
                  selectedDayDetail.studentStats.learningStyle, 
                  <BookOpen size={13} className="text-indigo-500" />, 
                  "bg-indigo-500",
                  "learning_style"
                )}

                {renderStatBar(
                  "Tes Karir (RIASEC)", 
                  selectedDayDetail.studentStats.riasec, 
                  <Compass size={13} className="text-rose-500" />, 
                  "bg-rose-500",
                  "riasec"
                )}

                {renderStatBar(
                  "Otak Kanan & Kiri", 
                  selectedDayDetail.studentStats.brainDominance, 
                  <Brain size={13} className="text-purple-500" />, 
                  "bg-purple-500",
                  "brain_dominance"
                )}

                {renderStatBar(
                  "Talent Mapping", 
                  selectedDayDetail.studentStats.talentMapping, 
                  <Award size={13} className="text-teal-500" />, 
                  "bg-teal-500",
                  "talent_mapping"
                )}

                {renderStatBar(
                  "Mood Check-in", 
                  selectedDayDetail.studentStats.mood, 
                  <Smile size={13} className="text-pink-500" />, 
                  "bg-pink-500",
                  "mood"
                )}

                {renderStatBar(
                  "Laporan Insiden", 
                  selectedDayDetail.studentStats.incident, 
                  <AlertTriangle size={13} className="text-red-500" />, 
                  "bg-red-500",
                  "incident"
                )}

                {renderStatBar(
                  "Chat Konsultasi", 
                  selectedDayDetail.studentStats.chat, 
                  <MessageSquare size={13} className="text-blue-500" />, 
                  "bg-blue-500",
                  "chat"
                )}

                {/* Teachers */}
                <div className="pt-2 border-t border-slate-100 mt-2">
                  <h4 className="text-[10px] font-bold text-slate-400 mb-2">
                    Detail guru:
                  </h4>
                  {renderStatBar(
                    "Konsultasi Chat", 
                    selectedDayDetail.teacherStats?.chat || 0, 
                    <MessageSquare size={13} className="text-indigo-500" />, 
                    "bg-indigo-500",
                    "chatTeacher",
                    selectedDayDetail.teacherStats?.totalUniqueTeachers
                  )}
                  {renderStatBar(
                    "Review Alert Kasus", 
                    selectedDayDetail.teacherStats?.alertReview || 0, 
                    <AlertTriangle size={13} className="text-rose-500" />, 
                    "bg-rose-500",
                    "alertReview",
                    selectedDayDetail.teacherStats?.totalUniqueTeachers
                  )}
                </div>

              </div>
            </>
          ) : (
            <div className="py-24 text-center text-slate-400">
              <UserCheck size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold">Pilih tanggal untuk melihat detail breakdown</p>
            </div>
          )}
        </div>
        
      </div>

      {/* Timeline Log Feed */}
      <div className="bg-white border border-slate-100 rounded-[30px] p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-black text-slate-800">Timeline aktivitas terbaru</h2>
            <p className="text-xs text-slate-400 font-medium">Log kronologis tindakan pengguna di platform.</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {activities.length} aktivitas ditampilkan
          </span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 text-sm font-bold border border-red-100 mb-6">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 size={36} className="animate-spin text-[#00adb5]" />
            <p className="text-sm font-bold">Mengambil data log...</p>
          </div>
        ) : (
          <>
            {activities.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
                <UserCheck size={40} className="stroke-[1.5]" />
                <p className="text-sm font-bold text-slate-500">Tidak ada aktivitas yang ditemukan</p>
                <p className="text-xs text-slate-400">Cobalah mengubah filter pencarian Anda.</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-100 ml-4 space-y-6">
                {activities.map((item) => {
                  const localTime = new Date(item.timestamp).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                  
                  // Role color mappings
                  const roleColors = {
                    student: "bg-cyan-50 text-cyan-600 border-cyan-100",
                    teacher: "bg-indigo-50 text-indigo-600 border-indigo-100",
                    school_admin: "bg-purple-50 text-purple-600 border-purple-100",
                    superadmin: "bg-amber-50 text-amber-600 border-amber-100",
                    psychologist: "bg-rose-50 text-rose-600 border-rose-100"
                  };
                  const roleBadge = roleColors[item.role] || "bg-slate-50 text-slate-600 border-slate-100";

                  // Type Icons & Colors
                  const iconMap = {
                    login: <LogIn size={14} className="text-cyan-500" />,
                    tilik_diri: <ClipboardCheck size={14} className="text-amber-500" />,
                    learning_style: <ClipboardCheck size={14} className="text-indigo-500" />,
                    riasec: <ClipboardCheck size={14} className="text-rose-500" />,
                    brain_dominance: <ClipboardCheck size={14} className="text-purple-500" />,
                    talent_mapping: <ClipboardCheck size={14} className="text-teal-500" />,
                    mood: <Smile size={14} className="text-pink-500" />,
                    incident: <AlertTriangle size={14} className="text-red-500" />,
                    chat: <MessageSquare size={14} className="text-blue-500" />,
                  };
                  const defaultIcon = <Activity size={14} className="text-slate-400" />;

                  return (
                    <div key={item.id} className="relative pl-8 group">
                      
                      {/* Bullet Icon */}
                      <div className="absolute -left-3.5 top-0.5 w-7 h-7 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:border-[#00adb5]/30 transition-all z-10">
                        {iconMap[item.type] || defaultIcon}
                      </div>

                      {/* Content Card */}
                      <div className="bg-white border border-slate-100 hover:border-slate-200 p-4 rounded-2xl hover:shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h4 className="text-sm font-black text-slate-800">{item.name}</h4>
                            <span className="text-[10px] text-slate-400 font-bold">&#8226;</span>
                            <span className="text-xs text-slate-500 font-medium">{item.email}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide ${roleBadge}`}>
                              {getRoleDisplayName(item.role)}
                            </span>
                          </div>
                          
                          <p className="text-xs font-bold text-slate-600">
                            {item.description}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                            {localTime}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => fetchLogs(page - 1)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 disabled:hover:bg-slate-100 text-xs font-bold rounded-xl transition-all"
                >
                  <ChevronLeft size={16} />
                  Sebelumnya
                </button>
                
                <span className="text-xs font-bold text-slate-500">
                  Halaman <strong className="text-slate-800">{page}</strong> dari <strong className="text-slate-800">{totalPages}</strong>
                </span>

                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => fetchLogs(page + 1)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#00adb5] hover:bg-[#00929a] text-white disabled:opacity-50 text-xs font-bold rounded-xl transition-all"
                >
                  Selanjutnya
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* Drill-down Detail Modal Overlay */}
      {modalDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-[30px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-[#00adb5] bg-cyan-50 px-2.5 py-1 rounded-md">
                  Detail aktivitas harian
                </span>
                <h3 className="text-base font-black text-slate-800 mt-2">
                  {modalDetail.label} ({formatIndoDate(modalDetail.date)})
                </h3>
              </div>
              <button 
                onClick={() => setModalDetail(null)}
                className="w-9 h-9 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all rounded-full flex items-center justify-center active:scale-90"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {modalDetail.loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Loader2 size={32} className="animate-spin text-[#00adb5]" />
                  <p className="text-xs font-bold">Mengambil detail aktivitas...</p>
                </div>
              ) : (
                <>
                  {modalDetail.data.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 space-y-2">
                      <UserCheck size={36} className="mx-auto opacity-50" />
                      <p className="text-xs font-bold">Tidak ada rincian aktivitas terdaftar.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {modalDetail.data.map((item) => {
                        const timeStr = new Date(item.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit"
                        });
                        return (
                          <div key={item.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-50 pb-2 mb-3">
                              <div>
                                <h4 className="text-sm font-black text-slate-800">{item.name}</h4>
                                <p className="text-[11px] text-slate-400 font-medium">{item.email}</p>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {item.schoolName}
                              </span>
                            </div>

                            <div className="flex justify-between items-end gap-4">
                              <p className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl flex-1 border border-slate-100/50">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold pb-1 shrink-0">
                                <Clock size={12} />
                                {timeStr}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-white shrink-0">
              <button 
                onClick={() => setModalDetail(null)}
                className="px-5 py-2.5 bg-[#00adb5] hover:bg-[#00929a] text-white text-xs font-bold rounded-xl shadow-sm active:scale-95 transition-all"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
