"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  MessageSquareWarning,
  ShieldAlert,
  Clock,
  Loader2,
  User,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function TeacherAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({
    totalAlerts: 0,
    pendingReview: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        const res = await fetch("/api/teacher/alerts");
        const data = await res.json();
        if (data.success) {
          setStudents(data.students || []);
          setAlerts(data.alerts || []);
          setSummary(
            data.summary || { totalAlerts: 0, pendingReview: 0, totalStudents: 0 }
          );
        }
      } catch (error) {
        console.error("Gagal memuat alert:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  const selectedStudentName = students.find(
    (s) => s._id === selectedStudentId
  )?.fullname;

  const displayedAlerts = selectedStudentName
    ? alerts.filter((alert) => alert.student === selectedStudentName)
    : alerts;

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-rose-500" size={32} />
            Early Warning System
          </h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            Pantau indikasi krisis mental siswa yang terdeteksi oleh sistem AI.
          </p>
        </div>

        {/* FILTER DROPDOWN */}
        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 w-full sm:w-72 shadow-sm">
          <Search size={18} className="text-slate-400 shrink-0" />
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-transparent outline-none text-sm text-slate-700 w-full font-medium"
          >
            <option value="">Semua Siswa Terhubung</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.fullname}{" "}
                {student.class_name ? `(${student.class_name})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[35px] bg-white p-16 text-center shadow-sm border border-slate-100 flex flex-col items-center">
          <Loader2 className="animate-spin text-rose-400" size={48} />
          <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">
            Menganalisis Data...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* SUMMARY */}
          <div className="xl:col-span-1 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
              Ringkasan
            </h3>

            {/* Total Peringatan */}
            <div className="rounded-[30px] border border-rose-100 p-6 bg-rose-50/50 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldAlert size={100} className="text-rose-500" />
              </div>
              <p className="text-xs uppercase tracking-[0.1em] text-rose-600 font-bold">
                Total Peringatan
              </p>
              <p className="text-4xl font-black text-rose-600 mt-2">
                {summary.totalAlerts}
              </p>
            </div>

            {/* Menunggu Tindak Lanjut */}
            <div className="rounded-3xl border border-rose-200 p-5 bg-white shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Menunggu Tindak Lanjut
              </p>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {summary.pendingReview}
              </p>
              <span className="text-[9px] font-bold text-rose-400 mt-1 bg-rose-50 inline-block px-2 py-0.5 rounded">
                PENDING REVIEW
              </span>
            </div>

            {/* Siswa Dipantau */}
            <div className="rounded-3xl border border-slate-200 p-5 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <User size={16} className="text-slate-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Siswa Dipantau
                  </p>
                  <p className="text-sm font-black text-slate-700">
                    {summary.totalStudents} Orang
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ALERTS FEED */}
          <div className="xl:col-span-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-2 mb-4">
              Daftar Peringatan Kritis
            </h3>

            {displayedAlerts.length === 0 ? (
              <div className="bg-white rounded-[35px] border border-slate-200 shadow-sm p-16 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  Semua Terkendali
                </h3>
                <p className="text-slate-500 font-medium text-sm mt-2 max-w-sm">
                  Tidak ada indikasi krisis yang terdeteksi pada{" "}
                  {selectedStudentId ? "siswa ini" : "kelas Anda"}.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="relative overflow-hidden rounded-[30px] border border-rose-200 bg-white p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-all hover:shadow-md"
                  >
                    {/* Garis kiri merah */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-rose-500 rounded-l-[30px]" />

                    {/* Ikon */}
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
                      <MessageSquareWarning size={24} />
                    </div>

                    {/* Detail */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-lg font-black text-slate-800">
                          {alert.student}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">
                          {alert.class}
                        </span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider bg-rose-500 text-white">
                          HIGH RISK
                        </span>
                        {alert.status === "pending_review" && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider bg-amber-400 text-white">
                            Pending Review
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-2">
                        {alert.type}
                      </p>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-sm font-medium text-slate-600 italic">
                          "{alert.desc}"
                        </p>
                      </div>
                    </div>

                    {/* Waktu & Aksi */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                        <Clock size={12} />
                        {formatDate(alert.time)}
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all">
                        Tindak Lanjuti <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}