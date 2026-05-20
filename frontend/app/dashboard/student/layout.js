"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { 
  MessageCircle, 
  ShieldAlert, 
  Star, 
  Home, 
  BarChart2, 
  User, 
  LogOut,
  Stethoscope,
  Menu,
  X,
  ChevronDown,
  Loader2,
  MessagesSquare
} from 'lucide-react';

export default function StudentLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // STATE BARU: Untuk menyimpan data user dari API
  const [userData, setUserData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // PROTEKSI KEAMANAN: Cek Session secara realtime
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // FUNGSI BARU: Mengambil data profil dari API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/student/profile");
        const data = await res.json();
        if (data.success) {
          setUserData(data.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    // Hanya fetch jika user sudah terautentikasi
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  // Tutup dropdown jika klik di luar area
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tutup sidebar mobile saat navigasi berubah
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Tampilkan loading screen jika status session masih dicek
  if (status === "loading") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-4">
        <Loader2 className="animate-spin text-[#00adb5]" size={40} />
        <p className="text-sm font-bold text-slate-400 animate-pulse">Memverifikasi Sesi...</p>
      </div>
    );
  }

  // Jika tidak ada session, jangan render apapun untuk keamanan
  if (!session) return null;

  // UPDATE: Prioritaskan data dari API (userData), jika kosong fallback ke session, lalu ke default image
  const userImage = userData?.image || session?.user?.image || "/images/logo-edumind-transparan.png";
  const userFullname = userData?.fullname || userData?.name || session?.user?.fullname || session?.user?.name || "Siswa EduMind";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col z-[50] transition-transform duration-300 w-72
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/logo-edumind-transparan.png" alt="Logo" width={40} height={40} />
            <div className="flex flex-col">
              <span className="text-xl font-black text-primary leading-none tracking-tighter">EduMind</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">By Educourse</span>
            </div>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <NavItem href="/dashboard/student" icon={<Home size={20} />} label="Dashboard" active={pathname === '/dashboard/student'} />
          <NavItem href="/dashboard/student/chat" icon={<MessageCircle size={20} />} label="Student Diary Buddy" active={pathname === '/dashboard/student/chat'} />
          <NavItem href="/dashboard/student/report" icon={<ShieldAlert size={20} />} label="Student Safe Space" active={pathname.includes('/report')} />
          <NavItem href="/dashboard/student/tilik-diri" icon={<Star size={20} />} label="Self Reflection - Tilik Diri" active={pathname === '/dashboard/student/tilik-diri'} />
          <NavItem href="/dashboard/student/chat/teacher" icon={<MessagesSquare size={20} />} label="Student Support" active={pathname.includes('/teacher')} />
          <NavItem href="/dashboard/student/progress" icon={<BarChart2 size={20} />} label="My Journey" active={pathname === '/dashboard/student/progress'} />
          <NavItem href="/dashboard/student/chat/psychologist" icon={<Stethoscope size={20} />} label="Professional Support" active={pathname.includes('/psychologist')} />
          <NavItem href="/dashboard/student/talent" icon={<Star size={20} />} label="Self Explorer" active={pathname === '/dashboard/student/talent'} />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <NavItem href="/dashboard/student/profile" icon={<User size={20} />} label="Profile" active={pathname === '/dashboard/student/profile'} />
          <NavItem href="/logout" icon={<LogOut size={20} />} label="Exit" danger />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVBAR */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          
          <div className="flex items-center gap-4">
            <button 
              className="p-2 text-slate-600 lg:hidden hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative pl-3 md:pl-6 border-l border-slate-200" ref={dropdownRef}>
              <button 
                className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded-xl transition-all"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-none">
                    {isLoadingProfile ? "Memuat..." : userFullname}
                  </p>
                  <p className="text-[10px] font-semibold text-primary mt-1 uppercase">Siswa</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary flex items-center justify-center overflow-hidden shadow-sm relative">
                   {/* Jika masih loading, bisa tampilkan icon loading kecil. Di sini kita langsung tembak userImage */}
                     <img
                    src={userImage} 
                    alt="Avatar" 
                    sizes="40px"
                    className="w-full h-full object-cover"
                   />
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 animate-in fade-in zoom-in duration-200">
                  <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">
                    <Home size={18} /> Dashboard
                  </Link>
                  <Link href="/dashboard/student/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    <User size={18} /> Profile
                  </Link>
                  <div className="h-px bg-slate-100 my-1 mx-4" />
                  <Link href="/logout" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={18} /> Exit
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full font-medium">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href = "#", icon, label, active = false, danger = false }) {
  return (
    <Link href={href} className={`
      flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer transition-all font-bold text-sm
      ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
      ${danger ? 'hover:text-red-500 hover:bg-red-50' : ''}
    `}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}