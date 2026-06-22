"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Building2,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ExternalLink,
  Search,
  Loader2,
  MapPin,
  ClipboardCheck,
  Lightbulb,
  Compass,
  Brain,
  Star,
  Smile,
  Bell,
  AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";

import { fetchInstance } from "@/lib/fetchInstance";
import { useDebounce } from "@/hooks/useDebounce";

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [activeSchools, setActiveSchools] = useState(0);
  const [verifiedPsychologists, setVerifiedPsychologists] = useState(0);
  const [pendingPsychologists, setPendingPsychologists] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [pendingSchools, setPendingSchools] = useState(0);

  const [isTotalStudentsLoading, setIsTotalStudentsLoading] = useState(true);
  const [isActiveSchoolsLoading, setIsActiveSchoolsLoading] = useState(true);
  const [isVerifiedPsychologistsLoading, setIsVerifiedPsychologistsLoading] = useState(true);
  const [isPendingVerificationsLoading, setIsPendingVerificationsLoading] = useState(true);

  const [schoolsStats, setSchoolsStats] = useState([]);
  const [isSchoolsStatsLoading, setIsSchoolsStatsLoading] = useState(true);

  const [citiesStats, setCitiesStats] = useState([]);
  const [isCitiesStatsLoading, setIsCitiesStatsLoading] = useState(true);

  const [featureUsage, setFeatureUsage] = useState(null);
  const [isFeatureUsageLoading, setIsFeatureUsageLoading] = useState(true);

  const [moodSchools, setMoodSchools] = useState([]);
  const [isMoodSchoolsLoading, setIsMoodSchoolsLoading] = useState(true);

  const [activities, setActivities] = useState([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);

  const fetchTotalStudents = async () => {
    try {
      setIsTotalStudentsLoading(true);

      const response = await fetchInstance("/api/admin/overview/total-students");

      setTotalStudents(response?.totalStudents || 0);
      setTotalTeachers(response?.totalTeachers || 0);
    } catch (error) {
      console.error("Failed to fetch total students", error);
    } finally {
      setIsTotalStudentsLoading(false);
    }
  };

  const fetchActiveSchools = async () => {
    try {
      setIsActiveSchoolsLoading(true);

      const response = await fetchInstance("/api/admin/overview/active-schools");

      setActiveSchools(response?.activeSchools || 0);
    } catch (error) {
      console.error("Failed to fetch active schools", error);
    } finally {
      setIsActiveSchoolsLoading(false);
    }
  };

  const fetchVerifiedPsychologists = async () => {
    try {
      setIsVerifiedPsychologistsLoading(true);

      const response = await fetchInstance(
        "/api/admin/overview/verified-psychologists"
      );

      setVerifiedPsychologists(response?.verifiedPsychologists || 0);
      setPendingPsychologists(response?.pendingPsychologists || 0);
    } catch (error) {
      console.error("Failed to fetch verified psychologists", error);
    } finally {
      setIsVerifiedPsychologistsLoading(false);
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      setIsPendingVerificationsLoading(true);

      const response = await fetchInstance(
        "/api/admin/overview/pending-verifications"
      );

      setPendingVerifications(response?.pendingVerifications || 0);
      setPendingSchools(response?.pendingSchools || 0);
    } catch (error) {
      console.error("Failed to fetch pending verifications", error);
    } finally {
      setIsPendingVerificationsLoading(false);
    }
  };

  const fetchSchoolsStats = async () => {
    try {
      setIsSchoolsStatsLoading(true);
      const response = await fetchInstance("/api/admin/overview/schools-stats");
      setSchoolsStats(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch schools stats", error);
    } finally {
      setIsSchoolsStatsLoading(false);
    }
  };

  const fetchCitiesStats = async () => {
    try {
      setIsCitiesStatsLoading(true);
      const response = await fetchInstance("/api/admin/overview/cities-stats");
      setCitiesStats(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch cities stats", error);
    } finally {
      setIsCitiesStatsLoading(false);
    }
  };

  const fetchFeatureUsage = async () => {
    try {
      setIsFeatureUsageLoading(true);
      const response = await fetchInstance("/api/admin/overview/feature-usage");
      setFeatureUsage(response?.data || null);
    } catch (error) {
      console.error("Failed to fetch feature usage", error);
    } finally {
      setIsFeatureUsageLoading(false);
    }
  };

  const fetchMoodSchools = async () => {
    try {
      setIsMoodSchoolsLoading(true);
      const response = await fetchInstance("/api/admin/overview/mood-schools");
      setMoodSchools(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch mood schools", error);
    } finally {
      setIsMoodSchoolsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setIsActivitiesLoading(true);
      const response = await fetchInstance("/api/admin/overview/activities");
      setActivities(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalStudents();
    fetchActiveSchools();
    fetchVerifiedPsychologists();
    fetchPendingVerifications();
    fetchSchoolsStats();
    fetchCitiesStats();
    fetchFeatureUsage();
    fetchMoodSchools();
    fetchActivities();
  }, []);

  const statisticsCards = [
    {
      title: "Total Siswa",
      value: totalStudents,
      icon: <Users className="text-[#00adb5]" />,
      trend: "Dari koleksi users",
      redirect: "/dashboard/admin/users",
      isLoading: isTotalStudentsLoading,
    },
    {
      title: "Total Guru",
      value: totalTeachers,
      icon: <Users className="text-indigo-500" />,
      trend: "Dari koleksi users",
      redirect: "/dashboard/admin/users",
      isLoading: isTotalStudentsLoading,
    },
    {
      title: "Sekolah Aktif",
      value: activeSchools,
      icon: <Building2 className="text-blue-500" />,
      trend: "Sekolah terverifikasi",
      redirect: "/dashboard/admin/verify-schools",
      isLoading: isActiveSchoolsLoading,
    },
    {
      title: "Psikolog Terverifikasi",
      value: verifiedPsychologists,
      icon: <CheckCircle2 className="text-green-500" />,
      trend: `${formatNumber(pendingPsychologists)} pending`,
      redirect: "/dashboard/admin/verify-psychologist",
      isLoading: isVerifiedPsychologistsLoading,
    },
    {
      title: "Butuh Verifikasi",
      value: pendingVerifications,
      icon: <ShieldAlert className="text-amber-500" />,
      trend: `${formatNumber(pendingSchools)} sekolah pending`,
      isLoading: isPendingVerificationsLoading,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-10 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Dashboard Kontrol
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            Pantau data siswa, sekolah, psikolog, dan antrean verifikasi dari database.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {statisticsCards.map((statistic) => (
          <StatCard
            key={statistic.title}
            title={statistic.title}
            value={formatNumber(statistic.value)}
            icon={statistic.icon}
            trend={statistic.trend}
            isLoading={statistic.isLoading}
            onClick={() => router.push(statistic.redirect ? statistic.redirect : "")}
          />
        ))}
      </div>

      {/* PENGGUNAAN FITUR */}
      <div className="mb-10">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-4">Penggunaan Fitur Siswa</div>
        {isFeatureUsageLoading ? (
           <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <Loader2 size={14} className="animate-spin" /> Memuat data penggunaan fitur...
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-100 rounded-[16px] p-5 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                  <ClipboardCheck size={24} />
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tilik Diri</p>
                  <h4 className="text-xl font-black text-slate-800">{featureUsage?.tilikDiri || 0}</h4>
               </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[16px] p-5 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                  <Lightbulb size={24} />
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tes Gaya Belajar</p>
                  <h4 className="text-xl font-black text-slate-800">{featureUsage?.learningStyle || 0}</h4>
               </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[16px] p-5 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
                  <Compass size={24} />
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tes Karir (RIASEC)</p>
                  <h4 className="text-xl font-black text-slate-800">{featureUsage?.riasec || 0}</h4>
               </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[16px] p-5 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
                  <Brain size={24} />
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Otak Kanan & Kiri</p>
                  <h4 className="text-xl font-black text-slate-800">{featureUsage?.brainDominance || 0}</h4>
               </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[16px] p-5 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  <Star size={24} />
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">EduMind Talent</p>
                  <h4 className="text-xl font-black text-slate-800">{featureUsage?.talentMapping || 0}</h4>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* RATA-RATA MOOD CHECKING */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em]">Rata-Rata Mood Checking (5 Sekolah Teratas)</div>
          <a href="/dashboard/admin/mood-monitoring" className="text-[10px] font-black text-[#00adb5] uppercase tracking-wider hover:underline flex items-center gap-1">Learn More <ArrowUpRight size={12} /></a>
        </div>
        {isMoodSchoolsLoading ? (
           <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <Loader2 size={14} className="animate-spin" /> Memuat data mood...
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {moodSchools.map((item, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-[16px] p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
                    <Smile size={20} />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-800">{item.averageMood}</span>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider -mt-1">Skor Rata-Rata</p>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.schoolName}</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-1"><span className="font-bold text-[#00adb5]">{item.totalLogs}</span> Log Masuk</p>
              </div>
            ))}
            {moodSchools.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm font-bold text-slate-400">
                 Belum ada data mood checking.
              </div>
            )}
          </div>
        )}
      </div>

      {/* PER KOTA */}
      <div className="mb-10">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-4">Statistik per kota</div>
        {isCitiesStatsLoading ? (
           <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <Loader2 size={14} className="animate-spin" /> Memuat data kota...
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {citiesStats.map((cityData, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-[10px] p-[14px] shadow-sm hover:shadow-md transition-all">
                <div className="text-xs font-bold text-slate-800 mb-3 flex items-start gap-1.5 line-clamp-2">
                  <MapPin size={14} className="text-[#00adb5] flex-shrink-0 mt-0.5" />
                  {cityData.city}
                </div>
                
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-[10px] text-slate-500">Sekolah Aktif</span>
                  <span className="text-xs font-bold text-[#00adb5]">{cityData.activeSchools}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-[10px] text-slate-500">Total Siswa</span>
                  <span className="text-xs font-bold text-slate-800">{cityData.totalStudents}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-[10px] text-slate-500">Total Guru</span>
                  <span className="text-xs font-bold text-[#00adb5]">{cityData.totalTeachers}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-[10px] text-slate-500">Total Pre-Test</span>
                  <span className="text-xs font-bold text-emerald-500">{cityData.totalPreTest || 0}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[10px] text-slate-500">Total Post-Test</span>
                  <span className="text-xs font-bold text-indigo-500">{cityData.totalPostTest || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PER SEKOLAH */}
      <div className="mb-10">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-4">Statistik per sekolah</div>
        {isSchoolsStatsLoading ? (
           <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <Loader2 size={14} className="animate-spin" /> Memuat data sekolah...
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {schoolsStats.map((schoolData, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-[10px] p-[14px] shadow-sm hover:shadow-md transition-all">
                <div className="text-xs font-bold text-slate-800 mb-1 flex items-start gap-1.5">
                  <MapPin size={14} className="text-[#00adb5] flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{schoolData.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 mb-3 ml-5">{schoolData.city || "Tidak diketahui"}</div>
                
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-[10px] text-slate-500">Total Siswa</span>
                  <span className="text-xs font-bold text-slate-800">{schoolData.totalStudents}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-[10px] text-slate-500">Total Guru</span>
                  <span className="text-xs font-bold text-[#00adb5]">{schoolData.totalTeachers}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-[10px] text-slate-500">Total Pre-Test</span>
                  <span className="text-xs font-bold text-emerald-500">{schoolData.totalPreTest || 0}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[10px] text-slate-500">Total Post-Test</span>
                  <span className="text-xs font-bold text-indigo-500">{schoolData.totalPostTest || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, trend, isLoading, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white p-6 md:p-8 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {isLoading ? (
          <Loader2 size={18} className="text-slate-300 animate-spin" />
        ) : (
          <ArrowUpRight size={18} className="text-slate-300" />
        )}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {title}
      </p>
      {isLoading ? (
        <StatCardSkeleton />
      ) : (
        <>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mt-1">
            {value}
          </h2>
          <p className="text-[10px] font-bold text-green-500 mt-2 bg-green-50 inline-block px-2 py-1 rounded-lg italic">
            {trend}
          </p>
        </>
      )}
    </button>
  );
}

function StatCardSkeleton() {
  return (
    <div className="mt-3 space-y-2 animate-pulse">
      <div className="h-9 w-20 bg-slate-200 rounded-xl" />
      <div className="h-5 w-32 bg-slate-100 rounded-lg" />
    </div>
  );
}
