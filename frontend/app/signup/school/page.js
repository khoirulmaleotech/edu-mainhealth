"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, 
  MapPin, 
  Phone, 
  FileCheck, 
  ArrowRight, 
  Globe, 
  ShieldCheck,
  CheckCircle2,
  Mail,
  Lock,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SchoolSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolAddress: '',
    schoolPhone: '',
    schoolWebsite: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/signup/school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Registrasi Berhasil! Kode Afiliasi Anda: ${data.data.affiliation_code}`);
        router.push('/login');
      } else {
        alert(data.message || "Terjadi kesalahan saat mendaftar.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans selection:bg-primary selection:text-white">
      <div className="max-w-6xl w-full bg-white rounded-[50px] shadow-2xl shadow-slate-200 overflow-hidden grid lg:grid-cols-2 min-h-[850px]">
        
        {/* LEFT SIDE: Institutional Benefits */}
        <div className="hidden lg:flex bg-[#0b0e14] items-center justify-center p-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 opacity-50 animate-pulse"></div>
          
          <div className="relative z-10 space-y-12">
            <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[50px] border border-white/10 shadow-2xl">
              <Image 
                src="/images/logo-edumind.png" 
                alt="School Partner Mascot" 
                width={150} 
                height={150} 
                className="mb-8"
              />
              <h2 className="text-4xl font-black text-white leading-tight mb-6">
                Transformasi <span className="text-primary italic">Wellbeing</span> <br/> di Sekolah Anda.
              </h2>
              
              <div className="space-y-6">
                <SchoolFeature text="Dashboard Monitoring Guru & Konselor" />
                <SchoolFeature text="Laporan Perkembangan Karakter Siswa" />
                <SchoolFeature text="Sistem Peringatan Dini Krisis Mental" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <ShieldCheck className="text-primary" size={20} /> Data Terenkripsi ISO 27001
            </div>
          </div>
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-primary opacity-20 rounded-full blur-[120px]"></div>
        </div>

        {/* RIGHT SIDE: School Registration Form */}
        <div className="p-12 lg:p-20 flex flex-col justify-center">
          <div className="mb-12 flex justify-between items-end">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/images/logo-edumind.png" alt="Logo" width={55} height={55} />
              <div className="flex flex-col">
                <span className="text-xl font-black text-primary leading-none uppercase">EduMind</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase italic">Institutional</span>
              </div>
            </Link>
            <div className="text-right">
              <span className="text-[10px] font-black text-primary uppercase">Langkah {step} dari 2</span>
              <div className="flex gap-1 mt-1">
                <div className={`h-1 w-6 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-slate-100'}`}></div>
                <div className={`h-1 w-6 rounded-full ${step === 2 ? 'bg-primary' : 'bg-slate-100'}`}></div>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-10">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none">Registrasi Sekolah</h1>
            <p className="text-slate-400 font-medium italic">Daftarkan institusi Anda secara mandiri di EduMind.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nama Resmi Sekolah</label>
                  <div className="relative group">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                    <input name="schoolName" onChange={handleChange} value={formData.schoolName} type="text" placeholder="SMK Maleo Teknologi Indonesia" className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[25px] outline-none text-sm font-bold shadow-inner transition-all" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Alamat Institusi</label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                    <input name="schoolAddress" onChange={handleChange} value={formData.schoolAddress} type="text" placeholder="Jl. Raya Intermark No. 8" className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[25px] outline-none text-sm font-bold shadow-inner transition-all" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nomor Telepon</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input name="schoolPhone" onChange={handleChange} value={formData.schoolPhone} type="tel" placeholder="021-..." className="w-full pl-14 pr-5 py-5 bg-slate-50 rounded-[25px] outline-none text-sm font-bold shadow-inner" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Situs Web</label>
                    <div className="relative">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input name="schoolWebsite" onChange={handleChange} value={formData.schoolWebsite} type="url" placeholder="https://..." className="w-full pl-14 pr-5 py-5 bg-slate-50 rounded-[25px] outline-none text-sm font-bold shadow-inner" />
                    </div>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="w-full py-5 bg-primary text-white rounded-[30px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Langkah Berikutnya <ArrowRight size={20} />
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nama Lengkap Admin</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input name="adminName" onChange={handleChange} value={formData.adminName} type="text" placeholder="Budi Santoso" className="w-full pl-14 pr-5 py-5 bg-slate-50 rounded-[25px] outline-none text-sm font-bold shadow-inner" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Admin Sekolah</label>
                    <input name="adminEmail" onChange={handleChange} value={formData.adminEmail} type="email" placeholder="admin@sekolah.sch.id" className="w-full px-5 py-5 bg-slate-50 rounded-[25px] outline-none text-sm font-bold shadow-inner" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Password Admin</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input name="adminPassword" onChange={handleChange} value={formData.adminPassword} type="password" placeholder="••••••••" className="w-full pl-14 pr-5 py-5 bg-slate-50 rounded-[25px] outline-none text-sm font-bold shadow-inner" required />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-primary/5 rounded-[30px] border border-primary/10">
                  <h4 className="text-xs font-black text-primary uppercase mb-2 flex items-center gap-2"><ShieldCheck size={14}/> Keamanan Akun</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">
                    Akun ini akan menjadi **Master Admin** sekolah yang berwenang mengelola data seluruh guru dan siswa.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[30px] font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Kembali
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-5 bg-slate-900 text-white rounded-[30px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Selesaikan Pendaftaran"} 
                    {!loading && <ArrowRight size={20} />}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-[10px] font-bold text-slate-400 mt-10 uppercase tracking-tighter">
            Dengan mendaftar, Anda menyetujui syarat & ketentuan kemitraan <span className="text-primary font-black underline">Maleotech.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function SchoolFeature({ text }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="bg-secondary p-1.5 rounded-full text-slate-900 shadow-lg group-hover:scale-110 transition-transform">
        <CheckCircle2 size={18} />
      </div>
      <span className="text-sm font-bold text-white/90 tracking-tight">{text}</span>
    </div>
  );
}