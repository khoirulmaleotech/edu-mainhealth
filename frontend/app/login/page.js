"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react"; // Import NextAuth Signin

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State Input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const roles = [
    { id: 'student', label: 'Siswa', emoji: '🎓' },
    { id: 'parent', label: 'Ortu', emoji: '🏠' },
    { id: 'teacher', label: 'Guru', emoji: '👨‍🏫' },
    { id: 'school', label: 'Sekolah', emoji: '🏫' },
    { id: 'psychologist', label: 'Psikolog', emoji: '🏥' },
    { id: 'superadmin', label: 'Admin', emoji: '🔑' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        /** * SOLUSI OTOMATIS:
         * Kita ambil data session terbaru setelah login sukses.
         * Ini akan memastikan role dibaca dari database, bukan dari pilihan tombol.
         */
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        const userRole = session?.user?.role;

        // Redirect otomatis berdasarkan data real di database
        if (userRole === 'superadmin') {
          window.location.href = "/dashboard/admin";
        } else if (userRole === 'psychologist') {
          window.location.href = "/dashboard/psychologist/patients";
        } else if (userRole === 'teacher') {
          window.location.href = "/dashboard/teacher";
        } else if (userRole === 'school_admin') {
          window.location.href = "/dashboard/school-admin";
        } else if (userRole === 'parent') {
          window.location.href = "/dashboard/parent";
        } else {
          window.location.href = "/dashboard/student"; // Default
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi. Mohon coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans selection:bg-[#00adb5] selection:text-white">
      <div className="max-w-6xl w-full bg-white rounded-[40px] md:rounded-[50px] shadow-2xl shadow-slate-200 overflow-hidden grid lg:grid-cols-2 min-h-[600px] lg:min-h-[800px]">

        {/* LEFT SIDE: Login Form */}
        <div className="p-8 md:p-12 lg:p-20 space-y-8 md:space-y-10 flex flex-col justify-center">

          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 md:gap-4 group self-center lg:self-start">
            <Image
              src="/images/logo-edumind-transparan.png"
              alt="EduMind"
              width={60}
              height={60}
              className="md:w-[70px] md:h-[70px] group-hover:scale-105 transition-transform duration-500"
            />
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black text-[#00adb5] leading-none tracking-tighter uppercase text-primary">EduMind</span>
              <span className="text-[10px] md:text-xs font-bold text-slate-400">by Educourse</span>
            </div>
          </Link>

          <div className="space-y-2 md:space-y-3 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">Selamat Datang</h1>
            <p className="text-slate-400 font-medium italic text-sm md:text-lg">Silakan pilih peran Anda untuk masuk ke sistem.</p>
          </div>

          {/* Alert Error Jika Login Gagal */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <XCircle className="text-red-500" size={20} />
              <p className="text-xs font-bold text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 md:space-y-6 w-full max-w-md mx-auto lg:mx-0">
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold text-slate-600 ml-2">Email Institusi</label>
              <div className="relative group">
                <Mail className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00adb5] transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full pl-12 md:pl-14 pr-5 py-4 md:py-5 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[20px] md:rounded-[25px] outline-none text-sm font-semibold transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-xs md:text-sm font-bold text-slate-600">Kata Sandi</label>
                {/* UPDATE: Mengarahkan rute anchor secara presisi ke /forgot-password */}
                <Link href="/forgot-password" className="text-[10px] md:text-xs font-bold text-[#00adb5] hover:text-[#fbcd2b] transition-colors">Lupa Password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00adb5] transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-12 md:pl-14 pr-12 md:pr-14 py-4 md:py-5 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[20px] md:rounded-[25px] outline-none text-sm font-semibold transition-all shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#00adb5] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[56px] md:h-[65px] bg-[#0b0e14] text-white rounded-[25px] md:rounded-[30px] font-bold text-sm md:text-base shadow-2xl hover:bg-[#00adb5] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Masuk Sekarang"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="text-center text-xs md:text-sm font-medium text-slate-400">
            Belum punya akun? <Link href="/signup" className="text-[#00adb5] font-bold hover:text-[#fbcd2b] transition-colors underline-offset-4 hover:underline">Daftar Akun Baru</Link>
          </p>
        </div>

        {/* RIGHT SIDE: Branding */}
        <div className="hidden lg:flex bg-[#0b0e14] items-center justify-center relative overflow-hidden p-20 text-center">
          <div className="absolute inset-0 bg-[#00adb5]/10 animate-pulse"></div>

          <div className="relative z-10 text-white space-y-10">
            <div className="bg-white/5 backdrop-blur-2xl p-12 rounded-[60px] border border-white/10 shadow-2xl">
              <Image
                src="/images/logo-edumind-transparan.png"
                alt="Large Mascot"
                width={280}
                height={280}
                className="mx-auto drop-shadow-[0_20px_50px_rgba(0,173,181,0.3)]"
              />
              <div className="mt-10 space-y-4">
                <h2 className="text-4xl font-black leading-tight">
                  Kesehatan Mentalmu <br />
                  <span className="text-[#fbcd2b] italic">Prioritas Kami.</span>
                </h2>
                <p className="text-slate-400 font-medium text-lg leading-relaxed italic">Platform terintegrasi Yayasan Maleo untuk generasi hebat.</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#00adb5] opacity-20 rounded-full blur-[100px]"></div>
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#fbcd2b] opacity-10 rounded-full blur-[100px]"></div>
        </div>
      </div>
    </div>
  );
}