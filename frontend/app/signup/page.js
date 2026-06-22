"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User, Mail, Lock, Building2, ArrowRight,
  ChevronDown, Loader2, PartyPopper, XCircle, Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [isSchoolOpen, setIsSchoolOpen] = useState(false);
  const [modal, setModal] = useState({
    show: false, type: "", title: "", message: "",
  });

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    institution_id: "",
    institution_name: "",
    school_display_name: "",
    student_email: "",
  });

  const roles = [
    { id: "student",      label: "Siswa",     emoji: "🎓" },
    { id: "parent",       label: "Orang Tua", emoji: "🏠" },
    { id: "teacher",      label: "Guru",      emoji: "👨‍🏫" },
    { id: "psychologist", label: "Psikolog",  emoji: "🏥" },
  ];

  // Reset role-specific fields saat role berubah
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      institution_id: "",
      institution_name: "",
      school_display_name: "",
      student_email: "",
    }));
    setIsSchoolOpen(false);
    setSchoolSearch("");
  }, [role]);

  useEffect(() => {
    fetch("/api/signup/school")
      .then((res) => res.json())
      .then((json) => { if (json.success) setSchools(json.data); });
  }, []);

  const filteredSchools = useMemo(
    () => schools.filter((s) => s.name.toLowerCase().includes(schoolSearch.toLowerCase())),
    [schools, schoolSearch]
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectSchool = (id, name) => {
    setFormData({ ...formData, institution_id: id, school_display_name: name });
    setIsSchoolOpen(false);
    setSchoolSearch("");
  };

  const showAlert = (type, title, message) => {
    setModal({ show: true, type, title, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === "parent" && !formData.student_email) {
      return showAlert("error", "Data tidak lengkap", "Email anak wajib diisi.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });
      const data = await res.json();

      if (res.ok) {
        const msg = {
          student:      "Akun Anda sudah aktif. Silakan masuk untuk memulai.",
          parent:       "Pendaftaran berhasil. Permintaan koneksi telah dikirim — anak Anda perlu menyetujuinya melalui dashboard.",
          teacher:      "Akun Anda sudah aktif. Silakan masuk untuk memulai.",
          psychologist: "Akun Anda akan ditinjau oleh tim Admin EduMind dalam 1–2 hari kerja.",
        };
        showAlert("success", "Pendaftaran berhasil", msg[role]);
        setTimeout(() => router.push("/login"), 3500);
      } else {
        showAlert("error", "Gagal mendaftar", data.message || "Terjadi kesalahan.");
      }
    } catch {
      showAlert("error", "Koneksi error", "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans relative selection:bg-[#00adb5] selection:text-white">

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
            <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center ${modal.type === "success" ? "bg-[#00adb5]/10 text-[#00adb5]" : "bg-red-100 text-red-600"}`}>
              {modal.type === "success" ? <PartyPopper size={40} /> : <XCircle size={40} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{modal.title}</h3>
              <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">{modal.message}</p>
            </div>
            <button
              onClick={() => setModal({ ...modal, show: false })}
              className="w-full py-4 bg-[#0b0e14] text-white rounded-2xl font-bold text-xs uppercase hover:bg-[#00adb5] transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden grid lg:grid-cols-2 min-h-[850px]">

        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <div className="hidden lg:flex bg-[#00adb5] flex-col items-center justify-between p-16 relative overflow-hidden text-white">
          <div className="absolute -left-10 -top-10 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#0b0e14]/20 rounded-full blur-[80px] pointer-events-none" />

          {/* Logo besar di tengah */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-10 text-center">
            <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-[#0b0e14]/20 flex flex-col items-center gap-6">
              <Image
                src="/images/telkom-indonesia.png"
                alt="Telkom Indonesia"
                width={160}
                height={80}
                priority
                className="h-16 w-auto"
              />
              <Image
                src="/images/tjsl.png"
                alt="TJSL"
                width={160}
                height={80}
                priority
                className="h-16 w-auto"
              />
            </div>

            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight">EduMind</h2>
              <p className="text-sm opacity-75 font-medium mt-2 leading-relaxed max-w-[260px] mx-auto">
                Ekosistem digital untuk keseimbangan emosional dan pemetaan bakat generasi hebat.
              </p>
            </div>

            {/* Fitur — daftar bersih tanpa card berlapis */}
            <div className="w-full max-w-[280px] space-y-4 text-left">
              {[
                { label: "Lacak suasana hati setiap hari",      sub: "Siswa" },
                { label: "Curhat aman dengan AI Mood Buddy",     sub: "Siswa" },
                { label: "Laporan perkembangan emosi anak",      sub: "Orang Tua" },
                { label: "Sesi konseling dari psikolog terverifikasi", sub: "Psikolog" },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold leading-snug">{f.label}</p>
                    <p className="text-[11px] opacity-55 mt-0.5">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom link */}
          <div className="relative z-10 w-full border-t border-white/20 pt-6 flex items-center justify-between">
            <p className="text-xs opacity-60 font-medium">Sekolah belum terdaftar?</p>
            <Link
              href="/signup/school"
              className="flex items-center gap-2 text-xs font-black uppercase tracking-wide hover:opacity-75 transition-opacity"
            >
              Daftarkan sekolah <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white text-primary overflow-y-auto">

          <div className="mb-8 flex flex-col items-center lg:items-start space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                <Image src="/images/telkom-indonesia.png" alt="Telkom Indonesia" width={60} height={30} className="h-6 sm:h-8 w-auto" />
                <Image src="/images/tjsl.png" alt="TJSL" width={60} height={30} className="h-6 sm:h-8 w-auto" />
              </div>
              <div className="flex flex-col border-l-2 border-slate-200 pl-3">
                <span className="text-xl font-black text-[#00adb5] leading-none tracking-tighter uppercase">EduMind</span>
              </div>
            </Link>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none">Buat Akun</h1>
              <p className="text-sm text-slate-400 font-medium mt-2">Pilih peran Anda untuk melanjutkan.</p>
            </div>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`py-4 rounded-[28px] flex flex-col items-center gap-1.5 transition-all border-2 ${
                  role === r.id
                    ? "border-[#00adb5] bg-[#00adb5]/5 shadow-lg shadow-[#00adb5]/10"
                    : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                }`}
              >
                <span className="text-xl">{r.emoji}</span>
                <span className="text-[11px] font-bold">{r.label}</span>
              </button>
            ))}
          </div>

          {/* Role hint — satu baris, tanpa card */}
          <RoleHint role={role} />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto lg:mx-0 mt-6">

            <InputField
              label="Nama Lengkap" required
              icon={<User size={18} />}
              name="fullname" placeholder="Nama lengkap Anda"
              value={formData.fullname} onChange={handleChange}
            />

            <InputField
              label="Email" required
              icon={<Mail size={18} />}
              name="email" placeholder="nama@email.com"
              value={formData.email} onChange={handleChange} type="email"
            />

            {/* Email anak — khusus orang tua */}
            {role === "parent" && (
              <InputField
                label="Email Anak" required
                icon={<Mail size={18} />}
                name="student_email" placeholder="email.anak@sekolah.com"
                value={formData.student_email} onChange={handleChange} type="email"
                hint="Anak Anda harus sudah terdaftar. Koneksi baru aktif setelah disetujui siswa."
              />
            )}

            {/* Nama lembaga — khusus psikolog */}
            {role === "psychologist" && (
              <InputField
                label="Lembaga / Klinik" required
                icon={<Building2 size={18} />}
                name="institution_name" placeholder="Nama tempat praktik"
                value={formData.institution_name} onChange={handleChange}
                hint="Digunakan untuk proses verifikasi oleh admin."
              />
            )}

            {/* Dropdown sekolah — semua role kecuali psikolog */}
            {role !== "psychologist" && (
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-slate-600 ml-2">
                  Asal Sekolah <span className="text-red-500 ml-1 font-black">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 z-10" size={18} />
                  <button
                    type="button"
                    onClick={() => setIsSchoolOpen(!isSchoolOpen)}
                    className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-transparent text-left rounded-[20px] outline-none text-sm font-semibold transition-all focus:border-[#00adb5]/20 focus:bg-white"
                  >
                    <span className={formData.school_display_name ? "text-slate-800" : "text-slate-400"}>
                      {formData.school_display_name || "Cari sekolah Anda..."}
                    </span>
                    <ChevronDown
                      className={`absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 transition-transform ${isSchoolOpen ? "rotate-180" : ""}`}
                      size={18}
                    />
                  </button>

                  {isSchoolOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 animate-in slide-in-from-top-2">
                      <div className="relative mb-3">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                          autoFocus
                          placeholder="Ketik nama sekolah..."
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-xs font-bold border-none outline-none"
                          value={schoolSearch}
                          onChange={(e) => setSchoolSearch(e.target.value)}
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredSchools.length > 0 ? (
                          filteredSchools.map((s) => (
                            <button
                              key={s._id}
                              type="button"
                              onClick={() => selectSchool(s._id, s.name)}
                              className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#00adb5] hover:text-white transition-all"
                            >
                              {s.name}
                            </button>
                          ))
                        ) : (
                          <p className="text-[10px] text-center p-4 text-slate-400 italic">Sekolah tidak ditemukan</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <InputField
              label="Kata Sandi" required
              icon={<Lock size={18} />}
              name="password" placeholder="Minimal 8 karakter"
              value={formData.password} onChange={handleChange} type="password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[60px] bg-[#0b0e14] text-white rounded-[30px] font-bold text-sm shadow-xl hover:bg-[#00adb5] transition-all flex items-center justify-center gap-3 mt-2 disabled:opacity-70 group"
            >
              {loading
                ? <Loader2 className="animate-spin" />
                : <>
                    <span>Daftar Sebagai {roles.find((r) => r.id === role)?.label}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
              }
            </button>
          </form>

          <p className="text-center text-sm font-medium text-slate-400 mt-8">
            Sudah terdaftar?{" "}
            <Link href="/login" className="text-[#00adb5] font-black hover:underline">Masuk</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── Role hint ────────────────────────────────────────────────────────────────

function RoleHint({ role }) {
  const hints = {
    student:      "Akun langsung aktif setelah pendaftaran.",
    parent:       "Akun aktif setelah daftar. Koneksi ke akun anak memerlukan persetujuan siswa.",
    teacher:      "Akun langsung aktif. Admin sekolah dapat memverifikasi peran Anda.",
    psychologist: "Akun memerlukan verifikasi manual oleh admin EduMind (1–2 hari kerja).",
  };
  return (
    <p className="text-[11px] text-slate-400 font-medium leading-relaxed pl-1 mb-2">
      {hints[role]}
    </p>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────

function InputField({ label, icon, name, placeholder, value, onChange, required, type = "text", hint }) {
  return (
    <div className="space-y-1 text-primary">
      <label className="text-xs font-bold text-slate-600 ml-2">
        {label}
        {required && <span className="text-red-500 ml-1 font-black">*</span>}
      </label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00adb5] transition-colors">
          {icon}
        </div>
        <input
          name={name}
          required={required}
          onChange={onChange}
          value={value}
          type={type}
          placeholder={placeholder}
          className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[20px] outline-none text-sm font-semibold transition-all shadow-inner"
        />
      </div>
      {hint && <p className="text-[10px] text-slate-400 ml-2 mt-1 leading-relaxed">{hint}</p>}
    </div>
  );
}