"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  LogOut,
  Menu,
  ShieldCheck,
  School2Icon,
  ChevronDown,
  Building2,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

// ─────────────────────────────────────────────────────────────
// Helper: ambil inisial dari nama lengkap (maks 2 huruf)
// misal "Budi Santoso" → "BS", "Admin" → "A"
// ─────────────────────────────────────────────────────────────
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function SchoolAdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [schoolName, setSchoolName]     = useState(null);   // null = loading
  const [schoolVerified, setSchoolVerified] = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);

  const { data: session } = useSession();
  const pathname = usePathname();

  // ── Fetch data sekolah ──────────────────────────────────────
  // Tidak menggunakan session.user.school_id karena tidak ada di
  // token school_admin; endpoint berikut melakukan lookup via admin_id.
  // Buat route: GET /api/school/info → { name, is_verified }
  useEffect(() => {
    if (!session?.user?.id) return;

    async function fetchSchool() {
      try {
        const res  = await fetch("/api/school-admin/layout");
        const json = await res.json();
        if (json.success) {
          setSchoolName(json.school.name);
          setSchoolVerified(json.school.is_verified ?? false);
        }
      } catch {
        setSchoolName("Sekolah Tidak Dikenal");
      }
    }
    fetchSchool();
  }, [session?.user?.id]);

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

  const userName   = session?.user?.name  ?? "Admin";
  const userEmail  = session?.user?.email ?? "";
  const initials   = getInitials(userName);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">

      {/* SIDEBAR MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-[70] h-screen w-72
          bg-[#0b0e14] text-slate-400 flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 px-8 py-7 border-b border-white/5">
          <Image
            src="/images/logo-edumind-transparan.png"
            alt="Logo"
            width={40}
            height={40}
            className="bg-white rounded-xl p-1 shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">
              EduMind
            </span>
            <span className="text-[10px] font-bold text-[#00adb5] tracking-widest uppercase mt-0.5">
              School Admin
            </span>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all
                  ${
                    isActive
                      ? "bg-[#00adb5] text-white shadow-lg shadow-[#00adb5]/25"
                      : "hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <span className={isActive ? "text-white" : "text-slate-500"}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* SCHOOL BADGE — nama sekolah dari API, bukan hardcode */}
        <div className="mx-4 mb-4 bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {schoolVerified
                ? <ShieldCheck size={20} className="text-[#00adb5]" />
                : <Building2   size={20} className="text-slate-500" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                {schoolVerified ? "Terverifikasi" : "Status Sekolah"}
              </p>
              {schoolName === null ? (
                /* skeleton loading */
                <div className="h-3.5 w-36 bg-white/10 rounded-md animate-pulse" />
              ) : (
                <p className="text-xs font-black text-white leading-tight line-clamp-2">
                  {schoolName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="px-4 pb-6">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
          >
            <LogOut size={20} />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* TOPBAR */}
        <header className="h-[68px] bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-50 gap-4">

          {/* Hamburger (mobile) */}
          <button
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* Spacer — mendorong profil ke pojok kanan */}
          <div className="flex-1" />

          {/* PROFILE PILL ─────────────────────────────────── */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all group"
            >
              {/* Avatar */}
              <div className="h-9 w-9 bg-[#00adb5] rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md shadow-[#00adb5]/20 shrink-0">
                {initials}
              </div>
              {/* Info teks — disembunyikan di layar sangat kecil */}
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-sm font-black text-slate-800">
                  {userName}
                </span>
                <span className="text-[10px] font-bold text-[#00adb5] uppercase tracking-wider mt-0.5">
                  {/* Role dari session; fallback ke label default */}
                  {session?.user?.role === "school_admin"
                    ? "Admin Sekolah"
                    : "Kepala Sekolah / BK"}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <>
                {/* overlay transparan untuk menutup dropdown saat klik luar */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden">
                  {/* Info user */}
                  <div className="px-4 py-4 border-b border-slate-50">
                    <p className="text-sm font-black text-slate-800 truncate">{userName}</p>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{userEmail}</p>
                    {schoolName && (
                      <p className="text-[10px] font-bold text-[#00adb5] uppercase tracking-wider mt-2 truncate">
                        {schoolName}
                      </p>
                    )}
                  </div>
                  {/* Logout di dropdown juga */}
                  {/* <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut size={16} />
                    Keluar Sistem
                  </button> */}
                </div>
              </>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}