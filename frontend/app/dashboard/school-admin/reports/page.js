"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Search, Trash2, Eye, Calendar, Printer, AlertCircle, X, ExternalLink, MapPin, Clock } from "lucide-react";

// Sesuaikan path ini dengan struktur proyek Anda
import { useDebounce } from "@/hooks/useDebounce"; 

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  
  // State untuk Modal & Detail Fetching
  const [viewingReport, setViewingReport] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchReportsList = useCallback(async () => {
    if (!data) setLoading(true);
    setIsFetching(true);
    setError(null);
    try {
      const url = `/api/admin/reports?page=${page}&pageSize=${limit}&search=${encodeURIComponent(debouncedSearch)}`;
      const res = await fetch(url);
      const json = await res.json();
      
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.message || "Gagal memuat laporan");
      }
    } catch (err) {
      console.error("Gagal memuat laporan:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [page, limit, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchReportsList();
  }, [fetchReportsList]);

  // Fungsi Fetch Detail Saat Tombol Eye Dipencet
  const handleViewDetail = async (id) => {
    // Buka modal segera dengan ID, namun datanya belum lengkap
    setViewingReport({ _id: id });
    setIsDetailLoading(true);
    
    try {
      const res = await fetch(`/api/admin/reports/detail/${id}`);
      const json = await res.json();
      
      if (json.success) {
        setViewingReport(json.report); // Timpa state dengan data penuh
      } else {
        alert("Gagal mengambil detail: " + json.message);
        setViewingReport(null); // Tutup modal jika gagal
      }
    } catch (err) {
      console.error("Gagal mengambil detail laporan", err);
      alert("Terjadi kesalahan jaringan.");
      setViewingReport(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const reports = data?.data || data?.reports || [];
  const pagination = {
    page: data?.pagination?.currentPage || data?.pagination?.page || 1,
    limit: data?.pagination?.pageSize || data?.pagination?.limit || limit,
    total: data?.pagination?.totalData || data?.pagination?.total || 0,
    totalPages: data?.pagination?.totalPages || 1,
  };

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white border border-rose-100 rounded-3xl p-10 max-w-md text-center shadow-lg">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-black text-slate-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#00adb5] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#00adb5]/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 w-full pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Laporan Insiden
            {isFetching && <Loader2 size={18} className="animate-spin text-slate-400" />}
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Semua laporan anonim dan yang diajukan siswa ditampilkan di sini
            untuk pemantauan sekolah.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 w-full md:w-96 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari jenis insiden, lokasi, pelapor..."
            className="bg-transparent outline-none text-sm w-full font-medium"
          />
        </div>
      </div>

      {loading && !data ? (
        <div className="rounded-[35px] bg-white p-12 shadow-sm border border-slate-100 text-center">
          <Loader2 size={48} className="animate-spin text-[#00adb5] mx-auto" />
          <p className="mt-4 text-slate-500 font-medium">
            Memuat data laporan...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[35px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total laporan ditemukan</p>
              <h3 className="text-2xl font-black text-slate-800">
                {pagination.total}
              </h3>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-[#00adb5] text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#00a2a8] transition-all">
              <Printer size={16} /> Export
            </button>
          </div>

          <div className={`overflow-x-auto transition-opacity duration-300 flex-1 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                <tr>
                  <th className="px-6 py-5 border-b border-slate-100">#</th>
                  <th className="px-6 py-5 border-b border-slate-100">Jenis Insiden</th>
                  <th className="px-6 py-5 border-b border-slate-100">Pelapor</th>
                  <th className="px-6 py-5 border-b border-slate-100">Lokasi</th>
                  <th className="px-6 py-5 border-b border-slate-100">Waktu</th>
                  <th className="px-6 py-5 border-b border-slate-100">Status</th>
                  <th className="px-6 py-5 border-b border-slate-100 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm font-medium text-slate-400">
                      {debouncedSearch ? "Pencarian tidak menemukan hasil." : "Belum ada laporan insiden."}
                    </td>
                  </tr>
                ) : (
                  reports.map((report, idx) => {
                    const rowNumber = (pagination.page - 1) * pagination.limit + idx + 1;
                    return (
                      <tr
                        key={report._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-5 text-xs font-black text-slate-400">
                          {rowNumber}
                        </td>
                        <td className="px-6 py-5 font-bold text-slate-800">
                          {report.incident_type}
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-600">
                          {report.reporter_fullname || report.reporter?.fullname || "Anonim"}
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {report.location || "-"}
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {new Date(report.created_at).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              report.status === "Resolved" || report.status === "Selesai"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : report.status === "In Progress" || report.status === "Diproses"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
                            }`}
                          >
                            {report.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => handleViewDetail(report._id)}
                            className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:bg-[#00adb5]/10 hover:text-[#00adb5] transition-all"
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* SERVER-SIDE PAGINATION CONTROLS */}
          {reports.length > 0 && (
             <div className="bg-slate-50/50 px-8 py-5 border-t border-slate-100 flex items-center justify-between">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Sebelumnya
                </button>
                <span className="text-sm font-bold text-slate-400">
                  Halaman <span className="text-slate-700">{pagination.page}</span> dari {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Selanjutnya
                </button>
             </div>
          )}
        </div>
      )}

      {/* MODAL: DETAIL LAPORAN */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-[35px] w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100">
              <div>
                <h3 className="text-2xl font-black text-slate-800">Detail Insiden</h3>
                <p className="text-sm font-medium text-slate-400 mt-1">
                  ID Laporan: {viewingReport._id}
                </p>
              </div>
              <button 
                onClick={() => setViewingReport(null)}
                className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl text-slate-400 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-8 min-h-[300px]">
              {isDetailLoading ? (
                 <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400 mt-10">
                    <Loader2 size={40} className="animate-spin text-[#00adb5]" />
                    <p className="text-sm font-semibold tracking-wider uppercase">Mengambil Data Penuh...</p>
                 </div>
              ) : (
                <>
                  {/* Info Utama & Pelapor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Jenis Insiden</p>
                        <p className="text-lg font-bold text-slate-800">{viewingReport.incident_type}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          viewingReport.status === "Resolved" || viewingReport.status === "Selesai"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : viewingReport.status === "In Progress" || viewingReport.status === "Diproses"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                          {viewingReport.status || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Informasi Pelapor</p>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-slate-800">
                          {viewingReport.reporter_fullname || viewingReport.reporter?.fullname || "Pelapor Anonim"}
                        </p>
                        {(viewingReport.reporter_email || viewingReport.reporter?.email) && (
                          <p className="text-xs font-medium text-slate-500">
                            {viewingReport.reporter_email || viewingReport.reporter?.email}
                          </p>
                        )}
                        <span className="inline-block px-2 py-0.5 bg-sky-100 text-sky-600 text-[10px] font-bold rounded uppercase">
                          {viewingReport.reporter_role || viewingReport.reporter?.role || "Tidak diketahui"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Waktu & Lokasi */}
                  <div className="flex flex-wrap gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mr-6">
                      <div className="p-2 bg-white rounded-xl shadow-sm"><Calendar size={16} className="text-[#00adb5]" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Dilaporkan Pada</p>
                        <p className="text-sm font-bold text-slate-700">{new Date(viewingReport.created_at).toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mr-6">
                      <div className="p-2 bg-white rounded-xl shadow-sm"><Clock size={16} className="text-amber-500" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Waktu Kejadian</p>
                        <p className="text-sm font-bold text-slate-700">{viewingReport.occurrence_time || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm"><MapPin size={16} className="text-rose-500" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Lokasi</p>
                        <p className="text-sm font-bold text-slate-700">{viewingReport.location || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Deskripsi Kejadian</p>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {viewingReport.description || "Tidak ada deskripsi yang diberikan."}
                    </div>
                  </div>

                  {/* Bukti (Evidence) */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Bukti Lampiran</p>
                    {viewingReport.evidence_url ? (
                      <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 inline-block">
                        {/* Render Gambar Langsung */}
                        <img 
                          src={viewingReport.evidence_url} 
                          alt="Bukti Insiden" 
                          className="max-h-80 w-auto object-contain rounded-2xl"
                          onError={(e) => {
                             // Fallback jika URL bukan gambar langsung (misal: PDF/Doc)
                             e.target.style.display = 'none';
                             e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        {/* Fallback & Overlay Link */}
                        <a 
                          href={viewingReport.evidence_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ display: 'none' }} // Akan di-override 'flex' oleh onError jika error gambar
                        >
                          <span className="flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-xl text-sm font-bold shadow-lg">
                            Buka Resolusi Penuh/File <ExternalLink size={16} />
                          </span>
                        </a>
                      </div>
                    ) : (
                      <div className="p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-sm font-medium text-slate-400 text-center">
                        Tidak ada bukti gambar/dokumen yang dilampirkan.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
