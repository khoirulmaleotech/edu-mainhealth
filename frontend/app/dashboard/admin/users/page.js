"use client";
import React, { useState, useEffect } from 'react';
import {
  Users, Search, Loader2, Mail, Trash2, X,
  Eye, Calendar,
  Building2, GraduationCap, School, HeartPulse, Home, ShieldCheck
} from 'lucide-react';
import AdminPagination from "@/components/AdminPagination";
import CustomSelect from "@/components/CustomSelect";
import { fetchInstance } from "@/lib/fetchInstance";
import { useDebounce } from "@/hooks/useDebounce";

const roleOptions = [
  { value: "all", label: "Semua Role" },
  { value: "student", label: "Siswa" },
  { value: "teacher", label: "Guru" },
  { value: "psychologist", label: "Psikolog" },
  { value: "parent", label: "Orang Tua" },
];

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const pageSize = 10;

  const fetchData = async ({ page = 1, search = "", role = "all", school = "all" } = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        role,
        school,
      });
      const json = await fetchInstance(`/api/admin/users?${queryParams.toString()}`);
      setUsers(json.data || []);
      setPagination(json.pagination || null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openUserDetail = async (id) => {
    try {
      setSelectedUser({ _id: id, fullname: "" });
      setIsDetailLoading(true);

      const json = await fetchInstance(`/api/admin/users/${id}`);

      setSelectedUser(json.data || null);
    } catch (err) {
      console.error(err);
      setSelectedUser(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchData({ page: 1, search: debouncedSearchTerm, role: roleFilter, school: schoolFilter });
  }, [debouncedSearchTerm, roleFilter, schoolFilter]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetchInstance("/api/admin/schools");
        if (res.success) {
          setSchools(res.data);
        }
      } catch (err) {}
    };
    fetchSchools();
  }, []);

  const showAlert = (title, message) => {
    setModalConfig({ type: 'alert', title, message, inputValue: '', onConfirm: () => setModalConfig(null) });
  };

  const showAlertWithAction = (title, message, action) => {
    setModalConfig({ type: 'alert', title, message, inputValue: '', onConfirm: () => {
      setModalConfig(null);
      if (action) action();
    }});
  };

  const showConfirm = (title, message, onConfirm) => {
    setModalConfig({ type: 'confirm', title, message, inputValue: '', onConfirm: () => {
      setModalConfig(null);
      onConfirm();
    }});
  };

  const showPrompt = (title, message, defaultValue, onConfirm) => {
    setModalConfig({ type: 'prompt', title, message, inputValue: defaultValue, onConfirm: (val) => {
      setModalConfig(null);
      onConfirm(val);
    }});
  };

  const handleUpdateSchool = async (userId, schoolId) => {
    if (!schoolId) return showAlert("Peringatan", "Pilih sekolah terlebih dahulu");
    
    showConfirm("Konfirmasi Perubahan", "Apakah Anda yakin ingin mengubah instansi/sekolah pengguna ini?", async () => {
      setIsUpdating(true);
      try {
        const res = await fetchInstance(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_school", school_id: schoolId })
        });
        if (res.success) {
          showAlertWithAction("Berhasil", "Sekolah berhasil diperbarui", () => {
            setSelectedUser(null);
            fetchData({ page: currentPage, search: debouncedSearchTerm, role: roleFilter, school: schoolFilter });
          });
        } else {
          showAlert("Gagal", res.message || "Gagal memperbarui sekolah");
        }
      } catch (err) {
        showAlert("Error", "Terjadi kesalahan sistem");
      } finally {
        setIsUpdating(false);
      }
    });
  };

  const handleResetPassword = async (userId) => {
    showPrompt("Reset Password", "Masukkan password baru untuk pengguna ini:", "123456", async (newPassword) => {
      if (!newPassword) return;
      
      setIsUpdating(true);
      try {
        const res = await fetchInstance(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset_password", password: newPassword })
        });
        if (res.success) {
          showAlertWithAction("Berhasil", "Password berhasil di-reset", () => {
            setSelectedUser(null);
            fetchData({ page: currentPage, search: debouncedSearchTerm, role: roleFilter, school: schoolFilter });
          });
        } else {
          showAlert("Gagal", res.message || "Gagal reset password");
        }
      } catch (err) {
        showAlert("Error", "Terjadi kesalahan sistem");
      } finally {
        setIsUpdating(false);
      }
    });
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > (pagination?.totalPages || 1) || page === currentPage) return;
    setCurrentPage(page);
    fetchData({ page, search: debouncedSearchTerm, role: roleFilter, school: schoolFilter });
  };

  const getRoleBadge = (role) => {
    const styles = {
      student: { bg: 'bg-blue-50', text: 'text-blue-600', icon: <GraduationCap size={12} />, label: 'Siswa' },
      teacher: { bg: 'bg-amber-50', text: 'text-amber-600', icon: <School size={12} />, label: 'Guru' },
      psychologist: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <HeartPulse size={12} />, label: 'Psikolog' },
      parent: { bg: 'bg-purple-50', text: 'text-purple-600', icon: <Home size={12} />, label: 'Orang Tua' },
    };
    const style = styles[role] || { bg: 'bg-slate-50', text: 'text-slate-600', icon: <Users size={12} />, label: role };
    return (
      <span className={`px-3 py-1 rounded-full border flex items-center gap-1.5 w-fit text-[9px] font-black uppercase tracking-tighter ${style.bg} ${style.text} border-current/10`}>
        {style.icon} {style.label}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-8 text-slate-700">

      {/* GLOBAL CUSTOM MODAL */}
      {modalConfig && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 p-6">
            <h3 className="font-black text-slate-800 text-lg mb-2">{modalConfig.title}</h3>
            <p className="text-sm font-bold text-slate-500 mb-6">{modalConfig.message}</p>
            
            {modalConfig.type === 'prompt' && (
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-3 outline-none mb-6 focus:border-[#00adb5] transition-colors"
                value={modalConfig.inputValue}
                onChange={(e) => setModalConfig({ ...modalConfig, inputValue: e.target.value })}
                placeholder="Masukkan nilai..."
              />
            )}

            <div className="flex gap-3 justify-end">
              {modalConfig.type !== 'alert' && (
                <button 
                  onClick={() => setModalConfig(null)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-black text-xs hover:bg-slate-200 transition-all uppercase tracking-widest"
                >
                  Batal
                </button>
              )}
              <button 
                onClick={() => modalConfig.onConfirm(modalConfig.inputValue)}
                className="px-5 py-2.5 bg-[#00adb5] text-white rounded-xl font-black text-xs hover:bg-[#009299] transition-all uppercase tracking-widest shadow-lg shadow-[#00adb5]/20"
              >
                {modalConfig.type === 'alert' ? 'Tutup' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL USER */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#00adb5] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#00adb5]/20">
                  {selectedUser.fullname?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight">{selectedUser.fullname}</h3>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-all text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {isDetailLoading ? (
                <div className="py-16 flex justify-center">
                  <Loader2 className="animate-spin text-[#00adb5]" size={32} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Email Utama" value={selectedUser.email} icon={<Mail size={14} />} />
                  <DetailItem label="Status Akun" value={selectedUser.is_verified ? "Terverifikasi" : "Pending"} icon={<ShieldCheck size={14} />} />
                  <DetailItem label="Bergabung Pada" value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"} icon={<Calendar size={14} />} />
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2 text-[#00adb5]">
                      <Building2 size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Instansi / Sekolah</span>
                    </div>
                    {['student', 'teacher', 'school_admin'].includes(selectedUser.role) ? (
                      <div className="flex flex-col gap-2">
                        <select 
                          className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none"
                          value={selectedUser.updateSchoolId !== undefined ? selectedUser.updateSchoolId : (selectedUser.institution_id || selectedUser.school_id || "")}
                          onChange={(e) => setSelectedUser({...selectedUser, updateSchoolId: e.target.value})}
                          disabled={isUpdating}
                        >
                          <option value="">Pilih Sekolah</option>
                          {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <button 
                          onClick={() => handleUpdateSchool(selectedUser._id, selectedUser.updateSchoolId || selectedUser.institution_id || selectedUser.school_id)}
                          className="px-3 py-2 bg-[#00adb5] text-white rounded-xl font-bold text-xs hover:bg-[#009299] transition-all disabled:opacity-50"
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Menyimpan..." : "Simpan Sekolah"}
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-slate-700 break-words">{selectedUser.institution_name || selectedUser.school_name || '-'}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50/50 flex gap-3 flex-wrap">
              <button 
                onClick={() => handleResetPassword(selectedUser._id)}
                disabled={isUpdating}
                className="px-6 py-4 bg-white text-orange-500 border border-orange-100 rounded-2xl font-black text-[11px] uppercase hover:bg-orange-50 transition-all disabled:opacity-50"
              >
                Reset Password
              </button>
              <button className="px-6 py-4 bg-white text-red-500 border border-red-100 rounded-2xl font-black text-[11px] uppercase hover:bg-red-50 transition-all disabled:opacity-50">
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Database Pengguna</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase mt-1 tracking-widest">EduMind Master User Control • {pagination ? pagination.totalData : 0} Pengguna</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
            <Search size={18} className="text-slate-300" />
            <input
              type="text"
              placeholder="Cari user..."
              className="bg-transparent outline-none text-xs font-bold w-full md:w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <CustomSelect
            value={roleFilter}
            onChange={setRoleFilter}
            options={roleOptions}
            placeholder="Pilih Role"
            className="md:w-40"
          />
          <CustomSelect
            value={schoolFilter}
            onChange={setSchoolFilter}
            options={[
              { value: "all", label: "Semua Sekolah" },
              ...schools.map(s => ({ value: s._id, label: s.name }))
            ]}
            placeholder="Pilih Sekolah"
            className="md:w-48"
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
                <th className="px-6 py-5 border border-slate-200 text-center">Role</th>
                <th className="px-6 py-5 border border-slate-200">Sekolah</th>
                <th className="px-6 py-5 border border-slate-200">Email</th>
                <th className="px-6 py-5 border border-slate-200 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#00adb5]" size={40} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold italic text-sm">Data tidak ditemukan</td></tr>
              ) : users.map((user, index) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-6 border border-slate-200 text-center text-xs font-black text-slate-300">{((pagination?.currentPage || currentPage) - 1) * pageSize + index + 1}</td>
                  <td className="px-6 py-6 border border-slate-200 font-black text-slate-800 text-sm">{user.fullname}</td>
                  <td className="px-6 py-6 border border-slate-200">
                    <div className="flex justify-center">{getRoleBadge(user.role)}</div>
                  </td>
                  <td className="px-6 py-6 border border-slate-200 text-xs font-bold text-slate-600">{user.school_name || "-"}</td>
                  <td className="px-6 py-6 border border-slate-200 text-xs font-bold text-slate-500">{user.email}</td>
                  <td className="px-6 py-6 border border-slate-200 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openUserDetail(user._id)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#00adb5] hover:text-white transition-all shadow-sm"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <Trash2 size={18} />
                      </button>
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
                <div className="h-3 w-28 bg-slate-100 rounded-full mt-2" />
                <div className="h-8 w-24 bg-slate-200 rounded-full mt-5" />
              </div>
            ))
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                className="bg-slate-50 rounded-[28px] p-5 border border-slate-100"
              >
                <div className="flex justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-slate-800 text-sm truncate">
                      {user.fullname || "-"}
                    </h4>
                    <p className="text-xs text-slate-500 font-bold mt-1 truncate">
                      {user.school_name || "-"}
                    </p>
                    <p className="text-xs text-slate-400 font-semibold mt-1 truncate">
                      {user.email || "-"}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {getRoleBadge(user.role)}
                  </div>
                </div>

                <button
                  onClick={() => openUserDetail(user._id)}
                  className="mt-5 w-full py-3 rounded-2xl bg-white border border-slate-100 text-xs font-black uppercase tracking-widest text-[#00adb5]"
                >
                  Lihat Detail
                </button>
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

function DetailItem({ label, value, icon }) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-2 mb-1 text-[#00adb5]">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <p className="text-xs font-bold text-slate-700 break-words">{value}</p>
    </div>
  );
}
