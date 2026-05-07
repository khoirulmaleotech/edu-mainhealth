"use client";
import React from 'react';
import Image from 'next/image';
import { 
  UserRound, 
  Calendar, 
  MessageCircle, 
  Activity, 
  FileText,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PsychologistLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] font-sans">
      {/* SIDEBAR KONSOLE */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <Image src="/logo-mainhealth.png" alt="Logo" width={40} height={40} />
          <div className="flex flex-col">
            <span className="text-xl font-black text-primary leading-none tracking-tighter uppercase">EduMind</span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Psychologist</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <PsychNavItem 
            href="/dashboard/psychologist" 
            icon={<Activity size={20} />} 
            label="Case Overview" 
            active={pathname === '/dashboard/psychologist'} 
          />
          <PsychNavItem 
            href="/dashboard/psychologist/patients" 
            icon={<UserRound size={20} />} 
            label="Daftar Pasien" 
            active={pathname === '/dashboard/psychologist/patients'}
          />
          <PsychNavItem 
            href="/dashboard/psychologist/schedule" 
            icon={<Calendar size={20} />} 
            label="Jadwal Sesi" 
          />
          <PsychNavItem 
            href="/dashboard/psychologist/notes" 
            icon={<FileText size={20} />} 
            label="Catatan Klinis" 
          />
          <PsychNavItem 
            href="/dashboard/psychologist/chat" 
            icon={<MessageCircle size={20} />} 
            label="Konsultasi Chat" 
          />
        </nav>

        <div className="p-6 border-t border-slate-100 space-y-2">
          <PsychNavItem icon={<Settings size={20} />} label="Settings" />
          <PsychNavItem icon={<LogOut size={20} />} label="Logout" danger />
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* HEADER / NAVBAR */}
        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 text-slate-800">
            <h2 className="text-xl font-bold">Psychologist Console</h2>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Clinical Mode</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative p-2 bg-slate-50 rounded-full text-slate-400">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 leading-none">Dr. Sarah Wijaya</p>
                <p className="text-[11px] font-semibold text-primary mt-1">Clinical Psychologist</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center font-bold text-slate-800 shadow-lg shadow-secondary/20">
                SW
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function PsychNavItem({ href = "#", icon, label, active = false, danger = false }) {
  return (
    <Link href={href} className={`
      flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all font-bold text-sm
      ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}
      ${danger ? 'hover:text-red-500 hover:bg-red-50' : ''}
    `}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}