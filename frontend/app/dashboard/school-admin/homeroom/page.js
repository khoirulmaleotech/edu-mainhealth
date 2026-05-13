"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Users, UserCheck, BookOpen, Plus, Trash2,
  Edit2, ChevronDown, ChevronUp, UserMinus,
  Loader2, CheckSquare, Square, AlertTriangle,
  Search
} from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce"; 

const API = "/api/school-admin/homeroom";

export default function HomeroomPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");

  // Pagination & Search Kelas
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // State untuk Nested Pagination Siswa per Kelas
  const [expandedData, setExpandedData] = useState({
    classId: null,
    students: [],
    page: 1,
    totalPages: 1,
    loading: false
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [newClassName, setNewClassName] = useState("");
  const [newAcYear, setNewAcYear] = useState("");
  const [renaming, setRenaming] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    setPage(1);
    setExpandedData({ classId: null, students: [], page: 1, totalPages: 1, loading: false });
  }, [debouncedSearch]);

  const fetchData = useCallback(async () => {
    if (!data) setLoading(true);
    setIsFetching(true);
    try {
      const url = `${API}?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.message);
    } catch {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [page, limit, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // Fungsi fetch siswa untuk kelas tertentu (ketika di klik)
  const fetchClassStudents = async (classId, studentPage) => {
    setExpandedData(prev => ({ ...prev, classId, loading: true }));
    try {
      const res = await fetch(`${API}?action=get_students&classId=${classId}&studentPage=${studentPage}&studentLimit=6`);
      const json = await res.json();
      if (json.success) {
        setExpandedData({
          classId,
          students: json.students,
          page: json.pagination.page,
          totalPages: json.pagination.totalPages,
          loading: false
        });
      }
    } catch (err) {
      setExpandedData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleExpandClass = (classId) => {
    if (expandedData.classId === classId) {
      setExpandedData({ classId: null, students: [], page: 1, totalPages: 1, loading: false });
      return;
    }
    fetchClassStudents(classId, 1);
  };

  const patchApi = async (body) => {
    setSaving(true);
    try {
      const res = await fetch(API, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      await fetchData(); 
      return true;
    } catch (e) {
      showToast("❌ " + e.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const postApi = async (body) => {
    setSaving(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      await fetchData();
      return true;
    } catch (e) {
      showToast("❌ " + e.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    const ok = await postApi({ name: newClassName, academic_year: newAcYear });
    if (ok) {
      setShowCreateModal(false);
      setNewClassName("");
      setNewAcYear("");
      showToast("✅ Kelas berhasil dibuat");
    }
  };

  const handleAssignTeacher = async (classId, teacherId) => {
    const ok = await patchApi({ action: "assign_teacher", classId, teacherId });
    if (ok) showToast("✅ Wali kelas diperbarui");
  };

  const handleAssignStudents = async () => {
    if (!selectedStudents.length) return;
    const ok = await patchApi({
      action: "assign_students",
      classId: showStudentModal,
      studentIds: selectedStudents,
    });
    if (ok) {
      setShowStudentModal(null);
      setSelectedStudents([]);
      showToast(`✅ ${selectedStudents.length} siswa ditambahkan`);
      // Jika panel sedang terbuka, refresh data siswa
      if (expandedData.classId === showStudentModal) {
        fetchClassStudents(showStudentModal, 1);
      }
    }
  };

  const handleRemoveStudent = async (classId, studentId) => {
    if (!confirm("Keluarkan siswa dari kelas ini?")) return;
    const ok = await patchApi({ action: "remove_student", classId, studentId });
    if (ok) {
      showToast("✅ Siswa dikeluarkan dari kelas");
      fetchClassStudents(classId, expandedData.page); // Refresh siswa di halaman aktif
    }
  };

  const handleRenameClass = async () => {
    if (!renaming?.name?.trim()) return;
    const ok = await patchApi({
      action: "rename_class",
      classId: renaming.classId,
      name: renaming.name,
    });
    if (ok) {
      setRenaming(null);
      showToast("✅ Nama kelas diperbarui");
    }
  };

  const handleDeleteClass = async (classId, studentCount) => {
    const msg =
      studentCount > 0
        ? `Kelas ini memiliki ${studentCount} siswa. Semua siswa akan dilepas dari kelas. Lanjutkan?`
        : "Hapus kelas ini?";
    if (!confirm(msg)) return;
    const ok = await patchApi({ action: "delete_class", classId });
    if (ok) showToast("✅ Kelas dihapus");
  };

  if (loading && !data)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin text-[#00adb5]" size={40} />
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
          Memuat data...
        </p>
      </div>
    );

  if (error && !data)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-rose-500">
        <AlertTriangle size={36} />
        <p className="font-semibold">{error}</p>
      </div>
    );

  const {
    classes = [],
    teachers = [],
    unassignedStudents = [],
    summary = {},
    schoolName = "",
    pagination = { page: 1, totalPages: 1 },
  } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full pb-10">
      {/* Toast Notifier */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-800 text-white text-sm px-5 py-3 rounded-2xl shadow-lg font-medium">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <BookOpen className="text-[#00adb5]" size={30} />
            Manajemen Wali Kelas
          </h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            {schoolName} — Kelola kelas, assign wali kelas, dan tempatkan siswa.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#00adb5] text-white text-sm font-bold hover:bg-[#00adb5]/90 transition-all shadow-lg shadow-[#00adb5]/30 shrink-0"
        >
          <Plus size={16} /> Buat Kelas Baru
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Kelas", value: summary.totalClasses, icon: BookOpen, color: "text-[#00adb5] bg-[#00adb5]/10 border-[#00adb5]/20" },
          { label: "Guru Tersedia", value: summary.totalTeachers, icon: UserCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Siswa di Kelas", value: summary.assignedStudents, icon: Users, color: "text-sky-600 bg-sky-50 border-sky-100" },
          { label: "Siswa Belum Masuk", value: summary.unassignedStudents, icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-100" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-3xl border p-5 ${color}`}>
            <Icon size={20} className="mb-2" />
            <p className="text-2xl font-black">{value ?? 0}</p>
            <p className="text-[10px] sm:text-xs font-bold mt-1 opacity-70 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kelas, nama guru, atau murid..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00adb5]/20 transition-all"
            />
         </div>
         {isFetching && (
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium pr-4">
               <Loader2 size={16} className="animate-spin" /> Memperbarui...
            </div>
         )}
      </div>

      {/* CLASSES LIST */}
      <div className={`transition-opacity duration-300 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
        {classes.length === 0 ? (
          <div className="bg-white rounded-[30px] border border-slate-200 p-16 text-center text-slate-400 mt-4">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">
               {debouncedSearch ? "Pencarian tidak ditemukan." : "Belum ada kelas. Buat kelas pertama Anda."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((cls) => {
              const isExpanded = expandedData.classId === cls._id;
              const isRenaming = renaming?.classId === cls._id;

              return (
                <div key={cls._id} className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm transition-all">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                    <div className="flex-1">
                      {isRenaming ? (
                        <div className="flex items-center gap-2">
                          <input
                            className="border border-[#00adb5]/50 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 ring-[#00adb5]/50 w-44 md:w-64"
                            value={renaming.name}
                            onChange={(e) => setRenaming({ ...renaming, name: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleRenameClass()}
                            autoFocus
                          />
                          <button
                            onClick={handleRenameClass}
                            disabled={saving}
                            className="text-xs font-bold text-white bg-[#00adb5] px-3 py-1.5 rounded-lg hover:bg-[#00adb5]/90"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setRenaming(null)}
                            className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-black text-slate-800">{cls.name}</h3>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">
                            {cls.academic_year || "—"}
                          </span>
                          <span className="text-[10px] font-bold bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full">
                            {cls.student_count} siswa
                          </span>
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-2">
                        <UserCheck size={15} className="text-slate-400 shrink-0" />
                        <select
                          value={cls.homeroom_teacher_id || ""}
                          onChange={(e) => handleAssignTeacher(cls._id, e.target.value || null)}
                          className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none hover:border-[#00adb5]/50 focus:border-[#00adb5] transition font-medium w-full sm:w-auto min-w-[200px]"
                        >
                          <option value="">— Pilih Wali Kelas —</option>
                          {teachers.map((t) => (
                            <option key={t._id} value={t._id}>{t.fullname}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto mt-2 md:mt-0">
                      <button onClick={() => setRenaming({ classId: cls._id, name: cls.name })} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition" title="Rename kelas">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { setShowStudentModal(cls._id); setSelectedStudents([]); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00adb5]/10 text-[#00adb5] hover:bg-[#00adb5]/20 text-xs font-bold transition">
                        <Plus size={14} /> Tambah Siswa
                      </button>
                      <button onClick={() => handleDeleteClass(cls._id, cls.student_count)} className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition" title="Hapus kelas">
                        <Trash2 size={16} />
                      </button>
                      <button onClick={() => handleExpandClass(cls._id)} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* DAFTAR SISWA (NESTED PAGINATION) */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-5 pb-5 pt-4 bg-slate-50/50">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                        Daftar Siswa {expandedData.loading && <Loader2 size={12} className="animate-spin text-[#00adb5]" />}
                      </h4>
                      
                      {!expandedData.loading && expandedData.students.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Belum ada siswa di kelas ini.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {expandedData.students.map((s) => (
                            <div key={s._id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#00adb5]/10 flex items-center justify-center text-xs font-black text-[#00adb5]">
                                  {s.fullname.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">
                                  {s.fullname}
                                </span>
                              </div>
                              <button onClick={() => handleRemoveStudent(cls._id, s._id)} className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition shrink-0" title="Keluarkan siswa">
                                <UserMinus size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pagination Control untuk Siswa (Hanya tampil jika siswa lebih dari batasan/limit) */}
                      {expandedData.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm max-w-sm">
                          <button
                            onClick={() => fetchClassStudents(cls._id, expandedData.page - 1)}
                            disabled={expandedData.page <= 1 || expandedData.loading}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg disabled:opacity-50 transition"
                          >
                            Sebelumnya
                          </button>
                          <span className="text-xs font-bold text-slate-400">
                            Hal <span className="text-slate-700">{expandedData.page}</span> / {expandedData.totalPages}
                          </span>
                          <button
                            onClick={() => fetchClassStudents(cls._id, expandedData.page + 1)}
                            disabled={expandedData.page >= expandedData.totalPages || expandedData.loading}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg disabled:opacity-50 transition"
                          >
                            Selanjutnya
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION CONTROLS UNTUK KELAS */}
        {classes.length > 0 && (
          <div className="flex items-center justify-between mt-6 px-2">
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

      {/* MODAL: Buat Kelas */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[30px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-800 mb-5">Buat Kelas Baru</h3>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Nama Kelas
            </label>
            <input
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#00adb5] focus:ring-4 focus:ring-[#00adb5]/10 mb-4 transition-all"
              placeholder="cth: Kelas X IPA 1"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateClass()}
              autoFocus
            />
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Tahun Ajaran
            </label>
            <input
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#00adb5] focus:ring-4 focus:ring-[#00adb5]/10 mb-6 transition-all"
              placeholder="cth: 2025/2026"
              value={newAcYear}
              onChange={(e) => setNewAcYear(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCreateModal(false); setNewClassName(""); }}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleCreateClass}
                disabled={saving || !newClassName.trim()}
                className="flex-1 py-3 rounded-2xl bg-[#00adb5] text-white text-sm font-bold hover:bg-[#00adb5]/90 transition disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Buat Kelas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Siswa ke Kelas */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[30px] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-800 mb-1">
              Tambah Siswa ke Kelas
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              Siswa yang tampil di sini belum masuk kelas manapun.
            </p>

            {unassignedStudents.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <Users size={36} className="mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="text-sm font-semibold">
                  Semua siswa sudah memiliki kelas.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3 bg-slate-50 p-2 rounded-xl">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
                    {unassignedStudents.length} Tersedia
                  </span>
                  <button
                    onClick={() =>
                      setSelectedStudents(
                        selectedStudents.length === unassignedStudents.length
                          ? []
                          : unassignedStudents.map((s) => s._id)
                      )
                    }
                    className="text-xs font-bold text-[#00adb5] bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition"
                  >
                    {selectedStudents.length === unassignedStudents.length
                      ? "Batal Semua"
                      : "Pilih Semua"}
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {unassignedStudents.map((s) => {
                    const checked = selectedStudents.includes(s._id);
                    return (
                      <button
                        key={s._id}
                        onClick={() =>
                          setSelectedStudents(
                            checked
                              ? selectedStudents.filter((id) => id !== s._id)
                              : [...selectedStudents, s._id]
                          )
                        }
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition ${
                          checked
                            ? "border-[#00adb5]/50 bg-[#00adb5]/10 ring-1 ring-[#00adb5]/20"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {checked ? (
                          <CheckSquare size={18} className="text-[#00adb5] shrink-0" />
                        ) : (
                          <Square size={18} className="text-slate-300 shrink-0" />
                        )}
                        <span className="text-sm font-medium text-slate-700">
                          {s.fullname}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowStudentModal(null); setSelectedStudents([]); }}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              {unassignedStudents.length > 0 && (
                <button
                  onClick={handleAssignStudents}
                  disabled={saving || selectedStudents.length === 0}
                  className="flex-1 py-3 rounded-2xl bg-[#00adb5] text-white text-sm font-bold hover:bg-[#00adb5]/90 transition disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : `Tambahkan (${selectedStudents.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}