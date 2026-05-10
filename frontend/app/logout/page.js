"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  useEffect(() => {
    const performLogout = async () => {
      // Menghapus localStorage jika ada data manual yang Bapak simpan
      localStorage.clear(); 
      
      // Proses Sign Out dari NextAuth
      // redirect: true akan mengarahkan user ke halaman login setelah selesai
      await signOut({ callbackUrl: "/login" }); 
    };

    performLogout();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#00adb5]" size={40} />
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Sedang keluar...</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Membersihkan sesi keamanan kamu.
          </p>
        </div>
      </div>
    </div>
  );
}