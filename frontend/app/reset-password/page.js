"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Loader2, ShieldCheck, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordConfirmPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Menangkap token pengesahan keamanan dari tautan email

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // State untuk kontrol hide/show password secara independen
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Konfirmasi kata sandi tidak cocok. Pastikan isian Anda sama.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (err) {
      console.error("Gagal memperbarui kata sandi baru:", err);
      alert("Terjadi kesalahan sistem internal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased selection:bg-[#00adb5] selection:text-white">
      
      <div className="sm:mx-auto w-full max-w-md text-center space-y-6">
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
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00adb5]"></div>
          
          {!isSuccess ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Atur Ulang Sandi</h2>
                <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                  Silakan buat kata sandi baru yang kuat dan unik untuk mengamankan kembali akses akun login Anda.
                </p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-5">
                
                {/* Input Kata Sandi Baru */}
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-bold text-slate-600 ml-2">Kata Sandi Baru</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00adb5] transition-colors" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      minLength={6}
                      placeholder="Masukkan kata sandi baru"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 md:pr-14 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[20px] outline-none text-sm font-semibold transition-all shadow-inner"
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

                {/* Input Konfirmasi Kata Sandi */}
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-bold text-slate-600 ml-2">Konfirmasi Kata Sandi</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00adb5] transition-colors" size={20} />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required
                      minLength={6}
                      placeholder="Ulangi kata sandi baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 md:pr-14 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[20px] outline-none text-sm font-semibold transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#00adb5] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-[56px] bg-[#0b0e14] text-white rounded-[25px] font-bold text-sm shadow-2xl hover:bg-[#00adb5] transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <span>Simpan Kata Sandi Baru</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Tampilan Sukses Ganti Password */
            <div className="text-center space-y-6 py-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Sandi Berhasil Diubah!</h3>
                <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Kata sandi baru Anda telah berhasil diperbarui di database enkripsi server aman Maleotech.
                </p>
              </div>
              <div className="pt-2">
                <Link 
                  href="/login" 
                  className="w-full h-[56px] bg-[#0b0e14] text-white rounded-[25px] font-bold text-sm shadow-2xl hover:bg-[#00adb5] transition-all flex items-center justify-center"
                >
                  Masuk ke Portal Sekarang
                </Link>
              </div>
            </div>
          )}

        </div>

        <div className="flex gap-2 items-center justify-center pt-6 text-[10px] font-semibold text-slate-400">
          <ShieldCheck size={12} className="text-emerald-500" /> End-to-End Cryptographic SSL Security
        </div>
      </div>
    </div>
  );
}