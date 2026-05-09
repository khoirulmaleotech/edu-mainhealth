"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { 
  UserRound, 
  Calendar, 
  MessageCircle, 
  Activity, 
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from "next-auth/react";

export default function PsychologistLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session } = useSession();

  const menuItems = [
    { href: "/dashboard/psychologist", icon: <Activity size={20} />, label: "Case Overview" },
    { href: "/dashboard/psychologist/patients", icon: <UserRound size={20} />, label: "Daftar Pasien" },
    { href: "/dashboard/psychologist/schedule", icon: <Calendar size={20} />, label: "Jadwal Sesi" },
    { href: "/dashboard/psychologist/notes", icon: <FileText size={20} />, label: "Catatan Klinis" },
    { href: "/dashboard/psychologist/chat", icon: <MessageCircle size={20} />, label: "Konsultasi Chat" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] font-sans relative text-slate-700">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-[70] h-screen w-72 bg-white border-r border-slate-200 flex-col transition-transform duration-300 ease-in-out flex
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/logo-edumind-transparan.png" alt="Logo" width={40} height={40} />
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#00adb5] leading-none tracking-tight">EduMind</span>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">Psychologist Console</span>
            </div>
          </div>
          <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <PsychNavItem 
              key={item.href}
              href={item.href} 
              icon={item.icon} 
              label={item.label} 
              active={pathname === item.href} 
              onClick={() => setIsSidebarOpen(false)}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 space-y-1">
          <PsychNavItem icon={<Settings size={20} />} label="Settings" />
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl cursor-pointer transition-all font-semibold text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* HEADER / NAVBAR */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-10 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex flex-col md:flex-row md:items-center gap-2">
              <h2 className="text-lg font-black text-slate-800">Psychologist Console</h2>
              <span className="hidden md:inline-block bg-[#00adb5]/10 text-[#00adb5] text-[10px] font-bold px-3 py-1 rounded-full border border-[#00adb5]/20">
                Clinical Mode
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-[#00adb5] transition-colors cursor-pointer border border-slate-100">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            
            <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-slate-200">
              <div className="text-right hidden xs:block">
                <p className="text-sm font-black text-slate-800 leading-none">{session?.user?.name || "Psikolog"}</p>
                <p className="text-[11px] font-medium text-[#00adb5] mt-1">Clinical Specialist</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#00adb5] flex items-center justify-center font-black text-white shadow-lg shadow-[#00adb5]/20 border-2 border-white overflow-hidden uppercase">
                {session?.user?.name?.charAt(0) || "P"}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-5 md:p-10 max-w-7xl w-full mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

function PsychNavItem({ href = "#", icon, label, active = false, onClick }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`
        flex items-center gap-4 px-5 py-3.5 rounded-2xl cursor-pointer transition-all font-semibold text-sm
        ${active 
          ? 'bg-[#00adb5] text-white shadow-lg shadow-[#00adb5]/20' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-[#00adb5]'}
      `}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}