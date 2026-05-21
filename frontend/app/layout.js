"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Urbanist } from 'next/font/google';
import { NextAuthProvider } from "./providers";
import { 
  X, 
  Menu, 
  LogIn, 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';
import "./globals.css";

const urbanist = Urbanist({ 
  subsets: ['latin'],
  variable: '--font-urbanist',
});

export default function RootLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State Kontrol Popup Modal Auth Terpusat
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' atau 'signup'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setMobileMenuOpen(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Jalankan integrasi API Sign-In / Sign-Up NextAuth di sini jika diperlukan
      await new Promise(resolve => setTimeout(resolve, 1200));
      window.location.href = '/dashboard/student/talent';
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <html lang="id" className={`${urbanist.variable} scroll-smooth`}>
      <head>
        <title>EduMind | AI-Powered Student Wellbeing Ecosystem</title>
        <meta name="description" content="Platform kesehatan mental siswa terintegrasi dengan AI Mood Buddy, Portal Orang Tua, dan Konsol Psikolog Profesional." />
      </head>
      <body className="antialiased font-sans bg-white text-slate-900 selection:bg-primary selection:text-white">
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=3398693380287170&ev=PageView&noscript=1" />
        </noscript>
        
        <NextAuthProvider>
          {/* ── NAVBAR GLOBAL TERPUSAT ── */}
          <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 md:py-5 flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/images/logo-edumind-transparan.png" alt="Logo" width={50} height={50} className="h-11 w-11 md:h-[50px] md:w-[50px]" />
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-black text-primary leading-none tracking-tighter uppercase">EduMind</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase">By educourse</span>
                </div>
              </Link>
              
              <div className="hidden lg:flex space-x-10 text-sm font-black uppercase tracking-widest text-slate-500">
                <Link href="#ecosystem" className="hover:text-primary transition">Ekosistem</Link>
                <Link href="#features" className="hover:text-primary transition">Fitur Utama</Link>
                <Link href="#security" className="hover:text-primary transition">Keamanan</Link>
                <Link href="/carrier" className="hover:text-primary transition">Karier</Link>
              </div>
              
              <div className="hidden sm:flex items-center gap-4">
                <button 
                  onClick={() => handleOpenAuth('login')}
                  className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition"
                >
                  Masuk
                </button>
                <button 
                  onClick={() => handleOpenAuth('signup')} 
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-200"
                >
                  Daftar Akun
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="lg:hidden p-3 rounded-2xl bg-slate-50 text-slate-700 border border-slate-100"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* DRAWER MENU RESPONSIVE MOBILE */}
            {mobileMenuOpen && (
              <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl px-5 py-4 shadow-xl shadow-slate-200/60">
                <div className="grid gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                  <Link onClick={() => setMobileMenuOpen(false)} href="#ecosystem" className="rounded-2xl px-4 py-3 hover:bg-primary/10 hover:text-primary transition">Ekosistem</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} href="#features" className="rounded-2xl px-4 py-3 hover:bg-primary/10 hover:text-primary transition">Fitur Utama</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} href="#security" className="rounded-2xl px-4 py-3 hover:bg-primary/10 hover:text-primary transition">Keamanan</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} href="/carrier" className="rounded-2xl px-4 py-3 bg-primary/10 text-primary transition">Karier</Link>
                  <button onClick={() => handleOpenAuth('login')} className="text-left rounded-2xl px-4 py-3 hover:bg-primary/10 hover:text-primary transition">Masuk</button>
                </div>
              </div>
            )}
          </nav>

          {/* SUNTIKAN KONTEN HALAMAN ANAK */}
          <main className="relative z-10">
            {React.cloneElement(children, { onTriggerAuth: () => handleOpenAuth('signup') })}
          </main>

          {/* ── POPUP MODAL AUTH SISWA CENTER ── */}
          {isAuthOpen && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden relative p-8 md:p-10 text-left animate-in zoom-in-95 duration-300">
                
                <button 
                  onClick={() => setIsAuthOpen(false)}
                  className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="space-y-2 mb-6">
                  <div className="inline-flex p-2.5 bg-primary/10 text-primary rounded-xl">
                    {authMode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {authMode === 'login' ? 'Selamat Datang Kembali!' : 'Buat Akun Portal Siswa'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {authMode === 'login' ? 'Masuk untuk melanjutkan riwayat pengerjaan asesmen bakat.' : 'Daftar sekali untuk membuka hak akses gratis seluruh fitur tes EduMind.'}
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Nama Lengkap Siswa</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text" 
                          name="name"
                          required
                          placeholder="Masukkan nama lengkap Anda"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 text-xs border border-slate-200 focus:border-primary rounded-xl outline-none transition-all font-medium"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Alamat Email Aktif</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="email" 
                        name="email"
                        required
                        placeholder="nama@sekolah.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 text-xs border border-slate-200 focus:border-primary rounded-xl outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Kata Sandi (Password)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="password" 
                        name="password"
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 text-xs border border-slate-200 focus:border-primary rounded-xl outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        <span>Mempersiapkan Lembar Kerja Siswa...</span>
                      </>
                    ) : (
                      <>
                        <span>{authMode === 'login' ? 'Masuk ke Dashboard Siswa' : 'Daftar Akun & Mulai Evaluasi'}</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs font-medium text-slate-400">
                  {authMode === 'login' ? (
                    <p>
                      Belum memiliki akun siswa?{' '}
                      <button onClick={() => setAuthMode('signup')} className="text-primary font-bold hover:underline">Daftar Sekarang</button>
                    </p>
                  ) : (
                    <p>
                      Sudah terdaftar di sistem?{' '}
                      <button onClick={() => setAuthMode('login')} className="text-primary font-bold hover:underline">Masuk Akun</button>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 items-center justify-center pt-4 text-[10px] font-semibold text-slate-400">
                  <ShieldCheck size={12} className="text-emerald-500" /> Secure Data Encryption By Maleotech
                </div>

              </div>
            </div>
          )}

          {/* ── FOOTER GLOBAL TERPUSAT ── */}
          <footer className="bg-slate-900 text-white pt-32 pb-10 px-8">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-20 pb-20 border-b border-white/5">
              <div className="lg:col-span-5 space-y-8">
                <div className="flex items-center gap-4">
                  <Image src="/images/logo-edumind-transparan.png" alt="Logo" width={60} height={60} className="brightness-125" />
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-primary leading-none tracking-tighter uppercase">EduMind</span>
                    <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">Global Wellbeing</span>
                  </div>
                </div>
                <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                  Memberdayakan ekosistem pendidikan dengan teknologi AI untuk kesehatan mental serta eksplorasi bakat yang inklusif dan aman.
                </p>
              </div>
              <div className="lg:col-span-3 space-y-8 font-bold uppercase text-[10px] tracking-widest text-slate-500">
                <h4 className="text-white text-sm tracking-normal">Navigasi</h4>
                <ul className="space-y-4">
                  <li><Link href="/dashboard/student" className="hover:text-primary transition">Dashboard Student</Link></li>
                  <li><Link href="/dashboard/parent" className="hover:text-primary transition">Portal Orang Tua</Link></li>
                  <li><Link href="/dashboard/teacher" className="hover:text-primary transition">Teacher Dashboard</Link></li>
                </ul>
              </div>
              <div className="lg:col-span-4 space-y-8">
                <h4 className="text-white font-bold">Kontak Kami</h4>
                <div className="space-y-4 text-slate-400 font-medium">
                  <p>📍 Intermark Indonesia Ruko 8, Tangerang Selatan</p>
                  <p>📞 +62 821-4391-0521</p>
                  <p className="text-primary font-black">✉️ support@maleotech.com</p>
                </div>
              </div>
            </div>
            <div className="text-center pt-10 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              © 2026 Yayasan Maleo Talenta Cendekia. Seluruh Hak Cipta Dilindungi.
        </div>
          </footer>
        </NextAuthProvider>
      </body>
    </html>
  );
}