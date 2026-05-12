"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  AlertTriangle,
  MessageSquare,
  Search,
  Bell,
  LayoutDashboard,
  GraduationCap,
  Settings,
  LogOut,
  HeartPulse,
} from "lucide-react";

export default function TeacherLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="hidden xl:flex w-72 bg-slate-900 text-white flex-col sticky top-0 h-screen shadow-2xl">
        <div className="p-8 flex items-center gap-3">
          {/* Brand Logo & Title */}
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

        {/* Hyperlink Menu List */}
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <NavItem
            href="/dashboard/teacher"
            icon={<LayoutDashboard size={20} />}
            label="Overview"
            active={pathname === "/dashboard/teacher"}
          />
          <NavItem
            href="/dashboard/teacher/students"
            icon={<Users size={20} />}
            label="Data Siswa"
            active={pathname === "/dashboard/teacher/students"}
          />
          <NavItem
            href="/dashboard/teacher/alerts"
            icon={<AlertTriangle size={20} />}
            label="Alert Kasus"
            count={5}
            active={pathname === "/dashboard/teacher/alerts"}
          />
          <NavItem
            href="/dashboard/teacher/reports"
            icon={<AlertTriangle size={20} />}
            label="Laporan Kasus"
            count={5}
            active={pathname === "/dashboard/teacher/reports"}
          />
          <NavItem
            href="/dashboard/teacher/mood-logs"
            icon={<HeartPulse size={20} />}
            label="Mood Log"
            active={pathname === "/dashboard/teacher/mood-logs"}
          />
          {/* <NavItem */}
          {/*   href="/dashboard/teacher/chat" */}
          {/*   icon={<MessageSquare size={20} />} */}
          {/*   label="Konseling Chat" */}
          {/*   active={pathname === "/dashboard/teacher/chat"} */}
          {/* /> */}
          {/* <NavItem */}
          {/*   href="/dashboard/teacher/education" */}
          {/*   icon={<GraduationCap size={20} />} */}
          {/*   label="Edukasi Guru" */}
          {/*   active={pathname === "/dashboard/teacher/education"} */}
          {/* /> */}
        </nav>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-slate-800 space-y-1">
          {/* <NavItem */}
          {/*   href="/dashboard/teacher/settings" */}
          {/*   icon={<Settings size={20} />} */}
          {/*   label="Pengaturan" */}
          {/*   active={pathname === "/dashboard/teacher/settings"} */}
          {/* /> */}
          <NavItem
            href="/logout"
            icon={<LogOut size={20} />}
            label="Keluar"
            danger
          />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVBAR */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center bg-slate-50 px-4 py-2.5 rounded-xl w-full max-w-md border border-slate-100">
            <Search size={18} className="text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Cari data siswa..."
              className="bg-transparent outline-none text-sm w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-5">
            {/* Notification Badge */}
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  Pak Anwar, S.Kom
                </p>
                <p className="text-[11px] font-semibold text-primary mt-1">
                  Wali Kelas - 12A
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20">
                A
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <div className="p-8 lg:p-12">{children}</div>
      </main>
    </div>
  );
}

/**
 * NavItem Component dengan Link Next.js
 */
function NavItem({
  href,
  icon,
  label,
  active = false,
  danger = false,
  count = 0,
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer transition-all duration-300 font-bold text-sm
        ${active ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"}
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
