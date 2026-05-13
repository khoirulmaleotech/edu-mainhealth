"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  HeartPulse,
  Loader2,
  Search,
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

export default function VerificationQueuePage() {
  const router = useRouter();
  const [queue, setQueue] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);
  const pageSize = 20;

  const fetchVerificationQueue = async ({ page = 1, search = "" } = {}) => {
    try {
      setIsLoading(true);

      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      });

      const response = await fetchInstance(
        `/api/admin/overview/verification-queue?${queryParams.toString()}`
      );

      setQueue(response?.data || []);
      setPagination(response?.pagination || null);
    } catch (error) {
      console.error("Failed to fetch verification queue", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchVerificationQueue({ page: 1, search: debouncedSearchKeyword });
  }, [debouncedSearchKeyword]);

  const handlePageChange = (page) => {
    if (page < 1 || page > (pagination?.totalPages || 1) || page === currentPage) {
      return;
    }

    setCurrentPage(page);
    fetchVerificationQueue({ page, search: debouncedSearchKeyword });
  };

  return (
    <div className="p-4 md:p-8 space-y-8 text-slate-700">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
            Antrean Verifikasi
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase mt-1 tracking-widest">
            Semua sekolah dan psikolog yang belum terverifikasi
          </p>
        </div>

        <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm w-full lg:w-96">
          <Search size={18} className="text-slate-300" />
          <input
            type="text"
            placeholder="Cari sekolah, psikolog, email, instansi..."
            className="bg-transparent outline-none text-xs font-bold w-full"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Total Antrean
          </p>
          <h3 className="text-3xl font-black text-slate-800 mt-2">
            {pagination?.totalData || 0}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-[35px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 border border-slate-200 text-center w-16">No.</th>
                <th className="px-6 py-5 border border-slate-200">Nama</th>
                <th className="px-6 py-5 border border-slate-200">Kategori</th>
                <th className="px-6 py-5 border border-slate-200">Info</th>
                <th className="px-6 py-5 border border-slate-200">Tanggal</th>
                <th className="px-6 py-5 border border-slate-200 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#00adb5]" size={40} />
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-slate-400 font-bold italic text-sm">
                    Tidak ada antrean verifikasi
                  </td>
                </tr>
              ) : (
                queue.map((item, index) => (
                  <tr key={`${item.type}-${item._id}`} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-6 border border-slate-200 text-center text-xs font-black text-slate-400">
                      {((pagination?.currentPage || currentPage) - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-6 border border-slate-200 font-black text-slate-800 text-sm">
                      {item.name}
                    </td>
                    <td className="px-6 py-6 border border-slate-200">
                      <span className={`px-3 py-1 rounded-full border flex items-center gap-1.5 w-fit text-[9px] font-black uppercase tracking-tighter ${
                        item.type === "Sekolah"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}>
                        {item.type === "Sekolah" ? <Building2 size={12} /> : <HeartPulse size={12} />}
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-6 border border-slate-200 text-xs font-bold text-slate-500">
                      {item.sub || "-"}
                    </td>
                    <td className="px-6 py-6 border border-slate-200 text-xs font-bold text-slate-500">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-6 border border-slate-200 text-right">
                      <button
                        onClick={() => router.push(item.href)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#00adb5] hover:text-white transition-all shadow-sm"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && pagination && pagination.totalPages > 1 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page {currentPage} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={!pagination.hasPreviousPage} className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-[#00adb5] hover:text-white transition-all">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={!pagination.hasNextPage} className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-[#00adb5] hover:text-white transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
