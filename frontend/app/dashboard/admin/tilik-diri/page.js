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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalData: 0,
  });

  const debouncedSearch = useDebounce(search, 500);

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: params.page || pagination.currentPage,
        pageSize: params.pageSize || pagination.pageSize,
        search: params.search !== undefined ? params.search : debouncedSearch,
      });

      const res = await fetchInstance(`/api/admin/tilik-diri?${queryParams.toString()}`);
      if (res.success) {
        setData(res.data);
        setPagination(res.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch tilik diri:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ page: 1, search: debouncedSearch });
  }, [debouncedSearch]);

  const handleTableChange = (page, pageSize) => {
    fetchData({ page, pageSize });
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const res = await fetchInstance(`/api/admin/tilik-diri?export=true&search=${encodeURIComponent(search)}`);
      
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

          // Tambahkan skor per pertanyaan (sumbu x)
          if (item.breakdown && Array.isArray(item.breakdown)) {
            item.breakdown.forEach((q) => {
              row[`Skor Q${q.questionId}`] = q.score;
            });
          }

          // Tambahkan jawaban terbuka (sumbu x)
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
        
        // Generate dan download file excel
        XLSX.writeFile(workbook, `Data_Tilik_Diri_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (error) {
      console.error("Failed to export excel:", error);
    } finally {
      setLoading(false);
      fetchData({ page: pagination.currentPage }); // refresh table state
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
        </h1>
        <p className="text-slate-400 font-medium mt-2">
          Pantau semua hasil asesmen Tilik Diri siswa dari seluruh sekolah.
        </p>
      </div>

      <div className="bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type="text"
              placeholder="Cari nama, email, atau sekolah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00adb5]/20 outline-none"
            />
          </div>
          
          <button
            onClick={handleExportExcel}
            disabled={loading || data.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#00adb5] text-white font-bold rounded-xl shadow-lg shadow-[#00adb5]/20 hover:bg-[#00969e] hover:shadow-xl hover:shadow-[#00adb5]/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Export Excel
          </button>
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
