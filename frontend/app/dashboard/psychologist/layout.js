"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  UserRound,
  MessageCircle,
  Activity,
  LogOut,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from "next-auth/react";
import { fetchInstance } from "@/lib/fetchInstance";

export default function PsychologistLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session } = useSession();

  const menuItems = [

    { name: "Daftar Pasien", icon: <UserRound size={20} />, path: "/dashboard/psychologist/patients" },
    {
      name: "Konsultasi Chat",
      icon: <MessageCircle size={20} />,
      path: "/dashboard/psychologist/chat",
      unread: unreadCount,
    },
  ];

  useEffect(() => {
    let mounted = true;

    const fetchUnreadSummary = async () => {
      try {
        const response = await fetchInstance("/api/psychologist/chat/unread");
        if (mounted) setUnreadCount(response?.unread || 0);
      } catch (error) {
        console.error("Failed to fetch psychologist unread summary", error);
      }
    };

    if (session?.user?.id) fetchUnreadSummary();

    return () => {
      mounted = false;
    };
  }, [session?.user?.id, pathname]);

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
        <div className="flex items-center gap-3 px-2 mb-10">
          <Image src="/images/logo-edumind-transparan.png" alt="Logo" width={45} height={45} className="bg-white rounded-xl p-1" />
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter uppercase">EduMind</span>
            <span className="text-[10px] font-bold text-[#00adb5] tracking-widest uppercase">Psikolog</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const hasUnread = Number(item.unread || 0) > 0;

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all
                  ${isActive
                    ? 'bg-[#00adb5] text-white shadow-lg shadow-[#00adb5]/20'
                    : 'hover:bg-white/5 hover:text-white'}
                `}
              >
                {item.icon}
                <span className="flex-1">{item.name}</span>
                {hasUnread && (
                  <span className={`min-w-5 h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center ${isActive ? "bg-white text-[#00adb5]" : "bg-red-500 text-white"
                    }`}>
                    {item.unread > 99 ? "99+" : item.unread}
                  </span>
                )}
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
                <p className="text-sm font-black text-slate-800 leading-none">{session?.user?.name || "Psikolog"}</p>
                <p className="text-[10px] font-bold text-[#00adb5] uppercase mt-1">Clinical Specialist</p>
              </div>
              <div className="h-11 w-11 bg-[#00adb5] rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-[#00adb5]/20">
                {session?.user?.name?.charAt(0) || "P"}
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
