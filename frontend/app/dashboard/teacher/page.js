"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  AlertTriangle,
  BarChart3,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";
import { useRouter } from "next/navigation";

export default function TeacherPage() {
  const router = useRouter()
  const [totalStudent, setTotalStudent] = useState(0);
  const [studentHeatMap, setStudentHeatMap] = useState([]);
  const [totalCriticalAlert, setTotalCriticalAlert] = useState(0);
  const [latestCriticalAlert, setLatestCriticalAlert] = useState(null);

  const [isTotalStudentLoading, setIsTotalStudentLoading] = useState(true);
  const [isStudentHeatMapLoading, setIsStudentHeatMapLoading] = useState(true);
  const [isCriticalAlertLoading, setIsCriticalAlertLoading] = useState(true);
  const [isLatestCriticalAlertLoading, setIsLatestCriticalAlertLoading] = useState(true);

  const fetchTotalStudent = async () => {
    try {
      setIsTotalStudentLoading(true);

      const response = await fetchInstance(
        "/api/teacher/overview/total_siswa"
      );

      setTotalStudent(response?.totalStudents || 0);
    } catch (error) {
      console.error("Failed to fetch total student data", error);
    } finally {
      setIsTotalStudentLoading(false);
    }
  };

  const fetchStudentHeatMap = async () => {
    try {
      setIsStudentHeatMapLoading(true);

      const response = await fetchInstance(
        "/api/teacher/overview/heatmap"
      );

      setStudentHeatMap(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch student heatmap data", error);
    } finally {
      setIsStudentHeatMapLoading(false);
    }
  };

  const fetchCriticalAlert = async () => {
    try {
      setIsCriticalAlertLoading(true);

      const response = await fetchInstance(
        "/api/teacher/overview/total_critical_alert"
      );

      setTotalCriticalAlert(response?.totalCritical || 0);
    } catch (error) {
      console.error("Failed to fetch critical alert data", error);
    } finally {
      setIsCriticalAlertLoading(false);
    }
  };

  const fetchLatestCriticalAlert =
    async () => {
      try {
        setIsLatestCriticalAlertLoading(
          true
        );

        const response =
          await fetchInstance(
            "/api/teacher/overview/latest_critical_alert"
          );

        setLatestCriticalAlert(
          response?.data || null
        );
      } catch (error) {
        console.error(
          "Failed to fetch latest critical alert",
          error
        );
      } finally {
        setIsLatestCriticalAlertLoading(
          false
        );
      }
    };

  useEffect(() => {
    fetchTotalStudent();
    fetchStudentHeatMap();
    fetchCriticalAlert();
    fetchLatestCriticalAlert();
  }, []);

  const statisticsCard = [
    {
      label: "Total Siswa",
      value: totalStudent,
      redirect: "/dashboard/teacher/students",
      icon: <Users className="text-primary" />,
      isLoading: isTotalStudentLoading,
    },
    {
      label: "Alert Kasus",
      value: totalCriticalAlert,
      redirect: "/dashboard/teacher/alerts",
      icon: <AlertTriangle className="text-red-500" />,
      trend: "Perlu tindakan segera",
      isAlert: true,
      isLoading: isCriticalAlertLoading,
    },
  ];

  const moodIndicator = {
    sedih: {
      text: "Intervensi",
      className: "bg-red-100 text-red-700",
    },

    bingung: {
      text: "Observasi",
      className: "bg-yellow-100 text-yellow-700",
    },

    biasa: {
      text: "Stabil",
      className: "bg-green-100 text-green-700",
    },

    senang: {
      text: "Stabil",
      className: "bg-green-100 text-green-700",
    },

    hebat: {
      text: "Stabil",
      className: "bg-green-100 text-green-700",
    },
  };

  return (
    <div className="space-y-10">

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statisticsCard.map((statisticItem, index) => (
          <div
            key={index}
            onClick={() => router.push(statisticItem.redirect)}
            className={`p-7 bg-white rounded-[32px] shadow-sm border transition-all duration-300 hover:cursor-pointer ${statisticItem.isAlert
              ? "border-red-100 ring-4 ring-red-50/50"
              : "border-slate-100"
              }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                {statisticItem.icon}
              </div>

              {statisticItem.isLoading ? (
                <Loader2
                  size={18}
                  className={loadingComponentClassName.spinner}
                />
              ) : (
                <ArrowUpRight
                  size={18}
                  className="text-slate-300"
                />
              )}
            </div>

            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                {statisticItem.label}
              </p>

              {statisticItem.isLoading ? (
                <StatisticsCardLoadingSkeleton />
              ) : (
                <>
                  <h3 className="text-3xl font-black text-slate-800 mt-1">
                    {statisticItem.value}
                  </h3>

                  <p
                    className={`text-[11px] mt-2 font-bold ${statisticItem.isAlert
                      ? "text-red-500"
                      : "text-slate-400"
                      }`}
                  >
                    {statisticItem.trend}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
            <div>
              <h4 className="text-xl font-bold text-slate-800 tracking-tight">
                Heatmap Kesejahteraan Kelas
              </h4>

              <p className="text-sm text-slate-400 font-medium italic">
                Monitoring kondisi emosional real-time siswa
              </p>
            </div>

            {isStudentHeatMapLoading && (
              <SectionLoadingSpinner loadingText="Memuat Data" />
            )}
          </div>

          <section>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 sticky top-0 z-10">
                  <tr className="text-slate-400 text-[10px] uppercase tracking-[0.15em] font-black">
                    <th className="px-8 py-5">Nama Siswa</th>
                    <th className="px-8 py-5">Mood</th>
                    <th className="px-8 py-5">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                  {isStudentHeatMapLoading ? (
                    <HeatMapTableLoadingSkeletonRow />
                  ) : studentHeatMap.length > 0 ? (
                    studentHeatMap
                      .slice(0, 8)
                      .map((student) => {
                        const indicator =
                          moodIndicator[
                          student.label?.toLowerCase()
                          ] || {
                            text: "Tidak Diketahui",
                            className:
                              "bg-slate-100 text-slate-700",
                          };

                        return (
                          <tr
                            key={student._id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-8 py-6">
                              <p className="text-sm font-bold text-slate-700">
                                {student.fullname}
                              </p>
                            </td>

                            <td className="px-8 py-6 text-sm">
                              <span className="text-lg mr-2">
                                {student.label}
                              </span>

                              {student.mood}
                            </td>

                            <td className="px-8 py-6 uppercase">
                              <span
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-tight ${indicator.className}`}
                              >
                                {indicator.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-14 text-slate-400 font-semibold"
                      >
                        Tidak ada data siswa tersedia
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD LAYOUT */}
            <div className="md:hidden p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {isStudentHeatMapLoading ? (
                [...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse bg-slate-50 rounded-3xl p-5 space-y-4"
                  >
                    <div className="h-4 w-32 bg-slate-200 rounded-full"></div>

                    <div className="h-3 w-20 bg-slate-200 rounded-full"></div>

                    <div className="h-8 w-24 bg-slate-200 rounded-full"></div>
                  </div>
                ))
              ) : studentHeatMap.length > 0 ? (
                studentHeatMap
                  .slice(0, 6)
                  .map((student) => {
                    const indicator =
                      moodIndicator[
                      student.label?.toLowerCase()
                      ] || {
                        text: "Tidak Diketahui",
                        className:
                          "bg-slate-100 text-slate-700",
                      };

                    return (
                      <div
                        key={student._id}
                        className="bg-slate-50 rounded-[28px] p-5 border border-slate-100"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">
                              {student.fullname}
                            </h4>

                            <p className="text-sm text-slate-500 mt-1">
                              <span className="mr-1">
                                {student.label}
                              </span>

                              {student.mood}
                            </p>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide whitespace-nowrap ${indicator.className}`}
                          >
                            {indicator.text}
                          </span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-10 text-slate-400 font-semibold">
                  Tidak ada data siswa tersedia
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-primary p-9 rounded-[40px] text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
            {isLatestCriticalAlertLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-3 w-32 bg-white/20 rounded-full"></div>

                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/10 rounded-full"></div>
                  <div className="h-4 w-4/5 bg-white/10 rounded-full"></div>
                </div>
              </div>
            ) : latestCriticalAlert ? (
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <BarChart3
                      size={20}
                      className="text-secondary"
                    />
                  </div>

                  <h4 className="font-bold text-xl">
                    AI Alert Center
                  </h4>
                </div>

                <div className="space-y-5">
                  <div className="bg-white/10 backdrop-blur-md p-5 rounded-[24px] border border-white/20">
                    <p className="text-[10px] font-black text-secondary tracking-widest uppercase mb-2">
                      Deteksi Perundungan
                    </p>

                    <p className="text-sm leading-relaxed font-medium">
                      Sistem mendeteksi anomali pada pola interaksi siswa{" "}
                      <b className="text-secondary">
                        {
                          latestCriticalAlert.student_fullname
                        }
                      </b>{" "}
                      melalui input laporan anonim.
                    </p>
                  </div>

                  <button className="w-full py-4 bg-secondary text-slate-900 rounded-[20px] font-black text-sm hover:scale-[1.02] transition-transform shadow-lg shadow-yellow-500/20 uppercase tracking-wider">
                    Mulai Intervensi
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-white/70 text-sm font-medium">
                Tidak ada alert kritis terbaru
              </div>
            )}

            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white opacity-10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const loadingComponentClassName = {
  cardSkeletonContainer: "mt-3 space-y-2 animate-pulse",
  cardSkeletonTitle: "h-9 w-20 bg-slate-200 rounded-xl",
  cardSkeletonSubtitle: "h-3 w-32 bg-slate-100 rounded-full",

  tableRow: "animate-pulse",
  tableName: "h-4 w-40 bg-slate-200 rounded-full",
  tableMood: "h-4 w-24 bg-slate-200 rounded-full",
  tableStatus: "h-8 w-28 bg-slate-200 rounded-full",

  spinner: "animate-spin text-slate-300",
  tableLoadingText: "flex items-center gap-2 text-slate-400 text-sm font-semibold",
};

const loadingComponentConfiguration = {
  heatMapSkeletonRowCount: 5,
};

function StatisticsCardLoadingSkeleton() {
  return (
    <div className={loadingComponentClassName.cardSkeletonContainer}>
      <div className={loadingComponentClassName.cardSkeletonTitle}></div>

      <div className={loadingComponentClassName.cardSkeletonSubtitle}></div>
    </div>
  );
}

function HeatMapTableLoadingSkeletonRow() {
  return (
    <>
      {[...Array(loadingComponentConfiguration.heatMapSkeletonRowCount)].map(
        (_, loadingIndex) => (
          <tr
            key={loadingIndex}
            className={loadingComponentClassName.tableRow}
          >
            <td className="px-8 py-6">
              <div
                className={loadingComponentClassName.tableName}
              ></div>
            </td>

            <td className="px-8 py-6">
              <div
                className={loadingComponentClassName.tableMood}
              ></div>
            </td>

            <td className="px-8 py-6">
              <div
                className={loadingComponentClassName.tableStatus}
              ></div>
            </td>
          </tr>
        )
      )}
    </>
  );
}

function SectionLoadingSpinner({
  loadingText,
}) {
  return (
    <div className={loadingComponentClassName.tableLoadingText}>
      <Loader2 size={16} className={loadingComponentClassName.spinner} />

      {loadingText}
    </div>
  );
}


