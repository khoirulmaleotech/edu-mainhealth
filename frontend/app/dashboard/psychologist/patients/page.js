"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Bot,
  Brain,
  Loader2,
  MessageCircle,
  Search,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import AdminPagination from "@/components/AdminPagination";
import CustomSelect from "@/components/CustomSelect";
import { fetchInstance } from "@/lib/fetchInstance";
import { useDebounce } from "@/hooks/useDebounce";

const pageSize = 10;
const criticalLogPageSize = 1;

const severityOptions = [
  { value: "all", label: "Semua Severity" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function RiskBadge({ risk }) {
  const styles = {
    Critical: "bg-red-50 text-red-600 border-red-100",
    High: "bg-orange-50 text-orange-600 border-orange-100",
    Medium: "bg-blue-50 text-blue-600 border-blue-100",
    Low: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${styles[risk] || styles.Medium}`}>
      {risk || "Medium"}
    </span>
  );
}

function CriticalBadge({ patient }) {
  if (!patient.hasCriticalHistory) {
    return (
      <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border bg-slate-50 text-slate-500 border-slate-100">
        Tidak Ada
      </span>
    );
  }

  return (
    <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border bg-red-50 text-red-600 border-red-100 inline-flex items-center gap-1.5">
      <AlertCircle size={12} />
      {patient.criticalSeverity || "Riwayat Kritis"}
    </span>
  );
}

export default function PsychologistPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedCriticalLog, setSelectedCriticalLog] = useState(null);
  const [selectedCriticalStudentId, setSelectedCriticalStudentId] = useState(null);
  const [criticalLogLoading, setCriticalLogLoading] = useState(false);
  const [criticalLogPagination, setCriticalLogPagination] = useState(null);
  const [criticalLogPage, setCriticalLogPage] = useState(1);
  const [criticalLogSeverity, setCriticalLogSeverity] = useState("all");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchPatients = async ({ page = 1, search = "" } = {}) => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      });

      const response = await fetchInstance(`/api/psychologist/patients?${queryParams.toString()}`);

      setPatients(response?.data || []);
      setPagination(response?.pagination || null);
    } catch (error) {
      console.error("Failed to fetch psychologist patients", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchPatients({ page: 1, search: debouncedSearchTerm });
  }, [debouncedSearchTerm]);

  const handlePageChange = (page) => {
    const totalPages = pagination?.totalPages || 1;

    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);
    fetchPatients({ page, search: debouncedSearchTerm });
  };

  const openPatientChat = (roomId) => {
    if (!roomId) return;
    router.push(`/dashboard/psychologist/chat?roomId=${roomId}`);
  };

  const fetchCriticalLogs = async ({
    studentId,
    page = 1,
    severity = criticalLogSeverity,
    fallbackStudent = null,
  }) => {
    try {
      setCriticalLogLoading(true);

      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(criticalLogPageSize),
        severity,
      });

      const response = await fetchInstance(
        `/api/psychologist/patients/${studentId}/critical-logs?${queryParams.toString()}`
      );

      setSelectedCriticalLog(response?.data || null);
      setCriticalLogPagination(response?.data?.pagination || null);
      setCriticalLogPage(response?.data?.pagination?.currentPage || page);
    } catch (error) {
      console.error("Failed to fetch critical chat logs", error);
      setSelectedCriticalLog((previous) => previous || {
        student: fallbackStudent,
        sessions: [],
      });
      setCriticalLogPagination(null);
    } finally {
      setCriticalLogLoading(false);
    }
  };

  const openCriticalLogs = async (patient) => {
    const studentId = patient.studentId || patient.patientId;

    if (!studentId) return;

    const fallbackStudent = {
      fullname: patient.fullname,
      email: patient.email,
    };

    setSelectedCriticalStudentId(studentId);
    setCriticalLogSeverity("all");
    setCriticalLogPage(1);
    setCriticalLogPagination(null);
    setSelectedCriticalLog({
      student: fallbackStudent,
      sessions: [],
      pagination: null,
      filters: { severity: "all" },
    });

    await fetchCriticalLogs({
      studentId,
      page: 1,
      severity: "all",
      fallbackStudent,
    });
  };

  const closeCriticalLogs = () => {
    setSelectedCriticalLog(null);
    setSelectedCriticalStudentId(null);
    setCriticalLogLoading(false);
    setCriticalLogPagination(null);
    setCriticalLogPage(1);
    setCriticalLogSeverity("all");
  };

  const handleCriticalLogPageChange = (page) => {
    const totalPages = criticalLogPagination?.totalPages || 1;

    if (
      !selectedCriticalStudentId ||
      page < 1 ||
      page > totalPages ||
      page === criticalLogPage
    ) return;

    setCriticalLogPage(page);
    fetchCriticalLogs({
      studentId: selectedCriticalStudentId,
      page,
      severity: criticalLogSeverity,
      fallbackStudent: selectedCriticalLog?.student,
    });
  };

  const handleCriticalSeverityChange = (severity) => {
    if (!selectedCriticalStudentId) return;

    setCriticalLogSeverity(severity);
    setCriticalLogPage(1);
    fetchCriticalLogs({
      studentId: selectedCriticalStudentId,
      page: 1,
      severity,
      fallbackStudent: selectedCriticalLog?.student,
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-8 text-slate-700">
      {selectedCriticalLog && (
        <CriticalLogsModal
          data={selectedCriticalLog}
          loading={criticalLogLoading}
          currentPage={criticalLogPage}
          pagination={criticalLogPagination}
          severity={criticalLogSeverity}
          onPageChange={handleCriticalLogPageChange}
          onSeverityChange={handleCriticalSeverityChange}
          onClose={closeCriticalLogs}
        />
      )}

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
            Daftar Pasien <Stethoscope className="text-[#00adb5]" size={30} />
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase mt-1 tracking-widest">
            Siswa yang pernah berkonsultasi melalui chat
          </p>
        </div>

        <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm w-full lg:w-auto">
          <Search size={18} className="text-slate-300" />
          <input
            type="text"
            placeholder="Cari pasien..."
            className="bg-transparent outline-none text-xs font-bold w-full md:w-72"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[35px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 border border-slate-200 text-center w-16">No.</th>
                <th className="px-6 py-5 border border-slate-200">Pasien</th>
                <th className="px-6 py-5 border border-slate-200">Pesan Terakhir</th>
                <th className="px-6 py-5 border border-slate-200 text-center">Risiko</th>
                <th className="px-6 py-5 border border-slate-200 text-center">Riwayat Kritis</th>
                <th className="px-6 py-5 border border-slate-200 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#00adb5]" size={40} />
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-slate-400 font-bold italic text-sm">
                    Data pasien tidak ditemukan
                  </td>
                </tr>
              ) : patients.map((patient, index) => (
                <tr key={patient.roomId || patient._id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-6 border border-slate-200 text-center text-xs font-black text-slate-300">
                    {((pagination?.currentPage || currentPage) - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-6 py-6 border border-slate-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-11 w-11 rounded-2xl bg-[#00adb5]/10 text-[#00adb5] flex items-center justify-center font-black shrink-0">
                        {patient.fullname?.charAt(0) || "P"}
                        {patient.unread > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                            {patient.unread > 99 ? "99+" : patient.unread}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-sm truncate">{patient.fullname}</p>
                        <p className="text-xs font-bold text-slate-400 truncate">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 border border-slate-200">
                    <p className="text-xs font-bold text-slate-600 line-clamp-1">{patient.lastMsg}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">{formatDate(patient.updatedAt)}</p>
                  </td>
                  <td className="px-6 py-6 border border-slate-200 text-center">
                    <RiskBadge risk={patient.risk} />
                  </td>
                  <td className="px-6 py-6 border border-slate-200 text-center">
                    <CriticalBadge patient={patient} />
                  </td>
                  <td className="px-6 py-6 border border-slate-200 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openCriticalLogs(patient)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Lihat riwayat AI"
                        disabled={!patient.hasCriticalHistory}
                      >
                        <Brain size={18} />
                      </button>
                      <button
                        onClick={() => openPatientChat(patient.roomId)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#00adb5] hover:text-white transition-all shadow-sm"
                        title="Buka chat"
                      >
                        <MessageCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden p-4 space-y-4 max-h-[650px] overflow-y-auto">
          {loading ? (
            [...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse bg-slate-50 rounded-[28px] p-5 border border-slate-100">
                <div className="h-4 w-36 bg-slate-200 rounded-full" />
                <div className="h-3 w-28 bg-slate-100 rounded-full mt-2" />
                <div className="h-8 w-24 bg-slate-200 rounded-full mt-5" />
              </div>
            ))
          ) : patients.length > 0 ? (
            patients.map((patient) => (
              <div key={patient.roomId || patient._id} className="bg-slate-50 rounded-[28px] p-5 border border-slate-100">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-slate-800 text-sm truncate">{patient.fullname || "-"}</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-1 truncate">{patient.lastMsg || "-"}</p>
                  </div>
                  <div className="shrink-0">
                    <RiskBadge risk={patient.risk} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <CriticalBadge patient={patient} />
                  {patient.unread > 0 && (
                    <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase bg-red-500 text-white">
                      {patient.unread} Baru
                    </span>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openCriticalLogs(patient)}
                    disabled={!patient.hasCriticalHistory}
                    className="py-3 rounded-2xl bg-white border border-slate-100 text-xs font-black uppercase tracking-widest text-orange-500 disabled:text-slate-300 disabled:cursor-not-allowed"
                  >
                    Riwayat AI
                  </button>
                  <button
                    onClick={() => openPatientChat(patient.roomId)}
                    className="py-3 rounded-2xl bg-white border border-slate-100 text-xs font-black uppercase tracking-widest text-[#00adb5]"
                  >
                    Buka Chat
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-400 font-semibold">
              Data pasien tidak ditemukan
            </div>
          )}
        </div>

        {!loading && (
          <AdminPagination
            currentPage={currentPage}
            pagination={pagination}
            onPageChange={handlePageChange}
            accentClassName="bg-[#00adb5] border-[#00adb5] text-white shadow-sm shadow-[#00adb5]/20"
          />
        )}
      </div>
    </div>
  );
}

function CriticalLogsModal({
  data,
  loading,
  currentPage,
  pagination,
  severity,
  onPageChange,
  onSeverityChange,
  onClose,
}) {
  const sessions = data?.sessions || [];
  const totalData = pagination?.totalData || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[35px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        <div className="p-6 md:p-8 bg-slate-50/70 border-b border-slate-100 flex justify-between items-start gap-5">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#00adb5]">
              Riwayat Percakapan AI
            </p>
            <h3 className="font-black text-slate-800 text-xl mt-1 truncate">
              {data?.student?.fullname || "Pasien Anonim"}
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1 truncate">
              {data?.student?.email || "-"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-all text-slate-400 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-slate-100 bg-white">
          <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Navigasi Kasus AI
              </p>
              <p className="text-sm font-black text-slate-800 mt-1">
                Menampilkan 1 percakapan per halaman
              </p>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {totalData > 0
                  ? `Kasus ${currentPage} dari ${pagination?.totalPages || 1} halaman, total ${totalData} kasus`
                  : "Tidak ada kasus sesuai filter"}
              </p>
            </div>

            <CustomSelect
              value={severity}
              onChange={onSeverityChange}
              options={severityOptions}
              placeholder="Severity"
              disabled={loading}
            />
          </div>

          {!loading && pagination && (
            <AdminPagination
              currentPage={currentPage}
              pagination={pagination}
              onPageChange={onPageChange}
              accentClassName="bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-500/20"
            />
          )}
        </div>

        <div className="p-5 md:p-8 overflow-y-auto">
          {loading ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="animate-spin text-[#00adb5]" size={36} />
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-bold">
              Tidak ada riwayat percakapan AI yang tersimpan.
            </div>
          ) : (
            <div className="space-y-6">
              {sessions.map((sessionLog, sessionIndex) => (
                <div
                  key={sessionLog._id || sessionIndex}
                  className="border border-slate-100 rounded-[28px] overflow-hidden bg-white"
                >
                  <div className="p-5 md:p-6 bg-slate-50/80 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Kasus AI halaman {currentPage}
                        </p>
                        <h4 className="text-sm md:text-base font-black text-slate-800 mt-1">
                          {sessionLog.critical_message || "Percakapan terdeteksi berisiko"}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-2">
                          {formatDate(sessionLog.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border bg-red-50 text-red-600 border-red-100">
                          {sessionLog.severity || "unknown"}
                        </span>
                      </div>
                    </div>

                    {sessionLog.risk_reason && (
                      <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-orange-500 mb-1">
                          Alasan Risiko
                        </p>
                        <p className="text-xs font-semibold leading-relaxed text-slate-600">
                          {sessionLog.risk_reason}
                        </p>
                      </div>
                    )}

                  </div>

                  <div className="p-5 bg-white">
                    <div className="space-y-4 bg-slate-50 rounded-[24px] p-4 md:p-5 border border-slate-100 max-h-[460px] overflow-y-auto">
                      {sessionLog.conversation?.length > 0 ? (
                        sessionLog.conversation.map((message, messageIndex) => {
                          const isStudent = message.role === "user";

                          return (
                            <div
                              key={`${sessionLog._id || sessionIndex}-${messageIndex}`}
                              className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-[24px] px-5 py-4 text-sm font-semibold leading-relaxed ${isStudent
                                  ? "bg-[#00adb5] text-white rounded-br-none"
                                  : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                                  }`}
                              >
                                <div className="flex items-center gap-2 mb-2 opacity-80">
                                  {isStudent ? <User size={13} /> : <Bot size={13} />}
                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                    {isStudent ? "Siswa" : "Al Mood Buddy"}
                                  </span>
                                </div>

                                <p>{message.content}</p>

                                <p className="text-[10px] mt-3 opacity-70 font-bold">
                                  {formatDate(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-10 text-center text-slate-400 font-bold text-sm">
                          Detail percakapan tidak tersedia untuk sesi ini.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
