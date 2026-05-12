"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  AlertTriangle,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  PieChart,
  ShieldCheck,
  User,
  School2Icon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function SchoolAdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Menu disesuaikan untuk peran Admin Sekolah / BK
  const menuItems = [
    {
      name: "Dashboard Sekolah",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard/school-admin",
    },
    {
      name: "Profil Sekolah",
      icon: <School2Icon size={20} />,
      path: "/dashboard/school-admin/profile",
    },
    {
      name: "Guru & Wali Kelas",
      icon: <Users size={20} />,
      path: "/dashboard/school-admin/homeroom",
    },
    {
      name: "Laporan Insiden",
      icon: <AlertTriangle size={20} />,
      path: "/dashboard/school-admin/reports",
    }, 
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* SIDEBAR MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
        fixed lg:sticky top-0 left-0 z-[70] h-screen w-72 bg-[#0b0e14] text-slate-400 p-6 flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 px-2 mb-10">
          <Image
            src="/images/logo-edumind-transparan.png"
            alt="Logo"
            width={45}
            height={45}
            className="bg-white rounded-xl p-1"
          />
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter uppercase">
              EduMind
            </span>
            <span className="text-[10px] font-bold text-[#00adb5] tracking-widest uppercase">
              School Admin
            </span>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`
                  flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all
                  ${
                    isActive
                      ? "bg-[#00adb5] text-white shadow-lg shadow-[#00adb5]/20"
                      : "hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* VERIFIED BADGE */}
        <div className="mb-4 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <ShieldCheck size={24} className="text-[#00adb5]" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Status Sistem
            </p>
            <p className="text-xs font-black text-white">
              Sekolah Terverifikasi
            </p>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-auto flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
        >
          <LogOut size={20} />
          Keluar Sistem
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-50">
          <button
            className="lg:hidden p-2 text-slate-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          {/* 
          <div className="hidden md:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-96">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Cari data siswa, guru, atau ID laporan..." className="bg-transparent outline-none text-sm w-full font-medium" />
          </div> */}

          <div className="flex items-center gap-4">
            {/* <button className="relative p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button> */}
            <div className="h-10 w-[1px] bg-slate-100 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 leading-none">
                  {session?.user?.name || "USER"}
                </p>
                <p className="text-[10px] font-bold text-[#00adb5] uppercase mt-1">
                  Kepala Sekolah / BK
                </p>
              </div>
              <div className="h-11 w-11 bg-[#00adb5] rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-[#00adb5]/20">
                {session?.user?.name?.charAt(0) || "B"}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
