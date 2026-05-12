"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function CreateArticlePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "Parenting",
    type: "Artikel",
    status: "Draft",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Gagal membuat artikel");
      }

      const data = await res.json();

      if (data.success) {
        alert("Artikel berhasil dibuat");

        router.push("/dashboard/admin/articles");
      }
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan saat membuat artikel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">

      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <button
              onClick={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-4xl font-black text-slate-900">
                Tambah Artikel
              </h1>

              <p className="text-slate-500 mt-1">
                Buat artikel parenting baru
              </p>
            </div>

          </div>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden"
        >

          <div className="p-8 md:p-10 space-y-8">

            {/* TITLE */}
            <div className="space-y-3">

              <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                Judul Artikel
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
                placeholder="Masukkan judul artikel..."
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
                placeholder="Deskripsi singkat artikel..."
                className="w-full rounded-2xl border border-slate-200 p-5 outline-none focus:border-primary"
              />

            </div>

            {/* CONTENT */}
            <div className="space-y-3">

              <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                Isi Artikel
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
                placeholder="Tulis isi artikel..."
                className="w-full rounded-2xl border border-slate-200 p-5 outline-none focus:border-primary"
              />

            </div>

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

              {/* TYPE */}
              <div className="space-y-3">

                <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                  Tipe Konten
                </label>

                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                    })
                  }
                  className="w-full h-14 rounded-2xl border border-slate-200 px-5 outline-none"
                >
                  <option value="Artikel">
                    Artikel
                  </option>

                  <option value="Panduan">
                    Panduan
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
          <div className="border-t border-slate-100 p-6 flex justify-end">

            <button
              type="submit"
              disabled={loading}
              className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 disabled:opacity-50"
            >

              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />

                  Simpan Artikel
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}