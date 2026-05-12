"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  Sparkles,
  Loader2,
  Eye,
  CalendarDays,
  BookOpen,
  PenSquare,
} from "lucide-react";

export default function DetailArticlePage() {
  const params = useParams();
  const router = useRouter();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);


  const fetchArticle = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/articles/${params.id}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error("Gagal mengambil artikel");
      }

      const data = await res.json();

      if (data.success) {
        setArticle(data.data);
      }
    } catch (error) {
      console.error(error);

      alert("Gagal mengambil detail artikel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchArticle();
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">

          <Loader2
            className="animate-spin text-primary"
            size={40}
          />

          <p className="font-bold text-slate-500">
            Memuat artikel...
          </p>

        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">

          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Artikel tidak ditemukan
          </h2>

          <p className="text-slate-500 mb-6">
            Artikel yang Anda cari tidak tersedia
          </p>

          <button
            onClick={() =>
              router.push("/dashboard/admin/articles")
            }
            className="h-12 px-6 rounded-2xl bg-primary text-white font-bold"
          >
            Kembali
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">

      <div className="max-w-5xl mx-auto space-y-8">

        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div className="flex items-center gap-4">

            {/* BACK */}
            <button
              onClick={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                Detail Artikel
              </h1>

              <p className="text-slate-500 mt-1">
                Preview lengkap artikel parenting
              </p>
            </div>

          </div>

          {/* EDIT BUTTON */}
          <button
            onClick={() =>
              router.push(
                `/dashboard/admin/articles/${article._id}/edit`
              )
            }
            className="h-14 px-6 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
          >
            <PenSquare size={16} />

            Edit Artikel
          </button>

        </div>

        {/* ARTICLE */}
        <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">

          {/* HERO */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 px-8 py-20 md:px-16 md:py-24">

            {/* STATUS */}
            <div
              className={`absolute top-6 right-6 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-black ${
                article.status === "Published"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {article.status}
            </div>

            {/* TITLE */}
            <div className="max-w-4xl mx-auto text-center">

              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                {article.title}
              </h1>

              {/* META */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">

                {/* CATEGORY */}
                <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
                  {article.category}
                </div>

                {/* TYPE */}
                <div className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2">

                  <BookOpen size={12} />

                  {article.type}

                </div>

                {/* VIEWS */}
                <div className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center gap-2">

                  <Eye size={12} />

                  {(article.views || 0).toLocaleString()} Views

                </div>

                {/* DATE */}
                <div className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center gap-2">

                  <CalendarDays size={12} />

                  {article.createdAt
                    ? new Date(
                        article.createdAt
                      ).toLocaleDateString("id-ID")
                    : "-"}

                </div>

              </div>

            </div>

          </div>

          {/* CONTENT */}
          <div className="p-8 md:p-12">

            {/* DESCRIPTION */}
            {article.description && (
              <div className="mb-12">

                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-5">
                  Deskripsi
                </h2>

                <div className="text-xl text-slate-500 leading-relaxed font-medium">
                  {article.description}
                </div>

              </div>
            )}

            {/* BODY */}
            <div>

              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-5">
                Isi Artikel
              </h2>

              <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}