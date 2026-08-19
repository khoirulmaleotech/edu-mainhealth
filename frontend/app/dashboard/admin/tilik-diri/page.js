"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, HeartPulse, ExternalLink, Download } from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination } from "antd";
import * as XLSX from "xlsx";

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminTilikDiriPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [schools, setSchools] = useState([]);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [counts, setCounts] = useState({ makassar: 0, bukittinggi: 0 });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalData: 0,
  });
  const [wilayahExport, setWilayahExport] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: params.page || pagination.currentPage,
        pageSize: params.pageSize || pagination.pageSize,
        search: params.search !== undefined ? params.search : debouncedSearch,
        school: params.school !== undefined ? params.school : schoolFilter,
        severity: params.severity !== undefined ? params.severity : severityFilter,
      });

      const sDate = params.startDate !== undefined ? params.startDate : startDate;
      const eDate = params.endDate !== undefined ? params.endDate : endDate;
      if (sDate) queryParams.append("startDate", sDate);
      if (eDate) queryParams.append("endDate", eDate);

      const res = await fetchInstance(`/api/admin/tilik-diri?${queryParams.toString()}`);
      if (res.success) {
        setData(res.data);
        setPagination(res.pagination);
        if (res.counts) setCounts(res.counts);
      }
    } catch (error) {
      console.error("Failed to fetch tilik diri:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSchools = async () => {
      const res = await fetchInstance("/api/admin/schools");
      if (res.success) {
        setSchools(res.data);
      }
    };
    loadSchools();
  }, []);

  useEffect(() => {
    fetchData({ page: 1, search: debouncedSearch, school: schoolFilter, severity: severityFilter, startDate, endDate });
  }, [debouncedSearch, schoolFilter, severityFilter, startDate, endDate]);

  const handleTableChange = (page, pageSize) => {
    fetchData({ page, pageSize });
  };

  const buildExportUrl = (wilayah = "") => {
    const sDateParam = startDate ? `&startDate=${startDate}` : "";
    const eDateParam = endDate ? `&endDate=${endDate}` : "";
    const wilayahParam = wilayah ? `&wilayah=${encodeURIComponent(wilayah)}` : "";
    return `/api/admin/tilik-diri?export=true&search=${encodeURIComponent(search)}&school=${encodeURIComponent(schoolFilter)}&severity=${encodeURIComponent(severityFilter)}${sDateParam}${eDateParam}${wilayahParam}`;
  };

  const exportToExcel = async (url, filenameSuffix = "") => {
    const res = await fetchInstance(url);
    if (res.success && res.data) {
      const excelData = res.data.map((item, index) => {
        const row = {
          "No": index + 1,
          "Nama Anak": item.student_name || "-",
          "Email": item.student_email || "-",
          "Sekolah": item.school_name || "-",
          "Skor Total": item.totalScore,
          "Tingkat Keparahan": item.severity?.level || "-",
          "Tanggal Pengisian": formatDate(item.completedAt),
        };
        if (item.breakdown && Array.isArray(item.breakdown)) {
          item.breakdown.forEach((q) => {
            row[`Skor Q${q.questionId}`] = q.score;
          });
        }
        if (item.openEnded) {
          row["Perasaan Saat Ini"] = item.openEnded.feelings || "-";
          row["Pikiran Mengganggu"] = item.openEnded.thoughts || "-";
          row["Perubahan Perilaku"] = item.openEnded.behaviors || "-";
        }
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil Tilik Diri");
      const suffix = filenameSuffix ? `_${filenameSuffix}` : "";
      XLSX.writeFile(workbook, `Data_Tilik_Diri${suffix}_${new Date().toISOString().split("T")[0]}.xlsx`);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      await exportToExcel(buildExportUrl(), "");
    } catch (error) {
      console.error("Failed to export excel:", error);
    } finally {
      setLoading(false);
      fetchData({ page: pagination.currentPage });
    }
  };

  const handleExportWilayah = async (wilayah) => {
    try {
      setWilayahExport(wilayah);
      await exportToExcel(buildExportUrl(wilayah), wilayah.charAt(0).toUpperCase() + wilayah.slice(1));
    } catch (error) {
      console.error(`Failed to export ${wilayah}:`, error);
    } finally {
      setWilayahExport(false);
    }
  };

  const getSeverityBadge = (level) => {
    switch (level?.toLowerCase()) {
      case "tidak terdeteksi":
        return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Tidak Terdeteksi</span>;
      case "depresi ringan":
        return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold">Ringan</span>;
      case "depresi sedang":
        return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Sedang</span>;
      case "depresi berat / sangat berat":
      case "depresi berat":
        return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">Berat</span>;
      default:
        return <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{level || "-"}</span>;
    }
  };

  return (
    <div className="font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
            <HeartPulse size={28} />
          </div>
          Hasil Tilik Diri
          <div className="bg-[#00adb5]/10 text-[#00adb5] px-3 py-1 rounded-xl text-sm font-bold border border-[#00adb5]/20 flex items-center gap-1.5 ml-2">
            <span>{pagination.totalData}</span>
            <span className="font-medium text-xs opacity-80">Total Data</span>
          </div>
          <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-xl text-sm font-bold border border-orange-200 flex items-center gap-1.5 ml-2">
            <span>{counts.makassar}</span>
            <span className="font-medium text-xs opacity-80">Makassar</span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-sm font-bold border border-emerald-200 flex items-center gap-1.5 ml-2">
            <span>{counts.bukittinggi}</span>
            <span className="font-medium text-xs opacity-80">Bukittinggi</span>
          </div>
        </h1>
        <p className="text-slate-400 font-medium mt-2">
          Pantau semua hasil asesmen Tilik Diri siswa dari seluruh sekolah.
        </p>
      </div>

      <div className="bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full xl:w-auto">
            <div className="flex gap-2 w-full sm:w-auto items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-[#00adb5]/20 outline-none w-full sm:w-auto"
              />
              <span className="text-slate-400 text-xs font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-[#00adb5]/20 outline-none w-full sm:w-auto"
              />
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="text"
                placeholder="Cari nama, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00adb5]/20 outline-none"
              />
            </div>
            
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-600 focus:ring-2 focus:ring-[#00adb5]/20 outline-none w-full sm:w-auto"
            >
              <option value="">Semua Sekolah</option>
              {schools.map((school) => (
                <option key={school._id} value={school.name}>{school.name}</option>
              ))}
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-600 focus:ring-2 focus:ring-[#00adb5]/20 outline-none w-full sm:w-auto"
            >
              <option value="">Semua Tingkat Keparahan</option>
              <option value="Tidak Terdeteksi">Tidak Terdeteksi</option>
              <option value="Depresi Ringan">Depresi Ringan</option>
              <option value="Depresi Sedang">Depresi Sedang</option>
              <option value="Depresi Berat">Depresi Berat</option>
              <option value="Depresi Berat / Sangat Berat">Depresi Berat / Sangat Berat</option>
            </select>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportExcel}
              disabled={loading || data.length === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#00adb5] text-white font-bold rounded-xl shadow-lg shadow-[#00adb5]/20 hover:bg-[#00969e] hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Semua
            </button>
            <button
              onClick={() => handleExportWilayah("makassar")}
              disabled={loading || wilayahExport !== false || counts.makassar === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {wilayahExport === "makassar" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Makassar
            </button>
            <button
              onClick={() => handleExportWilayah("bukittinggi")}
              disabled={loading || wilayahExport !== false || counts.bukittinggi === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {wilayahExport === "bukittinggi" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Bukittinggi
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-5">No</th>
                <th className="px-6 py-5">Nama Siswa</th>
                <th className="px-6 py-5">Sekolah</th>
                <th className="px-6 py-5">Skor</th>
                <th className="px-6 py-5">Tingkat</th>
                <th className="px-6 py-5">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <Loader2 size={32} className="animate-spin text-[#00adb5] mx-auto" />
                    <p className="text-slate-400 mt-2 text-sm font-medium">Memuat data...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 text-slate-300">
                      <HeartPulse size={32} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Belum ada data Tilik Diri.</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-6 border border-slate-200 text-center text-xs font-black text-slate-300">
                      {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
                    </td>
                    <td className="px-6 py-6 border border-slate-200">
                      <div className="font-black text-slate-800 text-sm">{item.student_name || "-"}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{item.student_email || "-"}</div>
                    </td>
                    <td className="px-6 py-6 border border-slate-200 text-xs font-bold text-slate-600">
                      {item.school_name || "-"}
                    </td>
                    <td className="px-6 py-6 border border-slate-200 text-sm font-black text-slate-800">
                      {item.totalScore} <span className="text-[10px] text-slate-400 font-medium">/ 30</span>
                    </td>
                    <td className="px-6 py-6 border border-slate-200">
                      {getSeverityBadge(item.severity?.level)}
                    </td>
                    <td className="px-6 py-6 border border-slate-200 text-xs font-bold text-slate-500">
                      {formatDate(item.completedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && data.length > 0 && (
          <div className="p-6 border-t border-slate-50 flex justify-center">
            <Pagination
              current={pagination.currentPage}
              total={pagination.totalData}
              pageSize={pagination.pageSize}
              onChange={handleTableChange}
              showSizeChanger
              className="font-sans"
            />
          </div>
        )}
      </div>
    </div>
  );
}
