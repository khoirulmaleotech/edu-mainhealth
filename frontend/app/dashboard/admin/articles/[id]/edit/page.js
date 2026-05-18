"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  BookOpen,
  Video,
  Link as LinkIcon,
  CalendarDays,
  User2,
} from "lucide-react";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "Parenting",
    type: "Artikel",
    status: "Draft",

    // webinar fields
    webinarLink: "",
    speaker: "",
    webinarDate: "",
  });

  const isWebinar = formData.type === "Webinar";

  const contentTypes = [
    {
      label: "Artikel",
      icon: FileText,
      desc: "Konten edukasi & insight",
    },
    {
      label: "Panduan",
      icon: BookOpen,
      desc: "Panduan praktis parenting",
    },
    {
      label: "Webinar",
      icon: Video,
      desc: "Sesi webinar bersama narasumber",
    },
  ];

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
        throw new Error("Gagal mengambil detail artikel");
      }

      const data = await res.json();

      if (data.success) {
        setFormData({
          title: data.data.title || "",
          description: data.data.description || "",
          content: data.data.content || "",
          category: data.data.category || "Parenting",
          type: data.data.type || "Artikel",
          status: data.data.status || "Draft",

          webinarLink: data.data.webinarLink || "",
          speaker: data.data.speaker || "",
          webinarDate: data.data.webinarDate || "",
        });
      }
    } catch (error) {
      console.error(error);

      alert("Gagal mengambil data artikel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchArticle();
    }
  }, [params?.id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await fetch(
        `/api/admin/articles/${params.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        throw new Error("Gagal memperbarui konten");
      }

      const data = await res.json();

      if (data.success) {
        alert("Konten berhasil diperbarui");

        router.push("/dashboard/admin/articles");
      }
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan saat update konten");
    } finally {
      setSaving(false);
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
            Memuat konten...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">

      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-4xl font-black text-slate-900">
              Edit Konten
            </h1>

            <p className="text-slate-500 mt-1">
              Perbarui artikel, panduan, atau webinar
            </p>
          </div>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleUpdate}
          className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden"
        >

          <div className="p-8 md:p-10 space-y-10">

            {/* CONTENT TYPE */}
            <div className="space-y-4">

              <div>
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                  Tipe Konten
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Pilih jenis konten
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {contentTypes.map((item) => {
                  const Icon = item.icon;
                  const active = formData.type === item.label;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: item.label,
                        })
                      }
                      className={`rounded-3xl border p-5 text-left transition-all ${
                        active
                          ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                          : "border-slate-200 bg-white hover:border-primary/40"
                      }`}
                    >

                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                          active
                            ? "bg-white/20"
                            : "bg-slate-100"
                        }`}
                      >
                        <Icon size={22} />
                      </div>

                      <h3 className="font-black text-lg">
                        {item.label}
                      </h3>

                      <p
                        className={`text-sm mt-1 ${
                          active
                            ? "text-white/80"
                            : "text-slate-500"
                        }`}
                      >
                        {item.desc}
                      </p>

                    </button>
                  );
                })}

              </div>

            </div>

            {/* TITLE */}
            <div className="space-y-3">

              <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                Judul Konten
              </label>

              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
                placeholder="Masukkan judul konten..."
                className="w-full h-16 rounded-2xl border border-slate-200 px-5 text-lg font-bold outline-none focus:border-primary"
              />

            </div>

            {/* DESCRIPTION */}
            <div className="space-y-3">

              <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                Deskripsi
              </label>

              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Deskripsi singkat..."
                className="w-full rounded-2xl border border-slate-200 p-5 outline-none focus:border-primary"
              />

            </div>

            {/* CONTENT */}
            <div className="space-y-3">

              <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                Isi Konten
              </label>

              <textarea
                required
                rows={14}
                value={formData.content}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: e.target.value,
                  })
                }
                placeholder={
                  isWebinar
                    ? "Tulis detail webinar..."
                    : "Tulis isi konten..."
                }
                className="w-full rounded-2xl border border-slate-200 p-5 outline-none focus:border-primary"
              />

            </div>

            {/* WEBINAR SECTION */}
            {isWebinar && (
              <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-6 md:p-8 space-y-6">

                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Informasi Webinar
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Perbarui detail webinar
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* SPEAKER */}
                  <div className="space-y-3">

                    <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                      Narasumber
                    </label>

                    <div className="relative">

                      <User2
                        size={18}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        required={isWebinar}
                        value={formData.speaker}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            speaker: e.target.value,
                          })
                        }
                        placeholder="Nama narasumber"
                        className="w-full h-14 rounded-2xl border border-slate-200 pl-14 pr-5 outline-none focus:border-primary"
                      />

                    </div>

                  </div>

                  {/* DATE */}
                  <div className="space-y-3">

                    <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                      Tanggal Webinar
                    </label>

                    <div className="relative">

                      <CalendarDays
                        size={18}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="datetime-local"
                        required={isWebinar}
                        value={formData.webinarDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            webinarDate: e.target.value,
                          })
                        }
                        className="w-full h-14 rounded-2xl border border-slate-200 pl-14 pr-5 outline-none focus:border-primary"
                      />

                    </div>

                  </div>

                  {/* LINK */}
                  <div className="space-y-3 md:col-span-2">

                    <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                      Link Zoom / Meeting
                    </label>

                    <div className="relative">

                      <LinkIcon
                        size={18}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="url"
                        required={isWebinar}
                        value={formData.webinarLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            webinarLink: e.target.value,
                          })
                        }
                        placeholder="https://zoom.us/..."
                        className="w-full h-14 rounded-2xl border border-slate-200 pl-14 pr-5 outline-none focus:border-primary"
                      />

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* CATEGORY */}
              <div className="space-y-3">

                <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                  Kategori
                </label>

                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                    })
                  }
                  className="w-full h-14 rounded-2xl border border-slate-200 px-5 outline-none"
                >
                  <option value="Parenting">
                    Parenting
                  </option>

                  <option value="Safety">
                    Safety
                  </option>

                  <option value="Karir">
                    Karir
                  </option>

                  <option value="Kesehatan Mental">
                    Kesehatan Mental
                  </option>

                </select>

              </div>

              {/* STATUS */}
              <div className="space-y-3">

                <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                  Status
                </label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                  className="w-full h-14 rounded-2xl border border-slate-200 px-5 outline-none"
                >
                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Published">
                    Published
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-100 bg-slate-50/80 p-6 flex justify-end">

            <button
              type="submit"
              disabled={saving}
              className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 disabled:opacity-50 hover:scale-[1.02] transition"
            >

              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Mengupdate...
                </>
              ) : (
                <>
                  <Save size={18} />

                  Update Konten
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}