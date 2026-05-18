"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  PlayCircle,
  Search,
  Filter,
  Bookmark,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function ParentInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch("/api/parent/articles", {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success) {
          setResources(data.articles || []);
        }
      } catch (error) {
        console.error("FETCH ARTICLES ERROR:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Fungsi Filter Search
  const filteredResources = useMemo(() => {
    return resources.filter((res) =>
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, resources]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-slate-400 font-medium animate-pulse">Memuat wawasan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Sparkles size={16} /> Knowledge Center
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Wawasan Parenting
          </h2>
          <p className="text-slate-500 font-medium text-base max-w-lg">
            Temukan panduan eksklusif dan tips praktis untuk mendukung tumbuh kembang buah hati Anda.
          </p>
        </div>

        {/* SEARCH BAR FUNCTIONAL */}
        <div className="relative group w-full lg:max-w-md">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari topik atau judul artikel..."
            className="w-full bg-white pl-12 pr-5 py-4 rounded-[24px] shadow-sm border border-slate-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700"
          />
        </div>
      </div>

      {/* SUB-HEADER & FILTER */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
          {searchQuery ? `Hasil Pencarian (${filteredResources.length})` : "Rekomendasi Terkini"}
        </h4>
      </div>

      {/* ARTICLES GRID - 3 COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredResources.length > 0 ? (
          filteredResources.map((res, i) => {
            const isVideo = res.type?.toLowerCase() === "video";
            
            return (
              <Link
                href={`/dashboard/parent/insights/${res._id}`}
                key={res._id || i}
                className="group bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden flex flex-col active:scale-[0.98]"
              >
                {/* THUMBNAIL AREA */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <div className={`absolute inset-0 opacity-20 bg-primary`} />
                  <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                    {isVideo ? (
                      <div className="relative">
                        <PlayCircle size={56} className="text-primary relative z-10" />
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150"></div>
                      </div>
                    ) : (
                      <BookOpen size={56} className="text-primary/40" />
                    )}
                  </div>
                  
                  {/* Badge Type */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-sm">
                    {res.type || "Article"}
                  </div>
                </div>

                {/* CONTENT AREA */}
                <div className="p-7 flex-1 flex flex-col">
                  <div className="flex-1 space-y-3">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                      {res.category || "Parenting"}
                    </span>
                    <h3 className="font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors text-lg line-clamp-2">
                      {res.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 font-medium leading-relaxed">
                      {res.excerpt || "Klik untuk membaca panduan selengkapnya mengenai topik ini."}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs group-hover:gap-3 transition-all">
                      Baca Sekarang <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-300">
              <Search size={32} />
            </div>
            <div>
              <p className="text-slate-800 font-bold text-lg">Topik tidak ditemukan</p>
              <p className="text-slate-400 text-sm">Coba gunakan kata kunci lain atau bersihkan pencarian.</p>
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-primary font-bold text-sm underline"
              >
                Hapus Pencarian
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}