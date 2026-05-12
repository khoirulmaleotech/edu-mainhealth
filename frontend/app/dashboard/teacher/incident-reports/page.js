"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Search,
  ShieldAlert,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { fetchInstance } from "@/lib/fetchInstance";
import { useDebounce } from "@/hooks/useDebounce";
import { Image } from "antd";
import CustomSelect from "@/components/CustomSelect";

const pageSize = 10;

const statusLabel = {
  pending: "Menunggu",
  reviewing: "Ditinjau",
  resolved: "Selesai",
  rejected: "Ditolak",
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
};

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function IncidentSummaryCard({ title, value, icon: Icon, className }) {
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

function IncidentTableSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, index) => (
        <tr
          key={index}
          className="animate-pulse border-b border-slate-50"
        >
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

export default function TeacherIncidentReportsPage() {
  const [incidentList, setIncidentList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [paginationInformation, setPaginationInformation] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  console.log(selectedIncident)

  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  const fetchIncidentReports = async ({
    page = 1,
    search = "",
    status = "all",
  }) => {
    try {
      setIsLoading(true);

      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        status,
      });

      const response = await fetchInstance(
        `/api/teacher/incident-reports?${queryParams.toString()}`
      );

      setIncidentList(response?.data || []);
      setSummary(response?.summary || null);
      setPaginationInformation(response?.pagination || null);
    } catch (error) {
      console.error("Failed to fetch incident reports", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentReports({
      page: 1,
      search: "",
      status: "all",
    });
  }, []);

  useEffect(() => {
    setCurrentPage(1);

    fetchIncidentReports({
      page: 1,
      search: debouncedSearchKeyword,
      status: selectedStatus,
    });
  }, [debouncedSearchKeyword, selectedStatus]);

  const handlePageChange = (page) => {
    const totalPages = paginationInformation?.totalPages || 1;

    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);

    fetchIncidentReports({
      page,
      search: debouncedSearchKeyword,
      status: selectedStatus,
    });
  };

  const visiblePaginationPages = useMemo(() => {
    const totalPages = paginationInformation?.totalPages || 1;
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );

    let endPage = Math.min(
      totalPages,
      startPage + maxVisiblePages - 1
    );

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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Laporan Insiden Siswa
        </h2>

        <p className="text-slate-500 mt-1 font-medium italic text-sm">
          Pantau laporan kejadian yang dikirim oleh siswa wali kelas Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <IncidentSummaryCard
          title="Total Laporan"
          value={summary?.total}
          icon={ShieldAlert}
          className="bg-slate-100 text-slate-600"
        />

        <IncidentSummaryCard
          title="Menunggu"
          value={summary?.pending}
          icon={AlertTriangle}
          className="bg-amber-50 text-amber-600"
        />

        <IncidentSummaryCard
          title="Ditinjau"
          value={summary?.reviewing}
          icon={Clock}
          className="bg-blue-50 text-blue-600"
        />

        <IncidentSummaryCard
          title="Selesai"
          value={summary?.resolved}
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
              <Search
                size={18}
                className="text-slate-400 mr-2"
              />

              <input
                type="text"
                placeholder="Cari nama siswa..."
                value={searchKeyword}
                onChange={(event) =>
                  setSearchKeyword(event.target.value)
                }
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
                <IncidentTableSkeleton />
              ) : incidentList.length > 0 ? (
                incidentList.map((incident) => (
                  <tr
                    key={incident._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-800">
                        {incident.reporter_fullname}
                      </p>

                      <p className="text-xs text-slate-400 font-semibold mt-1">
                        {formatDate(incident.created_at)}
                      </p>
                    </td>

                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-700">
                        {incident.incident_type}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-500">
                        {incident.location}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wide ${statusClassName[incident.status] ||
                          "bg-slate-50 text-slate-500 border-slate-100"
                          }`}
                      >
                        {statusLabel[incident.status] || incident.status}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/20 transition-all"
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
          ) : incidentList.length > 0 ? (
            incidentList.map((incident) => (
              <div
                key={incident._id}
                className="bg-slate-50 rounded-[28px] p-5 border border-slate-100"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">
                      {incident.reporter_fullname}
                    </h4>

                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      {formatDate(incident.created_at)}
                    </p>
                  </div>

                  <span
                    className={`h-fit px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wide ${statusClassName[incident.status] ||
                      "bg-slate-50 text-slate-500 border-slate-100"
                      }`}
                  >
                    {statusLabel[incident.status] || incident.status}
                  </span>
                </div>

                <div className="mt-5 space-y-2">
                  <p className="text-sm font-bold text-slate-700">
                    {incident.incident_type}
                  </p>

                  <p className="text-xs font-semibold text-slate-400">
                    Lokasi: {incident.location}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedIncident(incident)}
                  className="mt-5 w-full py-3 rounded-2xl bg-white border border-slate-100 text-xs font-black uppercase tracking-widest text-primary"
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

        {paginationInformation && totalPages > 1 && (
          <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-bold">
              Page{" "}
              <span className="text-slate-700">
                {currentPage}
              </span>{" "}
              dari{" "}
              <span className="text-slate-700">
                {totalPages}
              </span>
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

      {selectedIncident && (
        <div className="fixed inset-0 z-50 -top-8 flex justify-end bg-slate-950/30 backdrop-blur-sm">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Detail Laporan Insiden
                </p>

                <h3 className="text-2xl font-black text-slate-800 mt-2">
                  {selectedIncident.incident_type}
                </h3>
              </div>

              <button
                onClick={() => setSelectedIncident(null)}
                className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-8">
              <span
                className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-wide ${statusClassName[selectedIncident.status] ||
                  "bg-slate-50 text-slate-500 border-slate-100"
                  }`}
              >
                {statusLabel[selectedIncident.status] ||
                  selectedIncident.status}
              </span>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Nama Pelapor
                </p>

                <p className="text-sm font-bold text-slate-800 mt-2">
                  {selectedIncident.reporter_fullname}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Lokasi
                </p>

                <p className="text-sm font-bold text-slate-800 mt-2">
                  {selectedIncident.location}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Waktu Kejadian
                </p>

                <p className="text-sm font-bold text-slate-800 mt-2">
                  {selectedIncident.occurrence_time}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Tanggal Laporan
                </p>

                <p className="text-sm font-bold text-slate-800 mt-2">
                  {formatDate(selectedIncident.created_at)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Bukti Gambar
                </p>

                <p className="text-sm font-bold text-slate-800 mt-2">
                  <Image src={selectedIncident.evidence_url} width={100} height={100} />
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Deskripsi
                </p>

                <div className="mt-3 bg-slate-50 border border-slate-100 rounded-[24px] p-5">
                  <p className="text-sm font-medium text-slate-600 leading-7">
                    {selectedIncident.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
