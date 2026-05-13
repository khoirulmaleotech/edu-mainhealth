"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  HeartPulse,
  X,
  MessageCircle,
  User,
  Clock,
  ShieldAlert,
} from "lucide-react";

import { fetchInstance } from "@/lib/fetchInstance";
import { useDebounce } from "@/hooks/useDebounce";
import CustomSelect from "@/components/CustomSelect";

const severityStyles = {
  high: "bg-orange-50 text-orange-600 border-orange-100",
  critical: "bg-rose-50 text-rose-600 border-rose-100",
};

const statusStyles = {
  pending_review: "bg-yellow-50 text-yellow-700 border-yellow-100",
  reviewed: "bg-blue-50 text-blue-700 border-blue-100",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const statusOption = [
  { value: "all", label: "Semua Status" },
  { value: "pending_review", label: "Pending Review" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" }
]

const reviewStatusOptions = statusOption.filter((option) => option.value !== "all");

const severityOption = [
  { value: "all", label: "Semua Severity" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WellbeingAlertSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, index) => (
        <tr key={index} className="animate-pulse border-b border-slate-50">
          <td className="px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div>
                <div className="h-4 w-32 bg-slate-200 rounded-full" />
                <div className="h-3 w-20 bg-slate-100 rounded-full mt-2" />
              </div>
            </div>
          </td>

          <td className="px-8 py-6">
            <div className="h-7 w-24 bg-slate-200 rounded-full" />
          </td>

          <td className="px-8 py-6">
            <div className="h-4 w-48 bg-slate-100 rounded-full" />
          </td>

          <td className="px-8 py-6">
            <div className="h-7 w-28 bg-slate-200 rounded-full" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function TeacherWellbeingAlertsPage() {
  const [alertList, setAlertList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [paginationInformation, setPaginationInformation] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [isAlertListLoading, setIsAlertListLoading] = useState(true);

  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  const pageSize = 10;

  const fetchWellbeingAlerts = async ({
    page = 1,
    search = "",
    status = "all",
    severity = "all",
  }) => {
    try {
      setIsAlertListLoading(true);

      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        status,
        severity,
      });

      const response = await fetchInstance(
        `/api/teacher/students/wellbeing-alerts?${queryParams.toString()}`
      );

      setAlertList(response?.data || []);
      setSummary(response?.summary || null);
      setPaginationInformation(response?.pagination || null);
    } catch (error) {
      console.error("Failed to fetch wellbeing alerts", error);
    } finally {
      setIsAlertListLoading(false);
    }
  };

  useEffect(() => {
    fetchWellbeingAlerts({
      page: 1,
      search: "",
      status: "all",
      severity: "all",
    });
  }, []);

  useEffect(() => {
    setCurrentPage(1);

    fetchWellbeingAlerts({
      page: 1,
      search: debouncedSearchKeyword,
      status: statusFilter,
      severity: severityFilter,
    });
  }, [debouncedSearchKeyword, statusFilter, severityFilter]);

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > (paginationInformation?.totalPages || 1) ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    fetchWellbeingAlerts({
      page,
      search: debouncedSearchKeyword,
      status: statusFilter,
      severity: severityFilter,
    });
  };

  const handleStatusChange = async (status) => {
    if (!selectedAlert || selectedAlert.status === status) {
      return;
    }

    try {
      setIsStatusUpdating(true);
      setStatusUpdateError("");

      const response = await fetchInstance(
        "/api/teacher/students/wellbeing-alerts",
        {
          method: "PATCH",
          body: JSON.stringify({
            id: selectedAlert._id,
            status,
          }),
        }
      );

      const updatedAlert = response?.data || {
        ...selectedAlert,
        status,
      };

      setSelectedAlert(updatedAlert);
      setAlertList((previousAlertList) =>
        previousAlertList.map((alert) =>
          alert._id === selectedAlert._id ? updatedAlert : alert
        )
      );

      fetchWellbeingAlerts({
        page: currentPage,
        search: debouncedSearchKeyword,
        status: statusFilter,
        severity: severityFilter,
      });
    } catch (error) {
      setStatusUpdateError(error.message || "Gagal mengubah status alert");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const visiblePaginationPages = useMemo(() => {
    const totalPages = paginationInformation?.totalPages || 1;
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );

    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, paginationInformation?.totalPages]);

  const totalPages = paginationInformation?.totalPages || 1;

  const severitySummary = useMemo(() => {
    const result = {
      high: 0,
      critical: 0,
    };

    summary?.severity?.forEach((item) => {
      if (item?._id) {
        result[item._id] = item.count;
      }
    });

    return result;
  }, [summary]);

  const statusSummary = useMemo(() => {
    const result = {
      pending_review: 0,
      reviewed: 0,
      resolved: 0,
    };

    summary?.status?.forEach((item) => {
      if (item?._id) {
        result[item._id] = item.count;
      }
    });

    return result;
  }, [summary]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Wellbeing Alerts
          </h2>

          <p className="text-slate-500 mt-1 font-medium italic text-sm">
            Monitoring sinyal risiko emosional siswa dari Al Mood Buddy.
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <HeartPulse size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Total Alert
          </p>
          <h3 className="text-3xl font-black text-slate-800 mt-2">
            {summary?.total || 0}
          </h3>
        </div>

        <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            High Risk
          </p>
          <h3 className="text-3xl font-black text-slate-800 mt-2">
            {severitySummary.high}
          </h3>
        </div>

        <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
            <ShieldAlert size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Critical
          </p>
          <h3 className="text-3xl font-black text-slate-800 mt-2">
            {severitySummary.critical}
          </h3>
        </div>

        <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Pending Review
          </p>
          <h3 className="text-3xl font-black text-slate-800 mt-2">
            {statusSummary.pending_review}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {/* FILTER AREA */}
        <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex items-center bg-slate-50 px-4 py-2.5 rounded-xl w-full lg:max-w-sm border border-slate-100">
            <Search size={18} className="text-slate-400 mr-2" />

            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              className="bg-transparent outline-none text-sm w-full font-medium"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <CustomSelect
              value={severityFilter}
              onChange={(value) => setSeverityFilter(value)}
              options={severityOption}
              placeholder="Semua Severity"
              className="md:w-64"
            />

            <CustomSelect
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={statusOption}
              placeholder="Pilih Status"
              className="md:w-64"
            />
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto max-h-[650px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 sticky top-0 z-10">
              <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-5">Siswa</th>
                <th className="px-8 py-5">Severity</th>
                <th className="px-8 py-5">Reason</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Tanggal</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {isAlertListLoading ? (
                <WellbeingAlertSkeleton />
              ) : alertList.length > 0 ? (
                alertList.map((alert) => (
                  <tr
                    key={alert._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 uppercase">
                          {alert.student_fullname?.charAt(0)}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {alert.student_fullname}
                          </p>
                          <p className="text-xs text-slate-400 font-semibold mt-1">
                            {alert.class_name || "Tanpa kelas"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span
                        className={`px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-wide ${severityStyles[alert.severity] ||
                          "bg-slate-100 text-slate-500 border-slate-100"
                          }`}
                      >
                        {alert.severity}
                      </span>
                    </td>

                    <td className="px-8 py-6 max-w-md">
                      <p className="text-sm font-semibold text-slate-600 line-clamp-2">
                        {alert.risk_reason || "-"}
                      </p>
                    </td>

                    <td className="px-8 py-6">
                      <span
                        className={`px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-wide ${statusStyles[alert.status] ||
                          "bg-slate-100 text-slate-500 border-slate-100"
                          }`}
                      >
                        {alert.status?.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-500">
                        {formatDate(alert.createdAt)}
                      </p>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wide hover:scale-[1.02] transition-all"
                      >
                        <MessageCircle size={14} />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-slate-400 font-semibold"
                  >
                    Tidak ada wellbeing alert ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden p-4 space-y-4 max-h-[650px] overflow-y-auto">
          {isAlertListLoading ? (
            [...Array(5)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-slate-50 rounded-[28px] p-5 border border-slate-100"
              >
                <div className="h-4 w-32 bg-slate-200 rounded-full" />
                <div className="h-3 w-48 bg-slate-100 rounded-full mt-3" />
                <div className="h-8 w-24 bg-slate-200 rounded-full mt-5" />
              </div>
            ))
          ) : alertList.length > 0 ? (
            alertList.map((alert) => (
              <div
                key={alert._id}
                className="bg-slate-50 rounded-[28px] p-5 border border-slate-100"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center font-black text-slate-600 uppercase">
                      {alert.student_fullname?.charAt(0)}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {alert.student_fullname}
                      </h4>

                      <p className="text-xs text-slate-400 font-semibold mt-1">
                        {alert.class_name || "Tanpa kelas"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase ${severityStyles[alert.severity] ||
                      "bg-slate-100 text-slate-500 border-slate-100"
                      }`}
                  >
                    {alert.severity}
                  </span>
                </div>

                <p className="text-sm text-slate-600 font-semibold mt-5 line-clamp-3">
                  {alert.risk_reason || "-"}
                </p>

                <div className="flex items-center justify-between mt-5">
                  <span
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase ${statusStyles[alert.status] ||
                      "bg-slate-100 text-slate-500 border-slate-100"
                      }`}
                  >
                    {alert.status?.replaceAll("_", " ")}
                  </span>

                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase"
                  >
                    Detail
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-400 font-semibold">
              Tidak ada wellbeing alert ditemukan
            </div>
          )}
        </div>

        {paginationInformation && totalPages > 1 && (
          <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-bold">
              Menampilkan page{" "}
              <span className="text-slate-700">{currentPage}</span> dari{" "}
              <span className="text-slate-700">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!paginationInformation.hasPreviousPage}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              {visiblePaginationPages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-xl border text-xs font-black transition-all ${page === currentPage
                    ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!paginationInformation.hasNextPage}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 z-50 -top-12 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[36px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  Detail Wellbeing Alert
                </h3>
                <p className="text-sm text-slate-400 font-semibold mt-1">
                  {selectedAlert.student_fullname} •{" "}
                  {selectedAlert.class_name || "Tanpa kelas"}
                </p>
              </div>

              <button
                onClick={() => setSelectedAlert(null)}
                className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-[24px] p-5 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Severity
                  </p>
                  <p className="font-black text-slate-800 mt-2 uppercase">
                    {selectedAlert.severity}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-[24px] p-5 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status
                  </p>
                  <div className="mt-2">
                    <CustomSelect
                      value={selectedAlert.status}
                      onChange={handleStatusChange}
                      options={reviewStatusOptions}
                      placeholder="Pilih Status"
                      disabled={isStatusUpdating}
                      triggerClassName="bg-white"
                    />
                  </div>
                  {statusUpdateError && (
                    <p className="text-[11px] font-bold text-rose-500 mt-2">
                      {statusUpdateError}
                    </p>
                  )}
                </div>

                <div className="bg-slate-50 rounded-[24px] p-5 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Date
                  </p>
                  <p className="font-black text-slate-800 mt-2">
                    {formatDate(selectedAlert.createdAt)}
                  </p>
                </div>
              </div>

              <div className="bg-orange-50/70 rounded-[28px] p-6 border border-orange-100">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">
                  Risk Reason
                </p>
                <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                  {selectedAlert.risk_reason || "-"}
                </p>

                {selectedAlert.risk_types?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedAlert.risk_types.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1.5 rounded-full bg-white text-orange-600 border border-orange-100 text-[10px] font-black uppercase tracking-wide"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
                  Conversation Context
                </h4>
                <div className="space-y-4 bg-slate-50 rounded-[28px] p-5 border border-slate-100 max-h-[500px] overflow-y-auto pr-2">
                  {selectedAlert.conversation?.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                        }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-[24px] px-5 py-4 text-sm font-semibold leading-relaxed ${message.role === "user"
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                          {message.role === "user" ? (
                            <User size={13} />
                          ) : (
                            <MessageCircle size={13} />
                          )}
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {message.role === "user"
                              ? "Student"
                              : "Al Mood Buddy"}
                          </span>
                        </div>

                        <p>{message.content}</p>

                        <p className="text-[10px] mt-3 opacity-70 font-bold">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
