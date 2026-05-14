"use client";
import React, { useState, useEffect } from 'react';
import {
  Building2, CheckCircle, XCircle, Search,
  Loader2, Mail, MapPin, Eye, Globe, User, X,
  Check, AlertTriangle
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

export default function VerifySchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // State Filter, Search, & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [pagination, setPagination] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State Modal Konfirmasi
  const [confirmAction, setConfirmAction] = useState({ show: false, id: null, name: '', type: '' });

  const fetchSchools = async ({ page = 1, search = "", status = "all" } = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(itemsPerPage),
        search,
        status,
      });
      const json = await fetchInstance(`/api/admin/verify-school?${queryParams.toString()}`);
      setSchools(json.data || []);
      setPagination(json.pagination || null);
    } catch (err) {
      console.error("Gagal load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchSchools({ page: 1, search: debouncedSearchTerm, status: statusFilter });
  }, [debouncedSearchTerm, statusFilter]);

  const totalPages = pagination?.totalPages || 1;
  const currentData = schools;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    fetchSchools({ page, search: debouncedSearchTerm, status: statusFilter });
  };

  const openSchoolDetail = async (id) => {
    try {
      setSelectedSchool({ _id: id, name: "" });
      setIsDetailLoading(true);

      const json = await fetchInstance(`/api/admin/verify-school/${id}`);

      setSelectedSchool(json.data || null);
    } catch (err) {
      console.error(err);
      setSelectedSchool(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // FUNGSI AKSI (FIXED BUG)
  const executeAction = async () => {
    if (!confirmAction.id || !confirmAction.type) return;

    const { id, type } = confirmAction;
    setActionLoading(id);

    try {
      const res = await fetch(`/api/admin/verify-school`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          action: type // 'approve' atau 'reject'
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setConfirmAction({ show: false, id: null, name: '', type: '' });
        setSelectedSchool(null);
        await fetchSchools({ page: currentPage, search: debouncedSearchTerm, status: statusFilter });
      } else {
        alert(result.message || "Gagal memproses perubahan");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi server.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 relative text-slate-700">

      {/* 1. MODAL KONFIRMASI AKSI */}
      {confirmAction.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setConfirmAction({ show: false })} />
          <div className="relative w-full max-w-sm bg-white rounded-[35px] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 ${confirmAction.type === 'approve' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
              {confirmAction.type === 'approve' ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">
              {confirmAction.type === 'approve' ? 'Setujui Sekolah?' : 'Tolak Pendaftaran?'}
            </h3>
            <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
              Konfirmasi untuk <span className="font-bold text-slate-700">{confirmAction.name}</span>.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={executeAction}
                disabled={actionLoading}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${confirmAction.type === 'approve' ? 'bg-[#00adb5] text-white shadow-lg shadow-[#00adb5]/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}
              >
                {actionLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Ya, Lanjutkan'}
              </button>
              <button onClick={() => setConfirmAction({ show: false })} className="w-full py-4 text-slate-400 font-bold text-xs uppercase">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL DETAIL POPUP */}
      {selectedSchool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedSchool(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00adb5] text-white rounded-2xl flex items-center justify-center font-black">{selectedSchool.name?.charAt(0)}</div>
                <h2 className="font-black text-slate-800 text-lg">{selectedSchool.name}</h2>
              </div>
              <button onClick={() => setSelectedSchool(null)} className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-all"><X size={20} className="text-slate-400" /></button>
            </div>
            {isDetailLoading ? (
              <div className="p-16 flex justify-center">
                <Loader2 className="animate-spin text-[#00adb5]" size={32} />
              </div>
            ) : (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailBox icon={<User />} label="Admin" value={selectedSchool.admin_name || "Petugas"} />
                <DetailBox icon={<Mail />} label="Email" value={selectedSchool.admin_email} />
                <DetailBox icon={<Globe />} label="Website" value={selectedSchool.website || "-"} />
                <div className="md:col-span-2"><DetailBox icon={<MapPin />} label="Alamat" value={selectedSchool.address} /></div>
              </div>
            )}
            <div className="p-8 bg-slate-50/50 flex flex-col md:flex-row gap-3">
              {!selectedSchool.is_verified && (
                <button
                  onClick={() => setConfirmAction({ show: true, id: selectedSchool._id, name: selectedSchool.name, type: 'approve' })}
                  className="flex-1 py-4 bg-[#00adb5] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest"
                >
                  Approve Sekarang
                </button>
              )}
              <button
                onClick={() => setConfirmAction({ show: true, id: selectedSchool._id, name: selectedSchool.name, type: 'reject' })}
                className="px-8 py-4 bg-white text-red-500 border border-red-100 rounded-2xl font-black text-[11px] uppercase"
              >
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Verifikasi Sekolah</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Total {pagination?.totalData || 0} Sekolah Terdaftar</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm flex-1">
            <Search size={18} className="text-slate-300" />
            <input
              type="text"
              placeholder="Cari sekolah/email..."
              className="bg-transparent outline-none text-xs font-bold w-full md:w-60"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <CustomSelect
            value={statusFilter}
            onChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}
            options={statusOptions}
            placeholder="Pilih Status"
            className="md:w-56"
          />
        </div>
      </div>

      {/* 4. MASTER TABLE */}
      <div className="bg-white rounded-[35px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 border border-slate-200 text-center w-16">No.</th>
                <th className="px-6 py-5 border border-slate-200">Identitas Sekolah</th>
                <th className="px-6 py-5 border border-slate-200">Login Admin</th>
                <th className="px-6 py-5 border border-slate-200 text-center">Status</th>
                <th className="px-6 py-5 border border-slate-200 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto mb-2 text-[#00adb5]" /><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Database...</p></td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold italic text-sm">Data tidak ditemukan</td></tr>
              ) : currentData.map((school, index) => (
                <tr key={school._id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-6 py-6 border border-slate-200 text-center text-xs font-black text-slate-400 group-hover:text-[#00adb5]">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-6 border border-slate-200">
                    <p className="font-black text-slate-800 text-sm">{school.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{school.address_preview || "-"}...</p>
                  </td>
                  <td className="px-6 py-6 border border-slate-200 text-xs font-bold text-slate-600">{school.admin_email}</td>
                  <td className="px-6 py-6 border border-slate-200 text-center">
                    <span className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-tighter flex items-center justify-center gap-1.5 mx-auto w-fit ${school.is_verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                      {school.is_verified ? <Check size={12} /> : <XCircle size={12} />} {school.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-6 border border-slate-200 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openSchoolDetail(school._id)} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-[#00adb5] hover:text-white transition-all"><Eye size={18} /></button>
                      {!school.is_verified && (
                        <button onClick={() => setConfirmAction({ show: true, id: school._id, name: school.name, type: 'approve' })} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><Check size={18} /></button>
                      )}
                      <button onClick={() => setConfirmAction({ show: true, id: school._id, name: school.name, type: 'reject' })} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><XCircle size={18} /></button>
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
                <div className="h-4 w-40 bg-slate-200 rounded-full" />
                <div className="h-3 w-32 bg-slate-100 rounded-full mt-2" />
                <div className="h-8 w-28 bg-slate-200 rounded-full mt-5" />
              </div>
            ))
          ) : currentData.length > 0 ? (
            currentData.map((school) => (
              <div
                key={school._id}
                className="bg-slate-50 rounded-[28px] p-5 border border-slate-100"
              >
                <div className="flex justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-slate-800 text-sm truncate">
                      {school.name || "-"}
                    </h4>
                    <p className="text-xs text-slate-400 font-semibold mt-1 truncate">
                      {school.admin_email || "-"}
                    </p>
                  </div>

                  <span className={`h-fit shrink-0 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wide ${school.is_verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                    {school.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <p className="mt-5 text-xs font-semibold text-slate-400">
                  {school.address_preview || "-"}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openSchoolDetail(school._id)}
                    className="col-span-1 py-3 rounded-2xl bg-white border border-slate-100 text-xs font-black uppercase tracking-widest text-[#00adb5]"
                  >
                    Detail
                  </button>
                  {!school.is_verified && (
                    <button
                      onClick={() => setConfirmAction({ show: true, id: school._id, name: school.name, type: 'approve' })}
                      className="py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-black uppercase tracking-widest text-emerald-600"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmAction({ show: true, id: school._id, name: school.name, type: 'reject' })}
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

function DetailBox({ icon, label, value }) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#00adb5]">{React.cloneElement(icon, { size: 14 })}</span>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xs font-bold text-slate-700">{value}</p>
    </div>
  );
}
