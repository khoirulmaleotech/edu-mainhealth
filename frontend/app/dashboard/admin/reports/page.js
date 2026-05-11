"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Search, Trash2, Eye, Calendar, Printer } from "lucide-react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/reports");
        const data = await res.json();
        if (data.success) setReports(data.reports || []);
      } catch (err) {
        console.error("Gagal memuat laporan:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const filtered = reports.filter((report) => {
    const term = search.toLowerCase();
    return (
      report.incident_type?.toLowerCase().includes(term) ||
      report.description?.toLowerCase().includes(term) ||
      report.reporter?.fullname?.toLowerCase().includes(term) ||
      report.location?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Laporan Insiden
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Semua laporan anonim dan yang diajukan siswa ditampilkan di sini
            untuk pemantauan sekolah.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 w-full md:w-96">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari laporan..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-[35px] bg-white p-12 shadow-sm border border-slate-100 text-center">
          <Loader2 size={48} className="animate-spin text-[#00adb5] mx-auto" />
          <p className="mt-4 text-slate-500 font-medium">
            Memuat data laporan...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[35px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-slate-500 text-sm">Total laporan</p>
              <h3 className="text-2xl font-black text-slate-800">
                {filtered.length}
              </h3>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-[#00adb5] text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#00a2a8] transition-all">
              <Printer size={16} /> Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                <tr>
                  <th className="px-6 py-5 border border-slate-200">#</th>
                  <th className="px-6 py-5 border border-slate-200">
                    Jenis Insiden
                  </th>
                  <th className="px-6 py-5 border border-slate-200">Pelapor</th>
                  <th className="px-6 py-5 border border-slate-200">Lokasi</th>
                  <th className="px-6 py-5 border border-slate-200">Waktu</th>
                  <th className="px-6 py-5 border border-slate-200">Status</th>
                  <th className="px-6 py-5 border border-slate-200">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((report, idx) => (
                  <tr
                    key={report._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-5 border border-slate-200 text-xs font-black text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-5 border border-slate-200 font-bold text-slate-800">
                      {report.incident_type}
                    </td>
                    <td className="px-6 py-5 border border-slate-200 text-sm text-slate-600">
                      {report.reporter?.fullname || "Anonim"}
                    </td>
                    <td className="px-6 py-5 border border-slate-200 text-sm text-slate-600">
                      {report.location || "-"}
                    </td>
                    <td className="px-6 py-5 border border-slate-200 text-sm text-slate-600">
                      {new Date(report.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-5 border border-slate-200">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase ${report.status === "Resolved" ? "bg-emerald-50 text-emerald-600" : report.status === "In Progress" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}
                      >
                        {report.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-5 border border-slate-200 text-right">
                      <button className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:bg-[#00adb5]/10 hover:text-[#00adb5] transition-all">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
