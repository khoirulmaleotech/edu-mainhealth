"use client";
import React, { useEffect, useState } from 'react';
import { 
  User, Mail, Briefcase, FileText, CheckCircle, 
  Clock, Edit3, Save, X, ShieldCheck 
} from 'lucide-react';
import { fetchInstance } from "@/lib/fetchInstance";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    fullname: "",
    email: "",
    work_at: "",
    sipp: "",
    is_verified: false,
    is_online: false,
  });

  const [formData, setFormData] = useState({ ...profile });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const data = await fetchInstance("/api/psychologist/profile");
      setProfile(data);
      setFormData(data);
    } catch (error) {
      console.error("Gagal mengambil profil", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (dataToSave = formData) => {
    setSaving(true);
    try {
      await fetchInstance("/api/psychologist/profile", {
        method: "PUT",
        body: JSON.stringify(dataToSave),
      });
      setProfile(dataToSave);
      setIsEditing(false);
    } catch (error) {
      alert("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const toggleOnlineStatus = () => {
    const newValue = !profile.is_online;
    const updatedData = { ...profile, is_online: newValue };
    
    setProfile(updatedData);
    setFormData(updatedData);
    
    handleSave(updatedData);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00adb5] rounded-full animate-spin" />
      <p className="text-[#00adb5] font-bold animate-pulse text-sm uppercase tracking-widest">Memuat Profil...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Profil Saya</h1>
          <p className="text-slate-500 text-sm font-medium italic">Kelola identitas profesional dan status kehadiran Anda.</p>
        </div>
        
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Edit3 size={18} /> Edit Profil
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => { setIsEditing(false); setFormData(profile); }}
              className="flex items-center gap-2 bg-white text-slate-500 px-6 py-3 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <X size={18} /> Batal
            </button>
            <button 
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-2 bg-[#00adb5] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-[#00adb5]/20 hover:bg-[#009da5] transition-all disabled:opacity-50 active:scale-95"
            >
              <Save size={18} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        )}
      </div>

      <div className="mb-8">
        <button 
          onClick={toggleOnlineStatus}
          className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between shadow-sm group ${
            profile.is_online 
            ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
            : "bg-slate-100 border-transparent text-slate-400"
          }`}
        >
          <div className="flex items-center gap-5">
            <div className={`h-4 w-4 rounded-full ${profile.is_online ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Status Chat</p>
              <span className="font-black text-lg">
                {profile.is_online ? "Siswa Bisa Menghubungi Anda" : "Status Anda Sedang Offline"}
              </span>
            </div>
          </div>
          <div className={`w-14 h-7 rounded-full relative transition-colors ${profile.is_online ? "bg-emerald-500" : "bg-slate-300"}`}>
              <div className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all shadow-sm ${profile.is_online ? "left-8" : "left-1"}`} />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center h-fit">
          <div className="relative mb-6">
            <div className="h-28 w-28 bg-[#00adb5] rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-[#00adb5]/30">
              {profile.fullname?.charAt(0) || "P"}
            </div>
            {profile.is_verified && (
              <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-md">
                <ShieldCheck className="text-[#00adb5]" size={24} fill="#e0fbfc" />
              </div>
            )}
          </div>
          
          <h2 className="font-black text-slate-800 text-xl leading-tight">{profile.fullname}</h2>
          <div className={`mt-8 w-full py-3 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest ${
            profile.is_verified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}>
            {profile.is_verified ? <CheckCircle size={14} /> : <Clock size={14} />}
            {profile.is_verified ? "Akun Terverifikasi" : "Menunggu Verifikasi"}
          </div>
        </div>

        {/* Data Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap & Gelar</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00adb5] transition-colors">
                  <User size={20} />
                </div>
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={formData.fullname}
                  onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] font-bold text-slate-700 focus:bg-white focus:border-[#00adb5] focus:outline-none disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Alamat Email</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                  <Mail size={20} />
                </div>
                <input 
                  type="text"
                  disabled
                  value={profile.email}
                  className="w-full pl-14 pr-6 py-4 bg-slate-100 border-2 border-transparent rounded-[1.25rem] font-bold text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tempat Praktik</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00adb5] transition-colors">
                    <Briefcase size={20} />
                  </div>
                  <input 
                    type="text"
                    disabled={!isEditing}
                    value={formData.work_at || ""}
                    onChange={(e) => setFormData({...formData, work_at: e.target.value})}
                    placeholder="Nama RS/Klinik"
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] font-bold text-slate-700 focus:bg-white focus:border-[#00adb5] focus:outline-none disabled:opacity-60 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">No. SIPP</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00adb5] transition-colors">
                    <FileText size={20} />
                  </div>
                  <input 
                    type="text"
                    disabled={!isEditing}
                    value={formData.sipp || ""}
                    onChange={(e) => setFormData({...formData, sipp: e.target.value})}
                    placeholder="X.XXXX-XX-XXXX"
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] font-bold text-slate-700 focus:bg-white focus:border-[#00adb5] focus:outline-none disabled:opacity-60 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#00adb5]/5 border border-[#00adb5]/10 rounded-[2rem] flex gap-4 items-start">
            <div className="p-2 bg-white rounded-lg text-[#00adb5] shadow-sm">
              <ShieldCheck size={18} />
            </div>
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Status Online Anda menentukan apakah siswa dapat memulai sesi chat baru dengan Anda. Pastikan untuk menonaktifkan status jika Anda sedang tidak bertugas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}