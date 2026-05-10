"use client";
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  Loader2, 
  CheckCircle2, 
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from "next-auth/react"; // Tambahkan import session

export default function StudentProfilePage() {
  const { data: session } = useSession(); // Ambil data session
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    // Tambahkan kondisi if session agar API hanya dipanggil saat session tersedia
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]); // Gunakan ID sebagai dependensi agar lebih stabil

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/student/profile');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('fullname', user.fullname);
      formData.append('phone', user.phone || '');
      if (file) formData.append('file', file);

      const res = await fetch('/api/student/profile', {
        method: 'PATCH',
        body: formData,
      });

      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        fetchProfile();
        setFile(null);
        setPreview(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#00adb5]" size={40} />
    </div>
  );

  // Pastikan user tidak null sebelum render konten
  if (!user) return null;

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Profil saya</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Kelola informasi data diri dan foto profil kamu.
          </p>
        </div>
        <Link 
          href="/dashboard/student"
          className="flex items-center gap-2 text-slate-500 hover:text-[#00adb5] font-bold text-sm transition-colors w-fit"
        >
          <ArrowLeft size={18} /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[35px] border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100 relative">
                <img 
                  src={preview || user.image || "/images/logo-edumind-transparan.png"} 
                  className="w-full h-full object-cover" 
                  alt="Avatar" 
                />
              </div>
              <label className="absolute bottom-2 right-2 p-2.5 bg-[#00adb5] text-white rounded-full cursor-pointer shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-white">
                <Camera size={20} />
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
            
            <h3 className="mt-6 text-xl font-bold text-slate-800 break-words w-full px-2">
              {user.fullname}
            </h3>
            <p className="text-xs font-black text-[#00adb5] uppercase tracking-[0.2em] mt-2">Siswa</p>
            
            <div className="mt-8 w-full pt-8 border-t border-slate-100 space-y-5">
              <div className="flex items-center gap-4 text-slate-600 text-sm font-bold text-left">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                   <GraduationCap size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-none mb-1">Status</p>
                  <span>Aktif - Kelas 12</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-600 text-sm font-bold text-left">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                   <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-none mb-1">Email</p>
                  <span className="truncate block max-w-[150px]">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="lg:col-span-2">
          <form onSubmit={handleUpdate} className="bg-white p-6 md:p-10 rounded-[35px] border border-slate-200 shadow-sm space-y-8">
            
            {/* Input Fullname */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                Nama lengkap <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00adb5] transition-colors">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  required
                  value={user.fullname || ''}
                  onChange={(e) => setUser({...user, fullname: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all"
                />
              </div>
            </div>

            {/* Input WhatsApp dengan prefix +62 */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                Nomor WhatsApp <span className="text-slate-400 italic font-medium ml-1">(Opsional)</span>
              </label>
              <div className="relative group flex items-center">
                {/* Prefix Icon & Number */}
                <div className="absolute left-4 flex items-center gap-2 text-slate-400 group-focus-within:text-[#00adb5] transition-colors z-10">
                  <Phone size={20} />
                  <span className="text-sm font-bold border-r border-slate-200 pr-2">+62</span>
                </div>
                <input 
                  type="number" 
                  placeholder="812xxxxxx"
                  value={user.phone || ''}
                  onChange={(e) => setUser({...user, phone: e.target.value})}
                  className="w-full pl-24 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300 appearance-none"
                />
              </div>
            </div>

            {/* Input Email (ReadOnly) */}
            <div className="space-y-3 opacity-70">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                Alamat Email (Akun)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  value={user.email || ''} 
                  disabled 
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-transparent rounded-2xl text-slate-400 font-bold cursor-not-allowed" 
                />
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center gap-5">
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full sm:w-auto px-12 py-4 bg-[#00adb5] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-[#00adb5]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Simpan Perubahan</>}
              </button>
              
              {success && (
                <div className="flex items-center gap-2 text-emerald-500 font-black animate-in slide-in-from-left-4">
                  <CheckCircle2 size={22} />
                  <span className="text-sm">Profil berhasil diperbarui!</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}