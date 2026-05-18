"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  PlayCircle,
  Calendar,
  Bookmark,
  Share2,
  Sparkles,
  Loader2,
  Clock,
  ChevronLeft
} from "lucide-react";

export default function ParentArticleDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-slate-400 font-medium animate-pulse">Menyiapkan bacaan...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white border border-slate-100 rounded-[40px] p-12 text-center shadow-xl shadow-slate-200/50">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen size={40} className="text-slate-200" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-3">Konten Hilang</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Maaf, artikel yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
        </p>
        <button
          onClick={() => router.back()}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-primary transition-all shadow-lg shadow-slate-900/10"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const isVideo = article.type?.toLowerCase() === "video";

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* NAVIGATION & ACTIONS BAR */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 text-sm font-bold text-slate-600 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Kembali
        </button>
      </div>

      <article className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
        
        {/* HERO IMAGE / COVER */}
        <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden bg-slate-900 group">
          <div className="absolute inset-0 opacity-40 bg-gradient-to-b from-transparent to-slate-900"></div>
          
          {/* Mock Visual Placeholder (Bisa diganti <img> asli) */}
          <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${article.thumbnail_color === 'secondary' ? 'from-amber-400 to-orange-500' : 'from-indigo-500 to-primary'} opacity-20`}></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            {isVideo ? (
              <button className="relative group/play">
                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <PlayCircle size={100} className="text-white relative z-10 transition-transform group-hover/play:scale-110 duration-500" />
              </button>
            ) : (
              <BookOpen size={100} className="text-white/20" />
            )}
          </div>

          {/* Floating Category Badge */}
          <div className="absolute bottom-8 left-8 md:left-12 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={14} className="text-secondary" />
            {article.category || "Insight"}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="px-8 md:px-16 py-12 md:py-16">
          
          {/* HEADER INFO */}
          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2">
                <Calendar size={14} />
                {article.createdAt ? new Date(article.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "Mei 2026"}
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="flex items-center gap-2">
                <Clock size={14} />
                5 Menit Baca
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
              {article.title}
            </h1>

            <p className="text-xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6">
              {article.description || "Panduan mendalam untuk membantu Anda menavigasi perjalanan parenting dengan lebih bijak."}
            </p>
          </div>

          {/* RICH TEXT CONTENT */}
          <div className="prose prose-slate prose-lg max-w-none">
            <div className="text-slate-700 leading-[1.8] text-lg space-y-8 font-medium">
              {/* Jika article.content adalah HTML string, gunakan dangerouslySetInnerHTML */}
              {article.content ? (
                 <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <>
                  <p>
                    Menjadi orang tua di era digital bukan sekadar memberikan fasilitas, namun tentang membangun 
                    koneksi emosional yang kuat. Tantangan yang dihadapi anak-anak saat ini jauh lebih kompleks 
                    dibandingkan generasi sebelumnya.
                  </p>
                  
                  <h3 className="text-2xl font-black text-slate-800 mt-12 mb-4">
                    Pentingnya Komunikasi Empati
                  </h3>
                  
                  <p>
                    Salah satu kunci utama dalam parenting yang sukses adalah <strong>mendengarkan tanpa menghakimi</strong>. 
                    Terkadang, anak hanya butuh didengar, bukan langsung diberikan solusi. Dengan memberikan ruang aman 
                    untuk berekspresi, kita membangun fondasi kepercayaan yang akan bertahan hingga mereka dewasa.
                  </p>

                  <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 my-10">
                    <h4 className="text-primary font-black text-xs uppercase mb-3 tracking-widest flex items-center gap-2">
                      <Sparkles size={16} /> Insight Utama
                    </h4>
                    <p className="text-slate-800 font-bold text-lg leading-relaxed">
                      "Anak-anak tidak akan mengingat hadiah apa yang Anda berikan, tapi mereka akan selalu 
                      mengingat bagaimana perasaan mereka saat berada di dekat Anda."
                    </p>
                  </div>

                  <p>
                    Selain itu, menjaga konsistensi antara ucapan dan tindakan adalah hal yang krusial. Orang tua 
                    adalah model peran pertama dan utama bagi anak. Jika kita ingin mereka tumbuh menjadi pribadi 
                    yang jujur dan disiplin, maka kita harus mencontohkan nilai-nilai tersebut dalam keseharian.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                E
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Penulis</p>
                <p className="text-sm font-bold text-slate-800">Tim Edukasi Eduverse</p>
              </div>
            </div>
          </div>

        </div>
      </article>
    </div>
  );
}