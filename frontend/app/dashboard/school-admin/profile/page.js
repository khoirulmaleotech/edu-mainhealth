"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Loader2,
  Save,
  MapPin,
  Phone,
  Globe,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Home,
} from "lucide-react";

export default function SchoolAdminProfilePage() {
  const { data: session } = useSession();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/school-admin/profile");
      const data = await res.json();
      if (data.success) {
        setSchool(data.school);
      } else {
        setToast(data.message || "Gagal memuat profil sekolah.");
      }
    } catch (error) {
      setToast("Gagal memuat profil sekolah.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!school) return;

    setSaving(true);
    try {
      const res = await fetch("/api/school-admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: school.name,
          address: school.address,
          phone: school.phone,
          website: school.website,
        }),
      });

      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Gagal menyimpan profil.");

      setSuccess(true);
      showToast("Profil sekolah berhasil disimpan.");
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      showToast(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00adb5]" size={40} />
      </div>
    );

  if (!school)
    return (
      <div className="py-20 text-center text-slate-500">
        <p className="text-lg font-semibold">Profil sekolah tidak ditemukan.</p>
      </div>
    );

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-700 space-y-8">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Profil Sekolah
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Kelola informasi utama sekolah yang tersimpan di database.
          </p>
        </div>
        <Link
          href="/dashboard/school-admin"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[#00adb5] font-bold text-sm transition-colors"
        >
          <ArrowLeft size={18} /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-[35px] border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 flex items-center justify-center rounded-3xl bg-[#00adb5] text-white">
                <Home size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-[0.3em] font-bold">
                  Sekolah
                </p>
                <h3 className="text-xl font-black text-slate-800">
                  {school.name}
                </h3>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-[#00adb5]" size={20} />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-black">
                    Status Verifikasi
                  </p>
                  <p>
                    {school.is_verified
                      ? "Terverifikasi"
                      : "Menunggu Verifikasi"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="text-slate-400" size={20} />
                <span>{school.address || "Belum diisi"}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="text-slate-400" size={20} />
                <span>{school.phone || "Belum diisi"}</span>
              </div>

              <div className="flex items-center gap-3">
                <Globe className="text-slate-400" size={20} />
                <span>{school.website || "Belum diisi"}</span>
              </div>

              <div className="rounded-3xl border border-slate-200 p-4 bg-slate-50">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Kode Afiliasi
                </p>
                <p className="font-black text-slate-800 mt-2">
                  {school.affiliation_code || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-[35px] border border-slate-200 p-8 shadow-sm space-y-8"
          >
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  value={school.name || ""}
                  onChange={(e) =>
                    setSchool({ ...school, name: e.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-slate-700 outline-none focus:border-[#00adb5]/30 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Alamat Sekolah
                </label>
                <textarea
                  rows={3}
                  value={school.address || ""}
                  onChange={(e) =>
                    setSchool({ ...school, address: e.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-slate-700 outline-none focus:border-[#00adb5]/30 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={school.phone || ""}
                  onChange={(e) =>
                    setSchool({ ...school, phone: e.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-slate-700 outline-none focus:border-[#00adb5]/30 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Website Sekolah
                </label>
                <input
                  type="url"
                  value={school.website || ""}
                  onChange={(e) =>
                    setSchool({ ...school, website: e.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-slate-700 outline-none focus:border-[#00adb5]/30 focus:bg-white"
                  placeholder="https://"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00adb5] px-8 py-4 text-sm font-black text-white transition hover:bg-[#00a2a8] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Save size={18} /> Simpan Profil
                  </>
                )}
              </button>

              {success && (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  <CheckCircle2 size={18} /> Profil berhasil disimpan
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
