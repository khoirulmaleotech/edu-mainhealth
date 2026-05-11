"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Users, UserCheck, BookOpen, Plus, Trash2,
  Edit2, ChevronDown, ChevronUp, UserMinus,
  Loader2, CheckSquare, Square, AlertTriangle,
} from "lucide-react";

const API = "/api/school-admin/homeroom";

export default function HomeroomPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const [expandedClass, setExpandedClass]       = useState(null);
  const [showCreateModal, setShowCreateModal]   = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [newClassName, setNewClassName]         = useState("");
  const [newAcYear, setNewAcYear]               = useState("");
  const [renaming, setRenaming]                 = useState(null);
  const [saving, setSaving]                     = useState(false);
  const [toast, setToast]                       = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(API);
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.message);
    } catch {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const patchApi = async (body) => {
    setSaving(true);
    try {
      const res  = await fetch(API, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
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
      const res  = await fetch(API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
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
    if (ok) showToast("✅ Wali kelas berhasil diperbarui");
  };

  const handleAssignStudents = async () => {
    if (!selectedStudents.length) return;
    const ok = await patchApi({
      action:     "assign_students",
      classId:    showStudentModal,
      studentIds: selectedStudents,
    });
    if (ok) {
      setShowStudentModal(null);
      setSelectedStudents([]);
      showToast(`✅ ${selectedStudents.length} siswa berhasil ditambahkan`);
    }
  };

  const handleRemoveStudent = async (classId, studentId) => {
    if (!confirm("Keluarkan siswa dari kelas ini?")) return;
    const ok = await patchApi({ action: "remove_student", classId, studentId });
    if (ok) showToast("✅ Siswa dikeluarkan dari kelas");
  };

  const handleRenameClass = async () => {
    if (!renaming?.name?.trim()) return;
    const ok = await patchApi({
      action:  "rename_class",
      classId: renaming.classId,
      name:    renaming.name,
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

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin text-[#00adb5]" size={40} />
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
          Memuat data...
        </p>
      </div>
    );

  if (error)
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
    studentsByClass = {},
    summary = {},
    schoolName = "",
  } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full">

      {/* Toast */}
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
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#00adb5] text-white text-sm font-bold hover:bg-[#00adb5]/90 transition-all shadow-lg shadow-[#00adb5]/30 shrink-0"
        >
          <Plus size={16} /> Buat Kelas Baru
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Kelas",          value: summary.totalClasses,       icon: BookOpen,      color: "text-[#00adb5] bg-[#00adb5]/10 border-[#00adb5]/20" },
          { label: "Guru Tersedia",         value: summary.totalTeachers,      icon: UserCheck,     color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Siswa Sudah di Kelas",  value: summary.assignedStudents,   icon: Users,         color: "text-sky-600 bg-sky-50 border-sky-100" },
          { label: "Siswa Belum di Kelas",  value: summary.unassignedStudents, icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-100" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-3xl border p-5 ${color}`}>
            <Icon size={20} className="mb-2" />
            <p className="text-2xl font-black">{value ?? 0}</p>
            <p className="text-xs font-bold mt-1 opacity-70 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* CLASSES LIST */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-[30px] border border-slate-200 p-16 text-center text-slate-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Belum ada kelas. Buat kelas pertama Anda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => {
            const isExpanded    = expandedClass === cls._id;
            const classStudents = studentsByClass[cls._id] || [];
            const isRenaming    = renaming?.classId === cls._id;

            return (
              <div
                key={cls._id}
                className="bg-white rounded-[24px] border border-slate-200 overflow-hidden transition-all"
              >
                {/* Class Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                  <div className="flex-1">
                    {isRenaming ? (
                      <div className="flex items-center gap-2">
                        <input
                          className="border border-[#00adb5]/50 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 ring-[#00adb5]/50 w-44"
                          value={renaming.name}
                          onChange={(e) => setRenaming({ ...renaming, name: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleRenameClass()}
                          autoFocus
                        />
                        <button
                          onClick={handleRenameClass}
                          disabled={saving}
                          className="text-xs font-bold text-[#00adb5] hover:text-[#00adb5]/80"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setRenaming(null)}
                          className="text-xs text-slate-400 hover:text-slate-600"
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

                    {/* Teacher Selector */}
                    <div className="mt-2 flex items-center gap-2">
                      <UserCheck size={14} className="text-slate-400 shrink-0" />
                      <select
                        value={cls.homeroom_teacher_id || ""}
                        onChange={(e) =>
                          handleAssignTeacher(cls._id, e.target.value || null)
                        }
                        className="text-sm text-slate-700 bg-transparent border border-slate-200 rounded-xl px-3 py-1.5 outline-none hover:border-[#00adb5]/50 focus:border-[#00adb5] transition font-medium"
                      >
                        <option value="">— Pilih Wali Kelas —</option>
                        {teachers.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.fullname}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setRenaming({ classId: cls._id, name: cls.name })}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition"
                      title="Rename kelas"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setShowStudentModal(cls._id);
                        setSelectedStudents([]);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00adb5]/10 text-[#00adb5] hover:bg-[#00adb5]/20 text-xs font-bold transition"
                    >
                      <Plus size={14} /> Tambah Siswa
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls._id, cls.student_count)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition"
                      title="Hapus kelas"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => setExpandedClass(isExpanded ? null : cls._id)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Expanded: Student List */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                      Daftar Siswa ({classStudents.length})
                    </h4>
                    {classStudents.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">
                        Belum ada siswa di kelas ini.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {classStudents.map((s) => (
                          <div
                            key={s._id}
                            className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#00adb5]/20 flex items-center justify-center text-xs font-black text-[#00adb5]">
                                {s.fullname.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-slate-700">
                                {s.fullname}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveStudent(cls._id, s._id)}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition"
                              title="Keluarkan siswa"
                            >
                              <UserMinus size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Buat Kelas */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[30px] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 mb-5">Buat Kelas Baru</h3>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Nama Kelas
            </label>
            <input
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#00adb5] mb-4"
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
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#00adb5] mb-6"
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[30px] p-8 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 mb-1">
              Tambah Siswa ke Kelas
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              Siswa yang tampil di sini belum masuk kelas manapun.
            </p>

            {unassignedStudents.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Users size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">
                  Semua siswa sudah memiliki kelas.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {unassignedStudents.length} siswa belum di kelas
                  </span>
                  <button
                    onClick={() =>
                      setSelectedStudents(
                        selectedStudents.length === unassignedStudents.length
                          ? []
                          : unassignedStudents.map((s) => s._id)
                      )
                    }
                    className="text-xs font-bold text-[#00adb5] hover:text-[#00adb5]/80"
                  >
                    {selectedStudents.length === unassignedStudents.length
                      ? "Batal Semua"
                      : "Pilih Semua"}
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
                            ? "border-[#00adb5]/50 bg-[#00adb5]/10"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {checked ? (
                          <CheckSquare size={16} className="text-[#00adb5] shrink-0" />
                        ) : (
                          <Square size={16} className="text-slate-300 shrink-0" />
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