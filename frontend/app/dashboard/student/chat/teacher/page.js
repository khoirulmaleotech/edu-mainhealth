"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  MessageCircle,
  Star,
  ArrowLeft,
  Loader2,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function StudentTeacherListPage() {
  const { data: session } = useSession();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // Ambil semua guru satu sekolah via endpoint yang sudah ada di school admin
        // atau bisa ganti ke endpoint khusus jika tersedia
        const res = await fetch("/api/student/teachers");
        const json = await res.json();
        if (json.success) setTeachers(json.data);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchTeachers();
    }
  }, [session?.user?.id]);

  const filteredData = teachers.filter(
    (t) =>
      t.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.subject || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-slate-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/student/chat"
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
            >
              <ArrowLeft size={20} />
            </Link>
            <span className="text-[10px] font-black text-[#00adb5] uppercase tracking-[0.2em]">
              Chat dengan Guru
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Pilih Guru
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic text-sm">
            Tanyakan langsung kepada guru di sekolahmu kapan pun kamu butuh
            bantuan.
          </p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-[30px] border border-slate-200 shadow-sm">
        <div className="flex-1 flex items-center bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 focus-within:border-[#00adb5]/30 transition-all">
          <Search size={18} className="text-slate-300 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari nama guru..."
            className="bg-transparent outline-none text-sm w-full font-semibold placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TEACHER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2
              className="animate-spin mx-auto text-[#00adb5] mb-4"
              size={40}
            />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Memuat daftar guru...
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[40px] text-slate-400 font-medium">
            Tidak ada guru yang ditemukan.
          </div>
        ) : (
          filteredData.map((teacher) => {
            const isOnline = teacher.is_online === true;

            return (
              <div
                key={teacher._id}
                className="bg-white rounded-[40px] border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden"
              >
                

                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-[32px] bg-[#00adb5] flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-[#00adb5]/20 border-4 border-white transition-transform group-hover:scale-105">
                      {teacher.fullname.charAt(0)}
                    </div>
                    {/* Ikon buku sebagai penanda guru */}
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-sm">
                      <BookOpen size={16} className="text-[#00adb5]" />
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-lg font-black text-slate-800 group-hover:text-[#00adb5] transition-colors leading-tight">
                      {teacher.fullname}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                      {teacher.subject || teacher.work_at || "Guru"}
                    </p>
                  </div>


                  {/* CTA Button */}
                  <div className="w-full pt-4">
                    <Link
                      href={`/dashboard/student/chat/teacher/${teacher._id}`}
                      className="w-full py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest 
             flex items-center justify-center gap-2 transition-all shadow-sm
             bg-[#00adb5] text-white shadow-[#00adb5]/20 hover:scale-[1.02] active:scale-95"
                    >
                      <MessageCircle size={16} />
                      Mulai Chat
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="bg-slate-900 text-white p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 text-center md:text-left">
          <h4 className="font-bold text-lg">Chat Langsung dengan Gurumu</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md font-medium leading-relaxed">
            Tanyakan soal pelajaran, tugas, atau apapun yang kamu butuhkan. Guru
            siap membantu kamu berkembang.
          </p>
        </div>
      
      </div>
    </div>
  );
}
