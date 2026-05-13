"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Clock3,
  BookOpen,
  PlayCircle,
  Calendar,
  Bookmark,
  Share2,
  Sparkles,
} from "lucide-react";

export default function ParentArticleDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/parent/articles/${params.id}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success) {
          setArticle(data.article);
        }
      } catch (error) {
        console.error("DETAIL ARTICLE ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="bg-white border border-slate-100 rounded-[40px] p-16 text-center shadow-sm">
        <h2 className="text-2xl font-black text-slate-800 mb-3">
          Artikel Tidak Ditemukan
        </h2>

        <p className="text-slate-500 text-sm mb-8">
          Artikel yang Anda cari mungkin telah dihapus atau tidak tersedia.
        </p>

        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:scale-[1.02] transition-transform"
        >
          Kembali
        </button>
      </div>
    );
  }

  const bgColor =
    article.thumbnail_color === "primary"
      ? "bg-primary/10"
      : article.thumbnail_color === "secondary"
      ? "bg-secondary/10"
      : "bg-slate-100";

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      {/* HERO */}
      <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">

        {/* IMAGE AREA */}
        <div
          className={`h-[320px] ${bgColor} flex items-center justify-center relative overflow-hidden`}
        >
          {article.type === "Video" ? (
            <PlayCircle
              size={90}
              className="text-primary opacity-30"
            />
          ) : (
            <BookOpen
              size={90}
              className="text-secondary opacity-30"
            />
          )}


          <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-white/20 rounded-full blur-3xl"></div>
        </div>

        {/* CONTENT */}
        <div className="p-10 md:p-14 space-y-8">

          {/* CATEGORY */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
              {article.category || "Parenting"}
            </span>

            <span className="text-slate-300">•</span>

            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {article.type || "Artikel"}
            </span>
          </div>

          {/* TITLE */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {article.title}
            </h1>

            <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium max-w-3xl">
              {article.description ||
                "Panduan dan wawasan parenting untuk membantu orang tua mendampingi pertumbuhan anak secara lebih positif dan efektif."}
            </p>
          </div>

          {/* META */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">

            <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-wide">

              <span className="flex items-center gap-2">
                <Calendar size={14} />
                {article.createdAt
                  ? new Date(article.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Hari Ini"}
              </span>
            </div>

            <div className="flex items-center gap-3">

              <button className="w-11 h-11 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all">
                <Bookmark size={18} />
              </button>

              <button className="w-11 h-11 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* ARTICLE CONTENT */}
          <div className="prose prose-slate max-w-none pt-6 border-t border-slate-100">

            <div className="space-y-6 text-slate-700 leading-relaxed text-[15px]">

              <p>
                {article.content ||
                  "Mendampingi anak di era modern membutuhkan komunikasi yang sehat, empati, dan kemampuan mendengarkan secara aktif. Orang tua memiliki peran penting dalam membantu anak menghadapi tekanan akademik, sosial, dan emosional."}
              </p>

              <p>
                Salah satu pendekatan yang efektif adalah memberikan ruang kepada anak untuk berbicara tanpa takut dihakimi. Ketika anak merasa aman secara emosional, mereka akan lebih terbuka dalam menyampaikan perasaan dan kesulitannya.
              </p>

              <p>
                Selain itu, penting bagi orang tua untuk menjaga keseimbangan antara dukungan dan kemandirian. Anak tetap membutuhkan arahan, tetapi juga perlu belajar mengambil keputusan sendiri agar tumbuh menjadi pribadi yang percaya diri.
              </p>

              <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-8 mt-10">

                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="text-primary" size={20} />

                  <h3 className="font-black text-slate-900 text-lg tracking-tight">
                    Insight Parenting
                  </h3>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                  “Anak yang merasa didengar akan lebih mudah membangun rasa percaya diri dan keterbukaan dengan orang tua.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
