"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Building2, Users, ShieldCheck,
  LogOut, Menu, HeartPulse, Newspaper, ClipboardList, Activity, Trophy
} from 'lucide-react';
import { signOut, useSession } from "next-auth/react";
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard/admin' },
    { name: 'Wellbeing League', icon: <Trophy size={20} />, path: '/dashboard/admin/wellbeing-league' },
    { name: 'Monitoring Aktivitas', icon: <Activity size={20} />, path: '/dashboard/admin/activity-monitoring' },
    { name: 'Fasilitator', icon: <Users size={20} />, path: '/dashboard/admin/fasilitator' },
    { name: 'Antrean Verifikasi', icon: <ShieldCheck size={20} />, path: '/dashboard/admin/verification-queue' },
    { name: 'Verifikasi Sekolah', icon: <Building2 size={20} />, path: '/dashboard/admin/verify-schools' },
    { name: 'Verifikasi Psikolog', icon: <ShieldCheck size={20} />, path: '/dashboard/admin/verify-psychologist' },
    { name: 'Manajemen User', icon: <Users size={20} />, path: '/dashboard/admin/users' },
    { name: 'Manajemen Konten', icon: <Newspaper size={20} />, path: '/dashboard/admin/articles' },
    { name: 'Indikator Chat Kritis', icon: <HeartPulse size={20} />, path: '/dashboard/admin/critical-chat-logs' },
    { name: 'Laporan Insiden', icon: <HeartPulse size={20} />, path: '/dashboard/admin/reports' },
    { name: 'Hasil Tilik Diri', icon: <ClipboardList size={20} />, path: '/dashboard/admin/tilik-diri' },
    { name: 'Pre-Test Kuesioner', icon: <ClipboardList size={20} />, path: '/dashboard/admin/pretest-summary' },
    { name: 'Post-Test Kuesioner', icon: <ClipboardList size={20} />, path: '/dashboard/admin/posttest-summary' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-[70] h-screen w-72 bg-[#0b0e14] text-slate-400 p-6 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col gap-3 px-2 mb-10">
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl w-fit">
            <Image src="/images/telkom-indonesia.png" alt="Telkom Indonesia" width={60} height={30} className="h-6 w-auto" />
            <Image src="/images/tjsl.png" alt="TJSL" width={60} height={30} className="h-6 w-auto" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter uppercase">EduMind</span>
            <span className="text-[10px] font-bold text-[#00adb5] tracking-widest uppercase">Super Admin</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`
                  flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all
                  ${isActive
                    ? 'bg-[#00adb5] text-white shadow-lg shadow-[#00adb5]/20'
                    : 'hover:bg-white/5 hover:text-white'}
                `}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-auto flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
        >
          <LogOut size={20} />
          Keluar Sistem
        </button>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between lg:justify-end px-6 sticky top-0 z-50">
          <button className="lg:hidden p-2 text-slate-500" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <div className="flex justify-end items-center gap-4">
            <div className="h-10 w-[1px] bg-slate-100 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 leading-none">{session?.user?.name || "Admin EduMind"}</p>
                <p className="text-[10px] font-bold text-[#00adb5] uppercase mt-1">Super Admin</p>
              </div>
              <div className="h-11 w-11 bg-[#00adb5] rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-[#00adb5]/20">
                {session?.user?.name?.charAt(0) || "A"}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
