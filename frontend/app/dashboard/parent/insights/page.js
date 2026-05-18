"use client";

import React, {
  useEffect,
  useState,
  useMemo,
} from "react";

import Link from "next/link";

import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  Loader2,
  Video,
  Calendar,
  User2,
  PlayCircle,
} from "lucide-react";

export default function ParentInsightsPage() {
  const [loading, setLoading] =
    useState(true);

  const [resources, setResources] =
    useState([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("articles");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(
          "/api/parent/articles",
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (data.success) {
          setResources(
            data.articles || []
          );
        }
      } catch (error) {
        console.error(
          "FETCH ARTICLES ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // articles & panduan only
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchSearch =
        res.title
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        res.category
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const isNotWebinar =
        res.type !== "Webinar";

      return (
        matchSearch && isNotWebinar
      );
    });
  }, [searchQuery, resources]);

  // webinar dynamic
  const webinars = useMemo(() => {
    return resources.filter(
      (res) =>
        res.type === "Webinar"
    );
  }, [resources]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">

        <Loader2
          className="animate-spin text-primary"
          size={40}
        />

        <p className="text-slate-400 font-medium animate-pulse">
          Memuat ekosistem parenting...
        </p>

      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-100 pb-8">

        <div className="space-y-2">

          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">

            <Sparkles size={16} />

            Parent Access & Insight

          </div>

          <h2 className="text-4xl font-black text-slate-800 tracking-tight">
            Pusat Edukasi Orang Tua
          </h2>

          <p className="text-slate-500 font-medium text-base max-w-xl">
            Ruang edukasi parenting,
            webinar pakar, dan insight
            perkembangan digital anak.
          </p>

        </div>

        {/* TAB */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 self-start lg:self-auto">

          <button
            onClick={() =>
              setActiveTab(
                "articles"
              )
            }
            className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab ===
              "articles"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Materi & Panduan
          </button>

          <button
            onClick={() =>
              setActiveTab(
                "webinars"
              )
            }
            className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab ===
              "webinars"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Webinar Bulanan
          </button>

        </div>

      </div>

      {/* ARTICLES */}
      {activeTab ===
        "articles" && (
        <div className="space-y-8 animate-in fade-in duration-300">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">

              {searchQuery
                ? `Hasil Pencarian (${filteredResources.length})`
                : "Materi & Panduan Tersedia"}

            </h4>

            {/* SEARCH */}
            <div className="relative group w-full md:max-w-xs">

              <Search
                size={16}
                className="absolute left-4 top-3.5 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                placeholder="Cari materi..."
                className="w-full bg-white pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-primary transition-all font-medium"
              />

            </div>

          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {filteredResources.length >
            0 ? (
              filteredResources.map(
                (res, i) => {
                  const isGuide =
                    res.type ===
                    "Panduan";

                  return (
                    <Link
                      href={`/dashboard/parent/insights/${res._id}`}
                      key={
                        res._id || i
                      }
                      className="group bg-white rounded-[32px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500 overflow-hidden flex flex-col"
                    >

                    <div className="relative h-48 overflow-hidden bg-slate-50 flex items-center justify-center">
                      <BookOpen size={48} className="text-primary/40" />

                      <div className="absolute top-4 left-4 px-2.5 py-1 bg-white/90 rounded-full text-[9px] font-black uppercase tracking-wider text-slate-700 shadow-sm border border-slate-100">
                        {res.type || "Artikel"}
                      </div>
                    </div>

                      {/* CONTENT */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">

                        <div className="space-y-2">

                          <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest block">

                            {res.category ||
                              "Parenting"}

                          </span>

                          <h3 className="font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors text-base line-clamp-2">

                            {res.title}

                          </h3>

                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-50 text-xs font-bold text-primary">

                          Baca Sekarang

                          <ArrowRight
                            size={14}
                          />

                        </div>

                      </div>

                    </Link>
                  );
                }
              )
            ) : (
              <div className="col-span-full py-16 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-center text-slate-400 font-medium text-sm">

                Materi edukasi tidak
                ditemukan.

              </div>
            )}

          </div>

        </div>
      )}

      {/* WEBINARS */}
      {activeTab ===
        "webinars" && (
        <div className="space-y-8 animate-in fade-in duration-300">

          {webinars.length >
          0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {webinars.map(
                (web) => {
                  const webinarDate =
                    web.webinarDate
                      ? new Date(
                          web.webinarDate
                        )
                      : null;

                  const isUpcoming =
                    webinarDate >
                    new Date();

                  return (
                    <div
                      key={
                        web._id
                      }
                      className="bg-white border border-slate-100 p-8 rounded-[36px] shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden"
                    >

                      <div className="space-y-5">

                        {/* STATUS */}
                        <div className="flex justify-between items-center">

                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isUpcoming
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >

                            {isUpcoming
                              ? "Upcoming Webinar"
                              : "Webinar Selesai"}

                          </span>

                        </div>

                        {/* TITLE */}
                        <h3 className="text-xl font-black text-slate-800 leading-snug">

                          {web.title}

                        </h3>

                        {/* INFO */}
                        <div className="bg-slate-50 rounded-2xl p-5 space-y-4">

                          {/* speaker */}
                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">

                              <User2
                                size={
                                  18
                                }
                                className="text-primary"
                              />

                            </div>

                            <div>

                              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                                Narasumber
                              </p>

                              <p className="text-sm font-bold text-slate-700">

                                {web.speaker ||
                                  "-"}

                              </p>

                            </div>

                          </div>

                          {/* date */}
                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">

                              <Calendar
                                size={
                                  18
                                }
                                className="text-primary"
                              />

                            </div>

                            <div>

                              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                                Jadwal Webinar
                              </p>

                              <p className="text-sm font-bold text-slate-700">

                                {webinarDate
                                  ? webinarDate.toLocaleString(
                                      "id-ID",
                                      {
                                        dateStyle:
                                          "full",
                                        timeStyle:
                                          "short",
                                      }
                                    )
                                  : "-"}

                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                      {/* BUTTON */}
                      {web.webinarLink ? (
                        <a
                          href={
                            web.webinarLink
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                            isUpcoming
                              ? "bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90"
                              : "bg-slate-900 text-white hover:bg-primary"
                          }`}
                        >

                          <Video
                            size={16}
                          />

                          {isUpcoming
                            ? "Gabung Webinar"
                            : "Lihat Webinar"}

                        </a>
                      ) : (
                        <button
                          disabled
                          className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-100 text-slate-400 cursor-not-allowed"
                        >
                          Link Webinar Tidak
                          Tersedia
                        </button>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          ) : (
            <div className="py-20 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-center">

              <Video
                size={48}
                className="mx-auto text-slate-300 mb-4"
              />

              <h3 className="text-lg font-black text-slate-700">
                Belum Ada Webinar
              </h3>

              <p className="text-slate-400 text-sm mt-2">
                Webinar parenting akan
                tampil di sini.
              </p>

            </div>
          )}

        </div>
      )}

    </div>
  );
}