"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');

  const roles = [
    { id: 'student', label: 'Siswa', emoji: '🎓' },
    { id: 'parent', label: 'Ortu', emoji: '🏠' },
    { id: 'teacher', label: 'Guru', emoji: '👨‍🏫' },
    { id: 'psychologist', label: 'Psikolog', emoji: '🏥' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans selection:bg-primary selection:text-white">
      <div className="max-w-6xl w-full bg-white rounded-[50px] shadow-2xl shadow-slate-200 overflow-hidden grid lg:grid-cols-2 min-h-[800px]">
        
        {/* LEFT SIDE: Login Form */}
        <div className="p-12 lg:p-20 space-y-12 flex flex-col justify-center">
          {/* Logo Baru dengan Penyesuaian Width */}
          <Link href="/" className="flex items-center gap-4 group">
            <Image 
              src="/images/logo-edumind.png" 
              alt="EduMind Gajah Dokter" 
              width={75} // Width disesuaikan agar maskot terlihat jelas
              height={75} 
              className="group-hover:scale-105 transition-transform duration-500"
            />
            <div className="flex flex-col">
              <span className="text-3xl font-black text-primary leading-none tracking-tighter uppercase">EduMind</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">by Educourse</span>
            </div>
          </Link>

          <div className="space-y-3">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none">Selamat Datang</h1>
            <p className="text-slate-400 font-medium italic text-lg">Pilih peranmu dan mulailah perjalanan hari ini.</p>
          </div>

          {/* Role Selector - Warna Kuning (Secondary) untuk Hover */}
          <div className="grid grid-cols-4 gap-3">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`py-4 rounded-3xl flex flex-col items-center gap-2 transition-all border-2 duration-300 ${
                  role === r.id 
                    ? 'border-primary bg-primary/5 scale-105 shadow-lg shadow-primary/10' 
                    : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-secondary/30'
                }`}
              >
                <span className="text-2xl">{r.emoji}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{r.label}</span>
              </button>
            ))}
          </div>

          <form className="space-y-7">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Email Institusi</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={22} />
                <input 
                  type="email" 
                  placeholder="nama@sekolah.com"
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[25px] outline-none text-sm font-bold transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Kata Sandi</label>
                <Link href="#" className="text-[10px] font-black text-primary uppercase hover:text-secondary transition-colors">Lupa Password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={22} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[25px] outline-none text-sm font-bold transition-all shadow-inner"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <button className="w-full py-5 bg-primary text-white rounded-[30px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              Masuk Sekarang <ArrowRight size={20} />
            </button>
          </form>

          <p className="text-center text-sm font-medium text-slate-400">
            Belum punya akun? <Link href="/signup" className="text-primary font-black hover:text-secondary transition-colors underline-offset-4 hover:underline">Daftar Akun Baru</Link>
          </p>
        </div>

        {/* RIGHT SIDE: Branding / Mascot utuh */}
        <div className="hidden lg:flex bg-slate-900 items-center justify-center relative overflow-hidden p-20">
          <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
          
          <div className="relative z-10 text-center space-y-12">
            <div className="bg-white/5 backdrop-blur-2xl p-12 rounded-[60px] border border-white/10 shadow-2xl">
              <Image 
                src="/images/logo-edumind.png" 
                alt="Large Mascot" 
                width={320} // Ukuran besar untuk branding di sisi kanan
                height={320} 
                className="mx-auto drop-shadow-[0_20px_50px_rgba(0,173,181,0.3)]"
              />
              <div className="mt-10 space-y-4">
                <h2 className="text-4xl font-black text-white leading-tight">
                  Kesehatan Mentalmu <br/>
                  <span className="text-secondary italic">Prioritas Kami.</span>
                </h2>
                <p className="text-slate-400 font-medium text-lg">Platform interaktif untuk ekosistem sekolah yang lebih bahagia.</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <div className="h-1.5 w-12 bg-primary rounded-full"></div>
              <div className="h-1.5 w-4 bg-slate-700 rounded-full"></div>
              <div className="h-1.5 w-4 bg-slate-700 rounded-full"></div>
            </div>
          </div>

          {/* Dekorasi Ornamen Kuning & Biru */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary opacity-20 rounded-full blur-[100px]"></div>
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-secondary opacity-10 rounded-full blur-[100px]"></div>
        </div>
      </div>
    </div>
  );
}