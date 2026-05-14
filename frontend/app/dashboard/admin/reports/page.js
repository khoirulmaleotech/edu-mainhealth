"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import AdminPagination from "@/components/AdminPagination";
import CustomSelect from "@/components/CustomSelect";
import { fetchInstance } from "@/lib/fetchInstance";
import { useDebounce } from "@/hooks/useDebounce";
import { Image } from "antd";

const pageSize = 10;

const statusLabel = {
  pending: "Menunggu",
  reviewing: "Ditinjau",
  resolved: "Selesai",
  rejected: "Ditolak",
  Pending: "Menunggu",
  "In Progress": "Ditinjau",
  Resolved: "Selesai",
};

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Menunggu" },
  { value: "reviewing", label: "Ditinjau" },
  { value: "resolved", label: "Selesai" },
  { value: "rejected", label: "Ditolak" },
];

const statusClassName = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  reviewing: "bg-blue-50 text-blue-600 border-blue-100",
  resolved: "bg-emerald-50 text-emerald-600 border-emerald-100",
  rejected: "bg-rose-50 text-rose-600 border-rose-100",
  Pending: "bg-amber-50 text-amber-600 border-amber-100",
  "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
  Resolved: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ReportSummaryCard({ title, value, icon: Icon, className }) {
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

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${className}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function ReportTableSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, index) => (
        <tr key={index} className="animate-pulse border-b border-slate-50">
          <td className="px-8 py-6">
            <div className="h-4 w-36 bg-slate-200 rounded-full" />
            <div className="h-3 w-24 bg-slate-100 rounded-full mt-2" />
          </td>
          <td className="px-8 py-6">
            <div className="h-4 w-28 bg-slate-200 rounded-full" />
          </td>
          <td className="px-8 py-6">
            <div className="h-4 w-24 bg-slate-200 rounded-full" />
          </td>
          <td className="px-8 py-6">
            <div className="h-7 w-20 bg-slate-200 rounded-full" />
          </td>
          <td className="px-8 py-6">
            <div className="h-8 w-8 bg-slate-200 rounded-xl" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AdminReportsPage() {
  const [reportList, setReportList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [paginationInformation, setPaginationInformation] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  const fetchSummary = async () => {
    try {
      const response = await fetchInstance("/api/admin/reports/summary");

      setSummary(response?.summary || null);
    } catch (error) {
      console.error("Failed to fetch admin report summary", error);
    }
  };

  const fetchReports = async ({
    page = 1,
    search = "",
    status = "all",
  } = {}) => {
    try {
      setIsLoading(true);

      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        status,
      });

      const response = await fetchInstance(
        `/api/admin/reports?${queryParams.toString()}`
      );

      setReportList(response?.data || []);
      setPaginationInformation(response?.pagination || null);
    } catch (error) {
      console.error("Failed to fetch admin reports", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openReportDetail = async (id) => {
    try {
      setSelectedReport({ _id: id });
      setIsDetailLoading(true);

      const response = await fetchInstance(`/api/admin/reports/detail/${id}`);

      setSelectedReport(response?.report || null);
    } catch (error) {
      console.error("Failed to fetch admin report detail", error);
      setSelectedReport(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeReportDetail = () => {
    setSelectedReport(null);
    setIsDetailLoading(false);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    setCurrentPage(1);

    fetchReports({
      page: 1,
      search: debouncedSearchKeyword,
      status: selectedStatus,
    });
  }, [debouncedSearchKeyword, selectedStatus]);

  const handlePageChange = (page) => {
    const totalPages = paginationInformation?.totalPages || 1;

    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);

    fetchReports({
      page,
      search: debouncedSearchKeyword,
      status: selectedStatus,
    });
  };

  const totalReports = summary?.total || 0;
  const pendingReports = summary?.pending || 0;
  const reviewingReports = summary?.reviewing || 0;
  const resolvedReports = summary?.resolved || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Laporan Insiden
        </h2>

        <p className="text-slate-500 mt-1 font-medium italic text-sm">
          Pantau semua laporan kejadian yang dikirim oleh siswa di sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ReportSummaryCard
          title="Total Laporan"
          value={totalReports}
          icon={ShieldAlert}
          className="bg-slate-100 text-slate-600"
        />

        <ReportSummaryCard
          title="Menunggu"
          value={pendingReports}
          icon={AlertTriangle}
          className="bg-amber-50 text-amber-600"
        />

        <ReportSummaryCard
          title="Ditinjau"
          value={reviewingReports}
          icon={Clock}
          className="bg-blue-50 text-blue-600"
        />

        <ReportSummaryCard
          title="Selesai"
          value={resolvedReports}
          icon={CheckCircle2}
          className="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-800">
              Daftar Laporan
            </h3>

            <p className="text-xs text-slate-400 font-semibold mt-1">
              Klik detail untuk melihat informasi lengkap insiden.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center bg-slate-50 px-4 py-2.5 rounded-xl w-full md:w-72 border border-slate-100">
              <Search size={18} className="text-slate-400 mr-2" />

              <input
                type="text"
                placeholder="Cari laporan..."
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                className="bg-transparent outline-none text-sm w-full font-medium"
              />
            </div>

            <CustomSelect
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
              placeholder="Pilih Status"
              className="md:w-64"
            />
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto max-h-[650px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 sticky top-0 z-10">
              <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-5">Pelapor</th>
                <th className="px-8 py-5">Jenis Insiden</th>
                <th className="px-8 py-5">Lokasi</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <ReportTableSkeleton />
              ) : reportList.length > 0 ? (
                reportList.map((report) => (
                  <tr
                    key={report._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-800">
                        {report.reporter_fullname || report.reporter?.fullname || "Anonim"}
                      </p>

                      <p className="text-xs text-slate-400 font-semibold mt-1">
                        {formatDate(report.created_at)}
                      </p>
                    </td>

                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-700">
                        {report.incident_type || "-"}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-500">
                        {report.location || "-"}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wide ${statusClassName[report.status] ||
                          "bg-slate-50 text-slate-500 border-slate-100"
                          }`}
                      >
                        {statusLabel[report.status] || report.status || "-"}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <button
                        onClick={() => openReportDetail(report._id)}
                        className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#00adb5] hover:border-[#00adb5]/20 transition-all"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-16 text-slate-400 font-semibold"
                  >
                    Tidak ada laporan insiden ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden p-4 space-y-4 max-h-[650px] overflow-y-auto">
          {isLoading ? (
            [...Array(5)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-slate-50 rounded-[28px] p-5 border border-slate-100"
              >
                <div className="h-4 w-36 bg-slate-200 rounded-full" />
                <div className="h-3 w-24 bg-slate-100 rounded-full mt-2" />
                <div className="h-8 w-28 bg-slate-200 rounded-full mt-5" />
              </div>
            ))
          ) : reportList.length > 0 ? (
            reportList.map((report) => (
              <div
                key={report._id}
                className="bg-slate-50 rounded-[28px] p-5 border border-slate-100"
              >
                <div className="flex justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-slate-800 text-sm truncate">
                      {report.reporter_fullname || report.reporter?.fullname || "Anonim"}
                    </h4>

                    <p className="text-xs text-slate-400 font-semibold mt-1 truncate">
                      {formatDate(report.created_at)}
                    </p>
                  </div>

                  <span
                    className={`h-fit shrink-0 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wide ${statusClassName[report.status] ||
                      "bg-slate-50 text-slate-500 border-slate-100"
                      }`}
                  >
                    {statusLabel[report.status] || report.status || "-"}
                  </span>
                </div>

                <div className="mt-5 space-y-2">
                  <p className="text-sm font-bold text-slate-700">
                    {report.incident_type || "-"}
                  </p>

                  <p className="text-xs font-semibold text-slate-400">
                    Lokasi: {report.location || "-"}
                  </p>
                </div>

                <button
                  onClick={() => openReportDetail(report._id)}
                  className="mt-5 w-full py-3 rounded-2xl bg-white border border-slate-100 text-xs font-black uppercase tracking-widest text-[#00adb5]"
                >
                  Lihat Detail
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-400 font-semibold">
              Tidak ada laporan insiden ditemukan
            </div>
          )}
        </div>

        <AdminPagination
          currentPage={currentPage}
          pagination={paginationInformation}
          onPageChange={handlePageChange}
          accentClassName="bg-[#00adb5] border-[#00adb5] text-white shadow-sm shadow-[#00adb5]/20"
        />
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 -top-8 flex justify-end bg-slate-950/30 backdrop-blur-sm">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Detail Laporan Insiden
                </p>

                <h3 className="text-2xl font-black text-slate-800 mt-2">
                  {selectedReport.incident_type || "-"}
                </h3>
              </div>

              <button
                onClick={closeReportDetail}
                className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {isDetailLoading ? (
              <div className="h-[70vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#00adb5]" size={28} />
              </div>
            ) : (
              <>
                <div className="mt-8">
                  <span
                    className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-wide ${statusClassName[selectedReport.status] ||
                      "bg-slate-50 text-slate-500 border-slate-100"
                      }`}
                  >
                    {statusLabel[selectedReport.status] || selectedReport.status || "-"}
                  </span>
                </div>

                <div className="mt-8 space-y-6">
                  <DetailBlock
                    label="Nama Pelapor"
                    value={selectedReport.reporter_fullname || "Anonim"}
                  />
                  <DetailBlock label="Email Pelapor" value={selectedReport.reporter_email || "-"} />
                  <DetailBlock label="Lokasi" value={selectedReport.location || "-"} />
                  <DetailBlock label="Waktu Kejadian" value={selectedReport.occurrence_time || "-"} />
                  <DetailBlock label="Tanggal Laporan" value={formatDate(selectedReport.created_at)} />

                  {selectedReport.evidence_url && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Bukti Gambar
                      </p>

                      <Image
                        src={selectedReport.evidence_url}
                        alt="Bukti laporan"
                        width={200}
                        height={200}
                      />
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Deskripsi
                    </p>

                    <div className="mt-3 bg-slate-50 border border-slate-100 rounded-[24px] p-5">
                      <p className="text-sm font-medium text-slate-600 leading-7">
                        {selectedReport.description || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailBlock({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>

      <p className="text-sm font-bold text-slate-800 mt-2">
        {value}
      </p>
    </div>
  );
}
