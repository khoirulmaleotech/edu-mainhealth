"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import {
  Home,
  Star,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  Search,
  Loader2,
  Menu,
  X
} from 'lucide-react';

export default function ParentLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);


  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  if (status === "loading") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#fafbfc] gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-bold text-slate-400 animate-pulse">
          Memverifikasi Sesi...
        </p>
      </div>
    );
  }

  if (!session) return null;

  const userFullname = session?.user?.fullname || session?.user?.name || "Orang Tua";
  const userImage = session?.user?.image || null;
  const userInitial = userFullname.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#fafbfc] font-sans">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-slate-100 flex flex-col z-[60] shadow-sm transition-transform duration-300 w-72
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/logo-edumind-transparan.png" alt="Logo" width={40} height={40} />
            <div className="flex flex-col">
              <span className="text-xl font-black text-primary leading-none tracking-tighter uppercase text-[#00adb5]">EduMind</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">By Educourse</span>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 p-1" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <ParentNavItem href="/dashboard/parent" icon={<Home size={20} />} label="Beranda" active={pathname === '/dashboard/parent'} />
          <ParentNavItem href="/dashboard/parent/talent" icon={<Star size={20} />} label="Minat & Bakat" active={pathname === '/dashboard/parent/talent'} />
          <ParentNavItem href="/dashboard/parent/insights" icon={<BookOpen size={20} />} label="Edukasi Orang Tua" active={pathname === '/dashboard/parent/insights'} />
        </nav>

        <div className="p-6 border-t border-slate-50 space-y-1">
          <ParentNavItem href="/dashboard/parent/settings" icon={<Settings size={20} />} label="Profil" active={pathname === '/dashboard/parent/settings'} />
          <ParentNavItem href="/logout" icon={<LogOut size={20} />} label="Keluar" danger />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-100 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center bg-slate-50 px-5 py-2.5 rounded-2xl w-full max-w-md border border-slate-100">
              <Search size={18} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Cari laporan atau artikel..."
                className="bg-transparent outline-none text-sm w-full font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">

            <div className="flex items-center gap-3 pl-3 lg:pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{userFullname}</p>
                <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-tight text-[#00adb5]">Akun Orang Tua</p>
              </div>

              <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-2xl overflow-hidden bg-[#fbcd2b]/20 flex items-center justify-center font-black text-slate-800 shadow-lg shadow-black/5 border border-white">
                {userImage ? (
                  <Image src={userImage} alt="Avatar" fill className="object-cover" />
                ) : (
                  userInitial
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

function ParentNavItem({ href = "#", icon, label, active = false, danger = false }) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer
        transition-all duration-300 font-bold text-sm
        ${active
          ? 'bg-[#00adb5] text-white shadow-lg shadow-[#00adb5]/30'
          : 'text-slate-400 hover:bg-slate-50 hover:text-[#00adb5]'
        }
        ${danger ? 'hover:text-red-500 hover:bg-red-50' : ''}
      `}
    >
      <div className={active ? 'text-white' : ''}>{icon}</div>
      <span>{label}</span>
    </Link>
  );
}