"use client";
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle, XCircle, Search,
  Loader2, Mail, User, Eye, X, Check, AlertTriangle,
  Calendar
} from 'lucide-react';
import AdminPagination from "@/components/AdminPagination";
import CustomSelect from "@/components/CustomSelect";
import { fetchInstance } from "@/lib/fetchInstance";
import { useDebounce } from "@/hooks/useDebounce";

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
];

export default function VerifyPsychologistPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const itemsPerPage = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [confirmAction, setConfirmAction] = useState({ show: false, id: null, name: '', type: '' });

  const fetchData = async ({ page = 1, search = "", status = "all" } = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(itemsPerPage),
        search,
        status,
      });
      const json = await fetchInstance(`/api/admin/verify-psychologist?${queryParams.toString()}`);
      setData(json.data || []);
      setPagination(json.pagination || null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchData({ page: 1, search: debouncedSearchTerm, status: statusFilter });
  }, [debouncedSearchTerm, statusFilter]);

  const totalPages = pagination?.totalPages || 1;
  const currentData = data;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    fetchData({ page, search: debouncedSearchTerm, status: statusFilter });
  };

  const executeAction = async () => {
    const { id, type } = confirmAction;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/verify-psychologist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: type }),
      });
      if (res.ok) {
        setConfirmAction({ show: false, id: null, name: '', type: '' });
        setSelectedItem(null);
        fetchData({ page: currentPage, search: debouncedSearchTerm, status: statusFilter });
      }
    } catch (err) { alert("Kesalahan server"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 relative text-slate-700">

      {/* MODAL KONFIRMASI */}
      {confirmAction.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-white rounded-[35px] p-8 shadow-2xl text-center border border-slate-100">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 ${confirmAction.type === 'approve' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
              {confirmAction.type === 'approve' ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">{confirmAction.type === 'approve' ? 'Aktifkan Psikolog?' : 'Hapus Pendaftaran?'}</h3>
            <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">Konfirmasi untuk {confirmAction.name}</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeAction} disabled={actionLoading} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest ${confirmAction.type === 'approve' ? 'bg-[#00adb5] text-white shadow-lg' : 'bg-red-500 text-white'}`}>
                {actionLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Ya, Lanjutkan'}
              </button>
              <button onClick={() => setConfirmAction({ show: false })} className="w-full py-4 text-slate-400 font-bold text-xs uppercase">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Verifikasi Psikolog</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Manajemen Tenaga Ahli Yayasan Maleo</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
            <Search size={18} className="text-slate-300" />
            <input type="text" placeholder="Cari nama/email..." className="bg-transparent outline-none text-xs font-bold w-full md:w-60" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="Pilih Status"
            className="md:w-56"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[35px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 border border-slate-200 text-center w-16">No.</th>
                <th className="px-6 py-5 border border-slate-200">Nama Lengkap</th>
                <th className="px-6 py-5 border border-slate-200">Email</th>
                <th className="px-6 py-5 border border-slate-200 text-center">Status</th>
                <th className="px-6 py-5 border border-slate-200 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#00adb5]" size={40} /></td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold italic text-sm">Data tidak ditemukan</td></tr>
              ) : currentData.map((item, index) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-6 border border-slate-200 text-center text-xs font-black text-slate-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-6 py-6 border border-slate-200 font-black text-slate-800 text-sm">{item.fullname}</td>
                  <td className="px-6 py-6 border border-slate-200 text-xs font-bold text-slate-600">{item.email}</td>
                  <td className="px-6 py-6 border border-slate-200 text-center">
                    <span className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-tighter inline-flex items-center gap-1.5 ${item.is_verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                      {item.is_verified ? <CheckCircle size={12} /> : <XCircle size={12} />} {item.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-6 border border-slate-200 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!item.is_verified && (
                        <button onClick={() => setConfirmAction({ show: true, id: item._id, name: item.fullname, type: 'approve' })} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><Check size={18} /></button>
                      )}
                      <button onClick={() => setConfirmAction({ show: true, id: item._id, name: item.fullname, type: 'reject' })} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><XCircle size={18} /></button>
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
              <div
                key={index}
                className="animate-pulse bg-slate-50 rounded-[28px] p-5 border border-slate-100"
              >
                <div className="h-4 w-36 bg-slate-200 rounded-full" />
                <div className="h-3 w-32 bg-slate-100 rounded-full mt-2" />
                <div className="h-8 w-28 bg-slate-200 rounded-full mt-5" />
              </div>
            ))
          ) : currentData.length > 0 ? (
            currentData.map((item) => (
              <div
                key={item._id}
                className="bg-slate-50 rounded-[28px] p-5 border border-slate-100"
              >
                <div className="flex justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-slate-800 text-sm truncate">
                      {item.fullname || "-"}
                    </h4>
                    <p className="text-xs text-slate-400 font-semibold mt-1 truncate">
                      {item.email || "-"}
                    </p>
                  </div>

                  <span className={`h-fit shrink-0 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wide ${item.is_verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                    {item.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {!item.is_verified && (
                    <button
                      onClick={() => setConfirmAction({ show: true, id: item._id, name: item.fullname, type: 'approve' })}
                      className="py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-black uppercase tracking-widest text-emerald-600"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmAction({ show: true, id: item._id, name: item.fullname, type: 'reject' })}
                    className="py-3 rounded-2xl bg-red-50 border border-red-100 text-xs font-black uppercase tracking-widest text-red-500"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-400 font-semibold">
              Data tidak ditemukan
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
