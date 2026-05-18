"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  PenSquare,
  Trash2,
  Eye,
  BookOpen,
  Video,
  FileText,
  Clock3,
  LayoutDashboard,
  TrendingUp,
  Loader2,
} from "lucide-react";
import AdminPagination from "@/components/AdminPagination";
import CustomSelect from "@/components/CustomSelect";
import { fetchInstance } from "@/lib/fetchInstance";
import { useDebounce } from "@/hooks/useDebounce";

const statusOptions = [
  { value: "Semua", label: "Semua" },
  { value: "Published", label: "Published" },
  { value: "Draft", label: "Draft" },
];

export default function ParentArticleManagement() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);
  const pageSize = 10;

  const fetchArticles = async ({ page = 1, searchKeyword = "", status = "Semua" } = {}) => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search: searchKeyword,
        status,
      });

      const data = await fetchInstance(`/api/admin/articles?${queryParams.toString()}`);
      setArticles(data.data || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await fetchInstance("/api/admin/articles/summary");
      setSummary(data.summary || null);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchArticles({ page: 1, searchKeyword: debouncedSearch, status: statusFilter });
  }, [debouncedSearch, statusFilter]);

  const handlePageChange = (page) => {
    if (page < 1 || page > (pagination?.totalPages || 1) || page === currentPage) return;
    setCurrentPage(page);
    fetchArticles({ page, searchKeyword: debouncedSearch, status: statusFilter });
  };

  const stats = {
    total: summary?.total || 0,
    published: summary?.published || 0,
    drafts: summary?.drafts || 0,
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm(
      "Apakah Anda yakin ingin menghapus artikel ini?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `/api/admin/articles/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        fetchArticles({ page: currentPage, searchKeyword: debouncedSearch, status: statusFilter });
        fetchSummary();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (article) => {
    try {
      const newStatus =
        article.status === "Published"
          ? "Draft"
          : "Published";

      const res = await fetch(
        `/api/admin/articles/${article._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        fetchArticles({ page: currentPage, searchKeyword: debouncedSearch, status: statusFilter });
        fetchSummary();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Video":
        return <Video size={14} />;

      case "Panduan":
        return <FileText size={14} />;

      default:
        return <BookOpen size={14} />;
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

          <div>
            <div className="flex items-center gap-3 mb-3">

              <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/10">
                <LayoutDashboard
                  className="text-primary"
                  size={28}
                />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  Management Konten
                </h1>

                <p className="text-slate-500 font-medium text-sm mt-1">
                  Kelola artikel, video edukasi, dan insight parenting berbasis AI.
                </p>
              </div>

            </div>
          </div>

          <button
            onClick={() =>
              router.push(
                "/dashboard/admin/articles/create"
              )
            }
            className="h-14 px-6 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            <Plus size={18} />

            Tambah Konten
          </button>

        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          {/* TOTAL */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
            <div className="flex justify-between items-start">

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2">
                  Total Konten
                </p>

                <h2 className="text-4xl font-black text-slate-900">
                  {stats.total}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <BookOpen
                  className="text-primary"
                  size={20}
                />
              </div>

            </div>
          </div>

          {/* PUBLISHED */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
            <div className="flex justify-between items-start">

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2">
                  Published
                </p>

                <h2 className="text-4xl font-black text-slate-900">
                  {stats.published}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp
                  className="text-emerald-600"
                  size={20}
                />
              </div>

            </div>
          </div>

          {/* DRAFT */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
            <div className="flex justify-between items-start">

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2">
                  Draft
                </p>

                <h2 className="text-4xl font-black text-slate-900">
                  {stats.drafts}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Clock3
                  className="text-amber-600"
                  size={20}
                />
              </div>

            </div>
          </div>

        </div>

        {/* FILTER */}
        <div className="bg-white border border-slate-100 rounded-[36px] p-5 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center justify-between">

          <div className="flex flex-col md:flex-row gap-4 flex-1">

            {/* SEARCH */}
            <div className="flex items-center bg-slate-50 rounded-2xl px-4 h-14 border border-slate-100 flex-1">

              <Search
                size={18}
                className="text-slate-400 mr-3"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                type="text"
                placeholder="Cari artikel parenting..."
                className="bg-transparent outline-none w-full text-sm font-semibold text-slate-700"
              />

            </div>

            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="Pilih Status"
              className="md:w-56"
              triggerClassName="h-14"
            />

          </div>

        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">

          <div className="hidden md:block overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">

                  <th className="text-left px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Judul Konten
                  </th>

                  <th className="text-left px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Tipe
                  </th>

                  <th className="text-left px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Kategori
                  </th>

                  <th className="text-left px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Status
                  </th>

                  <th className="text-left px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Dibuat
                  </th>

                  <th className="text-center px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Aksi
                  </th>

                </tr>
              </thead>

              <tbody>

                {articles.map((article) => (
                  <tr
                    key={article._id}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-all"
                  >

                    {/* TITLE */}
                    <td className="px-8 py-6">

                      <div className="flex items-start gap-4">

                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen
                            className="text-primary"
                            size={22}
                          />
                        </div>

                        <div className="space-y-2">

                          <div className="flex items-center gap-2 flex-wrap">

                            <h3 className="font-bold text-slate-900 leading-snug max-w-md">
                              {article.title}
                            </h3>

                          </div>

                        </div>

                      </div>

                    </td>

                    {/* TYPE */}
                    <td className="px-6 py-6">

                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">

                        {getTypeIcon(article.type)}

                        {article.type}

                      </div>

                    </td>

                    {/* CATEGORY */}
                    <td className="px-6 py-6">

                      <span className="text-sm font-bold text-slate-700">
                        {article.category}
                      </span>

                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-6">

                      <button
                        onClick={() =>
                          handleToggleStatus(article)
                        }
                        className={`inline-flex items-center px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${article.status === "Published"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {article.status}
                      </button>

                    </td>

                    {/* DATE */}
                    <td className="px-6 py-6">

                      <span className="text-sm font-semibold text-slate-500">

                        {article.createdAt
                          ? new Date(
                            article.createdAt
                          ).toLocaleDateString("id-ID")
                          : "-"}

                      </span>

                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-6">

                      <div className="flex items-center justify-center gap-2">
                        {/* VIEW */}
                        {article.type !== "Webinar" && (
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/articles/${article._id}`
                              )
                            }
                            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-primary hover:text-white transition-all flex items-center justify-center text-slate-600"
                          >
                            <Eye size={16} />
                          </button>
                        )}

                        {/* EDIT */}
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/admin/articles/${article._id}/edit`
                            )
                          }
                          className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-secondary hover:text-slate-900 transition-all flex items-center justify-center text-slate-600"
                        >
                          <PenSquare size={16} />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() =>
                            handleDelete(article._id)
                          }
                          className="w-11 h-11 rounded-2xl bg-red-50 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

                {/* EMPTY */}
                {articles.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-20 text-slate-400 font-semibold"
                    >
                      Tidak ada artikel ditemukan
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          <div className="md:hidden p-4 space-y-4 max-h-[650px] overflow-y-auto">
            {articles.length > 0 ? (
              articles.map((article) => (
                <div
                  key={article._id}
                  className="bg-slate-50 rounded-[28px] p-5 border border-slate-100"
                >
                  <div className="flex justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-slate-800 text-sm line-clamp-2 break-words">
                        {article.title || "-"}
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold mt-1 truncate">
                        {article.createdAt
                          ? new Date(article.createdAt).toLocaleDateString("id-ID")
                          : "-"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(article)}
                      className={`h-fit shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide ${article.status === "Published"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {article.status}
                    </button>
                  </div>

                  <div className="mt-5 space-y-2">
                    <p className="text-sm font-bold text-slate-700">
                      {article.category || "-"}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-600 text-xs font-bold">
                      {getTypeIcon(article.type)}
                      {article.type || "-"}
                    </div>
                  </div>

                  <div className={`mt-5 grid gap-2 ${article.type === "Webinar"? "grid-cols-2": "grid-cols-3"}`}>
                    {article.type !== "Webinar" && (
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/admin/articles/${article._id}`
                          )
                        }
                        className="py-3 rounded-2xl bg-white border border-slate-100 text-xs font-black uppercase tracking-widest text-primary"
                      >
                        Lihat
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/dashboard/admin/articles/${article._id}/edit`)}
                      className="py-3 rounded-2xl bg-white border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article._id)}
                      className="py-3 rounded-2xl bg-red-50 border border-red-100 text-xs font-black uppercase tracking-widest text-red-500"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-400 font-semibold">
                Tidak ada artikel ditemukan
              </div>
            )}
          </div>

          <AdminPagination
            currentPage={currentPage}
            pagination={pagination}
            onPageChange={handlePageChange}
          />

        </div>

      </div>
    </div>
  );
}
