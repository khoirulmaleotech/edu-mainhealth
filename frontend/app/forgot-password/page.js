"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, ArrowLeft, Loader2, ShieldCheck, MailCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Menunggu delay mikro demi transisi kehalusan UX di layar siswa
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSent(true);
    } catch (err) {
      console.error("Gagal meminta reset password:", err);
      alert("Terjadi kesalahan jaringan. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased selection:bg-[#00adb5] selection:text-white">
      
      <div className="sm:mx-auto w-full max-w-md text-center space-y-6">
        {/* Logo Identik Dengan Halaman Login Utama */}
        <Link href="/" className="inline-flex items-center gap-3 justify-center group">
          <Image 
            src="/images/logo-edumind-transparan.png" 
            alt="Logo" 
            width={60} 
            height={60} 
            className="group-hover:scale-105 transition-transform duration-500"
          />
          <div className="flex flex-col text-left">
            <span className="text-2xl font-black text-[#00adb5] leading-none tracking-tighter uppercase text-primary">EduMind</span>
            <span className="text-[10px] font-bold text-slate-400">by Educourse</span>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md px-4">
        <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00adb5]/20"></div>
          
          {!isSent ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Pemulihan Kata Sandi</h2>
                <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                  Masukkan email institusi Anda. Sistem EduMind akan mengirimkan tautan aman untuk mengatur ulang kata sandi Anda.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 ml-2">Email Institusi</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00adb5] transition-colors" size={20} />
                    <input 
                      type="email" 
                      required
                      placeholder="Masukkan email Anda"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[20px] outline-none text-sm font-semibold transition-all shadow-inner"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-[56px] bg-[#0b0e14] text-white rounded-[25px] font-bold text-sm shadow-2xl hover:bg-[#00adb5] transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <span>Kirim Tautan Pemulihan</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Tampilan Sukses Email Terkirim */
            <div className="text-center space-y-6 py-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <MailCheck size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Periksa Email Anda</h3>
                <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Kami telah mengirimkan instruksi penyetelan ulang kata sandi ke <span className="text-slate-700 font-bold">{email}</span>.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl text-[11px] text-slate-400 font-semibold leading-normal">
                Tidak menerima email? Periksa folder spam atau coba kirim ulang beberapa saat lagi.
              </div>
            </div>
          )}

          {/* Navigasi Balik */}
          <div className="pt-6 mt-6 border-t border-slate-100 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#00adb5] transition-colors">
              <ArrowLeft size={14} /> Kembali ke Halaman Masuk
            </Link>
          </div>

        </div>

        <div className="flex gap-2 items-center justify-center pt-6 text-[10px] font-semibold text-slate-400">
          <ShieldCheck size={12} className="text-emerald-500" /> Automated Identity Protection EduMind
        </div>
      </div>
    </div>
  );
}