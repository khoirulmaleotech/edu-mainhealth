"use client";
import React, { useState, useEffect } from 'react';
import {
  Search, Loader2, ArrowLeft, Plus, Upload, Edit, Trash2, X, CheckCircle, AlertTriangle
} from 'lucide-react';
import AdminPagination from "@/components/AdminPagination";
import CustomSelect from "@/components/CustomSelect";
import { fetchInstance } from "@/lib/fetchInstance";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";
import * as XLSX from "xlsx";

const roleOptions = [
  { value: "all", label: "Semua Role" },
  { value: "student", label: "Siswa" },
  { value: "teacher", label: "Guru" }
];

export default function ManageUsersPage({ params }) {
  const schoolId = params.schoolId;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [schoolDetail, setSchoolDetail] = useState(null);

  // Pagination & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [pagination, setPagination] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  // Forms
  const [formData, setFormData] = useState({ fullname: "", email: "", password: "", role: "student" });
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkPreview, setBulkPreview] = useState([]);

  const fetchUsers = async ({ page = 1, search = "", role = "all" } = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(itemsPerPage),
        search,
        role,
        school: schoolId
      });
      const json = await fetchInstance(`/api/admin/users?${queryParams.toString()}`);
      setUsers(json.data || []);
      setPagination(json.pagination || null);
    } catch (err) {
      console.error("Gagal load data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolDetail = async () => {
    try {
      const res = await fetchInstance(`/api/admin/verify-school/${schoolId}`);
      if (res.data) setSchoolDetail(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSchoolDetail();
  }, [schoolId]);

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers({ page: 1, search: debouncedSearchTerm, role: roleFilter });
  }, [debouncedSearchTerm, roleFilter]);

  const handlePageChange = (page) => {
    if (page < 1 || page > (pagination?.totalPages || 1) || page === currentPage) return;
    setCurrentPage(page);
    fetchUsers({ page, search: debouncedSearchTerm, role: roleFilter });
  };

  const resetForm = () => {
    setFormData({ fullname: "", email: "", password: "", role: "student" });
    setEditUser(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, school_id: schoolId, action: 'single' })
      });
      const result = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        resetForm();
        fetchUsers({ page: currentPage, search: debouncedSearchTerm, role: roleFilter });
      } else {
        alert(result.message || "Gagal menambah user");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (res.ok) {
        setEditUser(null);
        resetForm();
        fetchUsers({ page: currentPage, search: debouncedSearchTerm, role: roleFilter });
      } else {
        alert(result.message || "Gagal mengedit user");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteUser._id, action: 'delete' })
      });
      if (res.ok) {
        setDeleteUser(null);
        fetchUsers({ page: currentPage, search: debouncedSearchTerm, role: roleFilter });
      } else {
        alert("Gagal menghapus user");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBulkFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        if (data.length < 2) return alert("File Excel kosong atau tidak ada data");
        
        const header = data[0].map(h => String(h).trim().toLowerCase());
        const previewData = [];
        
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;
          
          let obj = {};
          header.forEach((h, idx) => {
            obj[h] = row[idx] !== undefined ? String(row[idx]).trim() : "";
          });
          if (obj.fullname || obj.email) previewData.push(obj);
        }
        
        setBulkPreview(previewData);
      } catch (err) {
        alert("Gagal membaca file Excel. Pastikan format file sesuai.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkSubmit = async () => {
    if (bulkPreview.length === 0) return alert("Tidak ada data valid yang bisa diunggah");
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk', school_id: schoolId, users: bulkPreview })
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        setShowBulkModal(false);
        setBulkFile(null);
        setBulkPreview([]);
        fetchUsers({ page: 1, search: debouncedSearchTerm, role: roleFilter });
      } else {
        alert(result.message || "Gagal bulk register");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 relative text-slate-700">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard/admin/verify-schools" className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-all text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Kelola Pengguna</h1>
          <p className="text-slate-400 text-xs font-bold mt-1">Sekolah: <span className="text-[#00adb5]">{schoolDetail?.name || "Memuat..."}</span></p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex gap-3">
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-[#00adb5] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#00adb5]/20 hover:bg-[#009299] transition-all">
            <Plus size={16} /> Tambah User
          </button>
          <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
            <Upload size={16} /> Bulk Register
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm flex-1">
            <Search size={18} className="text-slate-300" />
            <input
              type="text"
              placeholder="Cari nama/email..."
              className="bg-transparent outline-none text-xs font-bold w-full md:w-60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <CustomSelect
            value={roleFilter}
            onChange={setRoleFilter}
            options={roleOptions}
            placeholder="Pilih Role"
            className="md:w-48"
          />
        </div>
      </div>

      <div className="bg-white rounded-[35px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 border border-slate-200 text-center w-16">No.</th>
                <th className="px-6 py-5 border border-slate-200">Nama Lengkap</th>
                <th className="px-6 py-5 border border-slate-200">Email</th>
                <th className="px-6 py-5 border border-slate-200 text-center">Role</th>
                <th className="px-6 py-5 border border-slate-200 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto mb-2 text-[#00adb5]" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold text-sm">Data tidak ditemukan</td></tr>
              ) : users.map((user, idx) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-6 border border-slate-200 text-center text-xs font-black text-slate-400">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="px-6 py-6 border border-slate-200 font-black text-slate-800 text-sm">{user.fullname}</td>
                  <td className="px-6 py-6 border border-slate-200 text-xs font-bold text-slate-600">{user.email}</td>
                  <td className="px-6 py-6 border border-slate-200 text-center">
                    <span className="px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-600 border-emerald-100">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-6 border border-slate-200 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditUser(user); setFormData({ fullname: user.fullname, email: user.email, password: "", role: user.role }); }} className="p-3 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all"><Edit size={16} /></button>
                      <button onClick={() => setDeleteUser(user)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* MODAL ADD/EDIT */}
      {(showAddModal || editUser) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setEditUser(null); resetForm(); }} />
          <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-black text-slate-800 text-lg">{editUser ? "Edit User" : "Tambah User"}</h2>
              <button onClick={() => { setShowAddModal(false); setEditUser(null); resetForm(); }} className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-all"><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={editUser ? handleEditSubmit : handleAddSubmit} className="p-8 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nama Lengkap *</label>
                <input required type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-semibold border-2 border-transparent focus:border-[#00adb5]/20 outline-none" value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Email *</label>
                <input required type="email" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-semibold border-2 border-transparent focus:border-[#00adb5]/20 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Password {editUser ? "(Kosongkan jika tidak diubah)" : "*"}</label>
                <input required={!editUser} type="password" minLength={8} className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-semibold border-2 border-transparent focus:border-[#00adb5]/20 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Role *</label>
                <select required className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-semibold border-2 border-transparent focus:border-[#00adb5]/20 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="student">Siswa</option>
                  <option value="teacher">Guru</option>
                </select>
              </div>
              <button disabled={actionLoading} type="submit" className="w-full py-4 bg-[#00adb5] text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4">
                {actionLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Simpan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BULK REGISTER */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowBulkModal(false); setBulkFile(null); setBulkPreview([]); }} />
          <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-black text-slate-800 text-lg">Bulk Register via Excel</h2>
              <button onClick={() => { setShowBulkModal(false); setBulkFile(null); setBulkPreview([]); }} className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-all"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-4">
              <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-xs font-semibold leading-relaxed border border-blue-100">
                Gunakan file Excel (.xlsx atau .csv) dengan kolom header berikut pada baris pertama: <br/>
                <code className="font-mono font-bold mt-2 block bg-white px-2 py-1 rounded">fullname | email | password | role</code>
                <p className="mt-2 opacity-80">Catatan: Kolom <strong>role</strong> harus berisi 'student' atau 'teacher'.</p>
              </div>
              
              <div className="relative group border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-all hover:border-[#00adb5]">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload size={32} className="mx-auto text-slate-300 group-hover:text-[#00adb5] mb-2 transition-all" />
                <p className="text-sm font-bold text-slate-600">Klik atau seret file Excel ke sini</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">{bulkFile ? bulkFile.name : "Format didukung: .xlsx, .csv"}</p>
              </div>

              {bulkPreview.length > 0 && (
                <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase text-slate-500">Preview Data ({bulkPreview.length} baris)</p>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white text-slate-400 sticky top-0 shadow-sm">
                        <tr>
                          <th className="px-4 py-2 font-bold">Fullname</th>
                          <th className="px-4 py-2 font-bold">Email</th>
                          <th className="px-4 py-2 font-bold">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {bulkPreview.slice(0, 50).map((row, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-slate-600 font-medium truncate max-w-[120px]">{row.fullname || "-"}</td>
                            <td className="px-4 py-2 text-slate-600 truncate max-w-[150px]">{row.email || "-"}</td>
                            <td className="px-4 py-2 text-slate-500">{row.role || "-"}</td>
                          </tr>
                        ))}
                        {bulkPreview.length > 50 && (
                          <tr><td colSpan="3" className="px-4 py-2 text-center text-slate-400 italic font-medium">...dan {bulkPreview.length - 50} data lainnya</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button disabled={actionLoading || bulkPreview.length === 0} onClick={handleBulkSubmit} className="w-full py-4 bg-[#00adb5] text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#00adb5]/20 hover:bg-[#009299]">
                {actionLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : `Unggah ${bulkPreview.length} Data`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setDeleteUser(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-[35px] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 bg-red-50 text-red-500">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Hapus User?</h3>
            <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
              Yakin menghapus <span className="font-bold text-slate-700">{deleteUser.fullname}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-red-500 text-white shadow-lg shadow-red-500/20"
              >
                {actionLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Ya, Hapus'}
              </button>
              <button onClick={() => setDeleteUser(null)} className="w-full py-4 text-slate-400 font-bold text-xs uppercase">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
