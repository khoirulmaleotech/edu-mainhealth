"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Eye,
  Loader2,
  ShieldAlert,
  X,
  MessageSquare,
  Flame,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";

import AdminPagination from "@/components/AdminPagination";
import CustomSelect from "@/components/CustomSelect";
import { fetchInstance } from "@/lib/fetchInstance";

const pageSize = 10;

const severityLabel = {
  critical: "Kritis",
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

const severityClassName = {
  critical: "bg-rose-100 text-rose-700 border-rose-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "pending_review", label: "Perlu Peninjauan" },
  { value: "reviewed", label: "Sudah Ditinjau" },
  { value: "resolved", label: "Selesai" },
];

const severityOptions = [
  { value: "all", label: "Semua Tingkat Risk" },
  { value: "critical", label: "Kritis" },
  { value: "high", label: "Tinggi" },
  { value: "medium", label: "Sedang" },
  { value: "low", label: "Rendah" },
];

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatCard({ title, value, icon: Icon, className }) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {title}
          </p>
          <h3 className="text-3xl font-black text-slate-800 mt-2">
            {value || 0}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${className}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function AdminCriticalChatLogsPage() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);

  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [teacherNoteInput, setTeacherNoteInput] = useState("");

  const fetchLogs = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });

      if (selectedSeverity !== "all") {
        params.append("severity", selectedSeverity);
      }
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      const res = await fetchInstance(`/api/admin/critical-chat-logs?${params.toString()}`);
      if (res?.success) {
        setLogs(res.data.logs || []);
        setSummary(res.data.summary || null);
        setPagination(res.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch critical chat logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchLogs(1);
  }, [selectedSeverity, selectedStatus]);

  const handlePageChange = (page) => {
    if (page < 1 || page > (pagination?.totalPages || 1) || page === currentPage) return;
    setCurrentPage(page);
    fetchLogs(page);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedLog) return;
    try {
      setUpdatingStatus(true);
      const res = await fetchInstance("/api/admin/critical-chat-logs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedLog._id,
          status: newStatus,
          teacher_note: teacherNoteInput,
        }),
      });

      if (res?.success) {
        setSelectedLog((prev) => ({
          ...prev,
          status: newStatus,
          teacher_note: teacherNoteInput,
        }));
        fetchLogs(currentPage);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openLogDetail = (log) => {
    setSelectedLog(log);
    setTeacherNoteInput(log.teacher_note || "");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-black uppercase tracking-wider border border-rose-100">
            Anonim & Terjaga Security
          </span>
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-2">
          Indikator Chat Kritis & Distress
        </h2>
        <p className="text-slate-500 mt-1 font-medium italic text-sm">
          Pemantauan anonim log pesan siswa yang terindikasi mengalami emotional/relationship distress tinggi.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Indikator Severe"
          value={summary?.totalSevereIndicators || 0}
          icon={Flame}
          className="bg-rose-50 text-rose-600"
        />
        <StatCard
          title="Log Risiko Kritis"
          value={summary?.severityBreakdown?.critical || 0}
          icon={ShieldAlert}
          className="bg-red-50 text-red-600"
        />
        <StatCard
          title="Log Risiko Tinggi"
          value={summary?.severityBreakdown?.high || 0}
          icon={AlertTriangle}
          className="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Total Pesan Terdeteksi"
          value={summary?.totalLogs || 0}
          icon={MessageSquare}
          className="bg-slate-100 text-slate-600"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-800">
              Daftar Pesan Terindikasi Kritis
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Data ini bersifat anonim tanpa menampilkan identitas siswa untuk perlindungan privasi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <CustomSelect
              value={selectedSeverity}
              onChange={setSelectedSeverity}
              options={severityOptions}
              placeholder="Filter Risiko"
              className="w-full sm:w-48"
            />
            <CustomSelect
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
              placeholder="Filter Status"
              className="w-full sm:w-48"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="hidden md:block overflow-x-auto max-h-[650px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 sticky top-0 z-10">
              <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-5">Tingkat Risiko</th>
                <th className="px-8 py-5">Pesan Kritis (Preview)</th>
                <th className="px-8 py-5">Kategori Risiko</th>
                <th className="px-8 py-5">Waktu</th>
                <th className="px-8 py-5">Status Review</th>
                <th className="px-8 py-5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-50">
                    <td className="px-8 py-6"><div className="h-6 w-20 bg-slate-200 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-64 bg-slate-200 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-32 bg-slate-100 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-24 bg-slate-100 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-6 w-24 bg-slate-200 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-8 w-8 bg-slate-200 rounded-xl" /></td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${severityClassName[log.severity] || "bg-slate-100 text-slate-600"}`}>
                        {severityLabel[log.severity] || log.severity || "Sedang"}
                      </span>
                    </td>
                    <td className="px-8 py-6 max-w-md">
                      <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-relaxed">
                        "{log.critical_message}"
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1">
                        {(log.risk_types || []).slice(0, 2).map((risk, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                            {risk}
                          </span>
                        ))}
                        {(log.risk_types || []).length > 2 && (
                          <span className="text-[10px] font-bold text-slate-400">+{log.risk_types.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-slate-400 font-semibold">
                        {formatDate(log.createdAt)}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${log.status === "reviewed" || log.status === "resolved"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                        {log.status === "reviewed" ? "Sudah Ditinjau" : log.status === "resolved" ? "Selesai" : "Perlu Peninjauan"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => openLogDetail(log)}
                        className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#00adb5] hover:border-[#00adb5]/20 transition-all"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 font-semibold">
                    Tidak ada indikator chat kritis ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-4 space-y-4 max-h-[650px] overflow-y-auto">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-50 rounded-[28px] p-5 border border-slate-100">
                <div className="h-4 w-36 bg-slate-200 rounded-full" />
                <div className="h-10 w-full bg-slate-100 rounded-xl mt-4" />
              </div>
            ))
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div key={log._id} className="bg-slate-50 rounded-[28px] p-5 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${severityClassName[log.severity] || "bg-slate-100 text-slate-600"}`}>
                    {severityLabel[log.severity] || log.severity}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 line-clamp-3">
                  "{log.critical_message}"
                </p>
                <button
                  onClick={() => openLogDetail(log)}
                  className="w-full py-3 rounded-2xl bg-white border border-slate-100 text-xs font-black uppercase tracking-widest text-[#00adb5]"
                >
                  Lihat Percakapan Anonim
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-400 font-semibold">
              Tidak ada indikator chat kritis.
            </div>
          )}
        </div>

        <AdminPagination
          currentPage={currentPage}
          pagination={pagination}
          onPageChange={handlePageChange}
          accentClassName="bg-[#00adb5] border-[#00adb5] text-white shadow-sm shadow-[#00adb5]/20"
        />
      </div>

      {/* Drawer / Modal Detail */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl h-full bg-white shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Detail Log Anonim
                </span>
                <h3 className="text-2xl font-black text-slate-800 mt-2">
                  Indikator Pesan Siswa
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-6 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${severityClassName[selectedLog.severity]}`}>
                  Tingkat Risiko: {severityLabel[selectedLog.severity] || selectedLog.severity}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Terdeteksi: {formatDate(selectedLog.createdAt)}
                </span>
              </div>

              {/* Risk Reasons & Tags */}
              <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                  Analisis Risiko AI
                </p>
                <p className="text-xs font-bold text-slate-700">
                  {selectedLog.risk_reason || "Tidak ada detail analisis."}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(selectedLog.risk_types || []).map((type, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-rose-200 text-rose-700 text-[10px] font-extrabold rounded-lg">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Conversation Log (Anonymous) */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                  Riwayat Percakapan (Anonim)
                </p>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 max-h-80 overflow-y-auto">
                  {(selectedLog.conversation || []).map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${msg.role === "user"
                        ? "bg-[#00adb5] text-white ml-auto rounded-br-xs font-medium"
                        : "bg-white border border-slate-200 text-slate-700 font-medium"
                        }`}
                    >
                      <p className="text-[9px] opacity-70 font-black uppercase tracking-wider mb-1">
                        {msg.role === "user" ? "Siswa (Anonim)" : "Assistant AI"}
                      </p>
                      {msg.content}
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Note & Status action */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Tindakan Admin / Catatan
                </p>
                <textarea
                  rows={3}
                  placeholder="Tambah catatan admin / konselor untuk tindak lanjut..."
                  value={teacherNoteInput}
                  onChange={(e) => setTeacherNoteInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium outline-none focus:border-[#00adb5]"
                />
                <div className="flex gap-3">
                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus("reviewed")}
                    className="flex-1 py-3 bg-[#00adb5] text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    {updatingStatus && <Loader2 size={14} className="animate-spin" />}
                    Tandai Ditinjau
                  </button>
                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus("resolved")}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    {updatingStatus && <Loader2 size={14} className="animate-spin" />}
                    Tandai Selesai
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
