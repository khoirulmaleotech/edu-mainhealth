"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  HeartPulse,
  Settings,
  Menu,
  X,
} from "lucide-react";

export default function TeacherLayout({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden xl:flex w-72 bg-slate-900 text-white flex-col sticky top-0 h-screen shadow-2xl">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm xl:hidden"
        />
      )}

      {/* MOBILE DRAWER */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-white shadow-2xl xl:hidden
          transform transition-transform duration-300 ease-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="absolute right-4 top-4">
          <button
            onClick={closeMobileMenu}
            className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <SidebarContent pathname={pathname} onNavigate={closeMobileMenu} />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* MOBILE TOPBAR */}
        <header className="xl:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-edumind-transparan.png"
              alt="EduMind Logo"
              width={36}
              height={36}
            />

            <div className="flex flex-col">
              <span className="text-lg font-black text-primary leading-none tracking-tighter uppercase">
                EduMind
              </span>

              <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                Teacher
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20"
          >
            <Menu size={22} />
          </button>
        </header>

        <div className="p-4 md:p-8 lg:p-12">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({ pathname, onNavigate }) {
  return (
    <>
      <div className="p-8 flex items-center gap-3">
        <Image
          src="/images/logo-edumind-transparan.png"
          alt="EduMind Logo"
          width={40}
          height={40}
          className="brightness-110"
        />

        <div className="flex flex-col">
          <span className="text-xl font-black text-primary leading-none tracking-tighter uppercase">
            EduMind
          </span>

          <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase text-nowrap">
            By Educourse
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        <NavItem
          href="/dashboard/teacher"
          icon={<LayoutDashboard size={20} />}
          label="Overview"
          active={pathname === "/dashboard/teacher"}
          onNavigate={onNavigate}
        />

        <NavItem
          href="/dashboard/teacher/students"
          icon={<Users size={20} />}
          label="Data Siswa"
          active={pathname === "/dashboard/teacher/students"}
          onNavigate={onNavigate}
        />

        <NavItem
          href="/dashboard/teacher/emotional-reports"
          icon={<AlertTriangle size={20} />}
          label="Alert Kasus"
          active={pathname === "/dashboard/teacher/emotional-reports"}
          onNavigate={onNavigate}
        />

        <NavItem
          href="/dashboard/teacher/incident-reports"
          icon={<HeartPulse size={20} />}
          label="Incident Reports"
          active={pathname === "/dashboard/teacher/incident-reports"}
          onNavigate={onNavigate}
        />
      </nav>

      <div className="p-6 border-t border-slate-800 space-y-1">
        {/* <NavItem */}
        {/*   href="/dashboard/teacher/settings" */}
        {/*   icon={<Settings size={20} />} */}
        {/*   label="Pengaturan" */}
        {/*   active={pathname === "/dashboard/teacher/settings"} */}
        {/*   onNavigate={onNavigate} */}
        {/* /> */}

        <NavItem
          href="/logout"
          icon={<LogOut size={20} />}
          label="Keluar"
          danger
          onNavigate={onNavigate}
        />
      </div>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
  danger = false,
  count = 0,
  onNavigate,
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`
        flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer transition-all duration-300 font-bold text-sm
        ${active
          ? "bg-primary text-white shadow-lg shadow-primary/30"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }
        ${danger ? "hover:text-red-500 hover:bg-red-500/10" : ""}
      `}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span>{label}</span>
      </div>

      {count > 0 && (
        <span className="bg-red-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-black animate-pulse">
          {count}
        </span>
      )}
    </Link>
  );
}
