"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  MessageCircle, 
  ShieldAlert, 
  Star, 
  Home, 
  BarChart2, 
  Bell,
  Search,
  Settings,
  LogOut
} from 'lucide-react';

export default function StudentLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-30">
        <div className="p-8 flex items-center gap-3">
          <Image src="/logo-mainhealth.png" alt="Logo" width={45} height={45} />
          <div className="flex flex-col">
            <span className="text-xl font-black text-primary leading-none tracking-tighter">educourse</span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">main health</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem 
            href="/dashboard/student" 
            icon={<Home size={20} />} 
            label="Dashboard" 
            active={pathname === '/dashboard/student'} 
          />
          <NavItem 
            href="/dashboard/student/chat" 
            icon={<MessageCircle size={20} />} 
            label="Curhat Aman" 
            active={pathname === '/dashboard/student/chat'} 
          />
          <NavItem 
            href="/dashboard/student/progress" 
            icon={<BarChart2 size={20} />} 
            label="Progress Saya" 
            active={pathname === '/dashboard/student/progress'} 
          />
          <NavItem 
            href="/dashboard/student/talent" 
            icon={<Star size={20} />} 
            label="Minat Bakat" 
            active={pathname === '/dashboard/student/talent'} 
          />
          <NavItem 
            href="/dashboard/student/report" 
            icon={<ShieldAlert size={20} />} 
            label="Lapor Insiden" 
            active={pathname === '/dashboard/student/report'} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Pengaturan" />
          <NavItem href="/logout" icon={<LogOut size={20} />} label="Keluar" danger />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVBAR */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center bg-slate-100 px-4 py-2 rounded-xl w-96 border border-transparent focus-within:border-primary/20 transition-all">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Cari aktivitas atau bantuan..." 
              className="bg-transparent outline-none text-sm w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">Muhammad Khoirul</p>
                <p className="text-[11px] font-semibold text-primary mt-1">Siswa - Kelas 12A</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary flex items-center justify-center overflow-hidden shadow-sm">
                 <Image src="/logo-mainhealth.png" alt="Avatar" width={30} height={30} />
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-8 max-w-7xl mx-auto w-full">
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