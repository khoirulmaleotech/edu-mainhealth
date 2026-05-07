"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Lock, Building2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
  const [role, setRole] = useState('student');

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-6xl w-full bg-white rounded-[50px] shadow-2xl shadow-slate-200 overflow-hidden grid lg:grid-cols-2 min-h-[850px]">
        {/* BRANDING SIDE (Left) */}
        <div className="hidden lg:flex bg-[#00adb5] items-center justify-center p-20 relative">
          <div className="relative z-10 text-white space-y-8">
            <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[50px] border border-white/20">
              <div className="bg-white p-4 rounded-3xl inline-block mb-8 shadow-xl shadow-[#00adb5]/20">
                <Image src="/images/logo-edumind-new.png" alt="Mascot" width={120} height={120} />
              </div>
              <h2 className="text-4xl font-black leading-tight mb-4">Gabung di Ekosistem <br/> <span className="text-[#fbcd2b] italic">EduMind.</span></h2>
              <p className="text-sm opacity-80 font-medium">Bicara nyaman, kesehatan emosional terjaga dengan dukungan AI dan ahli.</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={20} className="text-[#fbcd2b]" /> Keamanan Data Standar ISO 27001
            </div>
          </div>
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
        </div>

        {/* FORM SIDE (Right) */}
        <div className="p-12 lg:p-20 space-y-10 flex flex-col justify-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo-edumind-new.png" alt="Logo" width={60} height={60} />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-[#00adb5] tracking-tighter uppercase leading-none">EduMind</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Registration</span>
            </div>
          </Link>

          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Daftar Akun</h1>
            <p className="text-slate-400 font-medium italic">Hubungkan akunmu dengan kode afiliasi sekolah.</p>
          </div>

          <form className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Nama Depan" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold shadow-inner" />
              <input type="text" placeholder="Belakang" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold shadow-inner" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Sekolah</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="email" placeholder="budi@sekolah.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold shadow-inner" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kode Afiliasi Institusi</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" placeholder="CONTOH: MALEO-2026" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold shadow-inner" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="password" placeholder="Min. 8 Karakter" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold shadow-inner" />
              </div>
            </div>

            <button className="w-full py-5 bg-[#0b0e14] text-white rounded-[25px] font-black text-xs uppercase tracking-widest hover:bg-[#00adb5] transition-all flex items-center justify-center gap-3 shadow-xl">
              Daftar Sekarang <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center text-sm font-medium text-slate-400">
            Sudah punya akun? <Link href="/login" className="text-[#00adb5] font-black hover:underline">Masuk Disini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}