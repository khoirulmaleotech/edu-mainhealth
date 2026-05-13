"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  School,
  GraduationCap,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function ParentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState(null);
  const [student, setStudent] = useState(null);

  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    avatar: "",
  });

  /*
  |--------------------------------------------------------------------------
  | FETCH PROFILE
  |--------------------------------------------------------------------------
  */
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/parent/profile", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setProfile(data.profile);
        setStudent(data.student);

        setFormData({
          fullname: data.profile.fullname || "",
          phone: data.profile.phone || "",
          avatar: data.profile.avatar || "",
        });
      }
    } catch (error) {
      console.error("FETCH PROFILE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | UPDATE PROFILE
  |--------------------------------------------------------------------------
  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await fetch("/api/parent/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        fetchProfile();
      }
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={40}
            className="animate-spin text-primary"
          />

          <p className="font-bold text-slate-500">
            Memuat profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">

      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          <div className="space-y-3">

            <div className="flex items-center gap-3">

              <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/10">
                <User
                  size={28}
                  className="text-primary"
                />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  Profile Orang Tua
                </h1>

                <p className="text-slate-500 font-medium text-sm mt-1">
                  Kelola informasi akun dan data pendamping siswa.
                </p>
              </div>

            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="space-y-6">

            {/* PROFILE CARD */}
            <div className="bg-white rounded-[36px] border border-slate-100 p-8 shadow-sm">

              <div className="flex flex-col items-center text-center">

                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/10 shadow-lg mb-5">

                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <User
                        size={40}
                        className="text-primary"
                      />
                    </div>
                  )}

                </div>

                <h2 className="text-2xl font-black text-slate-900">
                  {profile?.fullname}
                </h2>

                <p className="text-slate-500 font-semibold mt-1">
                  {profile?.email}
                </p>

                <div className="mt-5 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] uppercase tracking-[0.2em] font-black">
                  {profile?.role || "PARENT"}
                </div>

              </div>

            </div>

            {/* STUDENT CARD */}
            {student && (
              <div className="bg-white rounded-[36px] border border-slate-100 p-8 shadow-sm">

                <div className="flex items-center gap-3 mb-6">

                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                    <GraduationCap
                      size={22}
                      className="text-secondary"
                    />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900">
                      Data Anak
                    </h3>

                    <p className="text-xs text-slate-500 font-medium">
                      Terhubung dengan akun siswa
                    </p>
                  </div>

                </div>

                <div className="space-y-5">

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2">
                      Nama Lengkap
                    </p>

                    <p className="font-bold text-slate-800">
                      {student.fullname}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2">
                      Kelas
                    </p>

                    <p className="font-bold text-slate-800">
                      {student.class_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2">
                      Sekolah
                    </p>

                    <p className="font-bold text-slate-800 flex items-center gap-2">
                      <School size={16} />
                      {student.school_name}
                    </p>
                  </div>

                </div>

              </div>
            )}

          </div>

          {/* RIGHT */}
          <div className="xl:col-span-2">

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden"
            >

              {/* TOP */}
              <div className="p-8 md:p-10 border-b border-slate-100">

                <div className="flex items-center gap-3 mb-3">

                  <Sparkles
                    size={20}
                    className="text-secondary"
                  />

                  <h3 className="font-black text-slate-900 text-lg">
                    Informasi Profile
                  </h3>

                </div>

                <p className="text-sm text-slate-500 font-medium">
                  Pastikan data profile Anda selalu terbaru.
                </p>

              </div>

              {/* FORM */}
              <div className="p-8 md:p-10 space-y-8">

                {/* FULLNAME */}
                <div className="space-y-3">

                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                    Nama Lengkap
                  </label>

                  <div className="relative">

                    <User
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={formData.fullname}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fullname: e.target.value,
                        })
                      }
                      placeholder="Masukkan nama lengkap..."
                      className="w-full h-16 rounded-2xl border border-slate-200 pl-14 pr-5 text-sm font-semibold outline-none focus:border-primary"
                    />

                  </div>

                </div>

                {/* EMAIL */}
                <div className="space-y-3">

                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                    Email
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      disabled
                      value={profile?.email || ""}
                      className="w-full h-16 rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-5 text-sm font-semibold text-slate-500"
                    />

                  </div>

                </div>

                {/* PHONE */}
                <div className="space-y-3">

                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                    Nomor Telepon
                  </label>

                  <div className="relative">

                    <Phone
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Masukkan nomor telepon..."
                      className="w-full h-16 rounded-2xl border border-slate-200 pl-14 pr-5 text-sm font-semibold outline-none focus:border-primary"
                    />

                  </div>

                </div>

                {/* AVATAR */}
                <div className="space-y-3">

                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest">
                    URL Avatar
                  </label>

                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        avatar: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full h-16 rounded-2xl border border-slate-200 px-5 text-sm font-semibold outline-none focus:border-primary"
                  />

                </div>

              </div>

              {/* FOOTER */}
              <div className="border-t border-slate-100 p-6 flex justify-end">

                <button
                  type="submit"
                  disabled={saving}
                  className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 disabled:opacity-50"
                >

                  {saving ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={18} />
                  )}

                  {saving
                    ? "Menyimpan..."
                    : "Simpan Perubahan"}

                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}