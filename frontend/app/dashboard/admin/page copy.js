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
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [isTotalStudentsLoading, setIsTotalStudentsLoading] = useState(true);
  const [isActiveSchoolsLoading, setIsActiveSchoolsLoading] = useState(true);
  const [isVerifiedPsychologistsLoading, setIsVerifiedPsychologistsLoading] = useState(true);
  const [isPendingVerificationsLoading, setIsPendingVerificationsLoading] = useState(true);
  const [isQueueLoading, setIsQueueLoading] = useState(true);

  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

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

  const fetchVerificationQueue = async (search = "") => {
    try {
      setIsQueueLoading(true);

      const queryParams = new URLSearchParams({
        search,
        page: "1",
        pageSize: "8",
      });

      const response = await fetchInstance(
        `/api/admin/overview/verification-queue?${queryParams.toString()}`
      );

      setVerificationQueue(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch verification queue", error);
    } finally {
      setIsQueueLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalStudents();
    fetchActiveSchools();
    fetchVerifiedPsychologists();
    fetchPendingVerifications();
  }, []);

  useEffect(() => {
    fetchVerificationQueue(debouncedSearchKeyword);
  }, [debouncedSearchKeyword]);

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

      <div className="grid gap-8">
        <div className="lg:col-span-2 bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg">
                  Antrean Verifikasi
                </h3>
                {isQueueLoading && (
                  <div className="mt-1 flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <Loader2 size={14} className="animate-spin" />
                    Memuat data
                  </div>
                )}
              </div>
            </div>
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={16}
              />
              <input
                type="text"
                placeholder="Cari institusi..."
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#00adb5]/20 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Nama Institusi / Pakar</th>
                  <th className="px-8 py-5">Kategori</th>
                  <th className="px-8 py-5">Tanggal Daftar</th>
                  <th className="px-8 py-5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isQueueLoading ? (
                  <VerificationTableSkeleton />
                ) : verificationQueue.length > 0 ? (
                  verificationQueue.map((item) => (
                    <VerificationRow
                      key={`${item.type}-${item._id}`}
                      name={item.name}
                      sub={item.sub}
                      type={item.type}
                      date={formatDate(item.createdAt)}
                      onClick={() => router.push(item.href)}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-16 text-center text-sm font-semibold text-slate-400"
                    >
                      Tidak ada antrean verifikasi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 text-center border-t border-slate-50">
            <button
              onClick={() => router.push("/dashboard/admin/verification-queue")}
              className="text-xs font-black text-[#00adb5] hover:underline uppercase tracking-widest"
            >
              Lihat Semua Antrean
            </button>
          </div>
        </div>
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

function VerificationTableSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-8 py-5">
            <div className="h-4 w-44 bg-slate-200 rounded-full" />
            <div className="h-3 w-32 bg-slate-100 rounded-full mt-2" />
          </td>
          <td className="px-8 py-5">
            <div className="h-6 w-20 bg-slate-100 rounded-full" />
          </td>
          <td className="px-8 py-5">
            <div className="h-4 w-24 bg-slate-100 rounded-full" />
          </td>
          <td className="px-8 py-5">
            <div className="h-10 w-10 bg-slate-100 rounded-xl ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

function VerificationRow({ name, sub, type, date, onClick }) {
  return (
    <tr className="hover:bg-slate-50/80 transition-all cursor-pointer group">
      <td className="px-8 py-5">
        <p className="font-bold text-slate-800 text-sm">{name}</p>
        <p className="text-[10px] text-slate-400 font-medium italic line-clamp-1">
          {sub || "-"}
        </p>
      </td>
      <td className="px-8 py-5">
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${type === "Sekolah"
            ? "bg-blue-50 text-blue-600"
            : "bg-purple-50 text-purple-600"
            }`}
        >
          {type}
        </span>
      </td>
      <td className="px-8 py-5 text-[11px] font-bold text-slate-500">
        {date}
      </td>
      <td className="px-8 py-5 text-right">
        <button
          type="button"
          onClick={onClick}
          className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-[#00adb5] hover:border-[#00adb5]/20 rounded-xl shadow-sm transition-all group-hover:scale-110"
        >
          <ExternalLink size={16} />
        </button>
      </td>
    </tr>
  );
}
