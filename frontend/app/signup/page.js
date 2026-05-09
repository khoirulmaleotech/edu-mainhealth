"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, Mail, Lock, Building2, ArrowRight, 
  ShieldCheck, ChevronDown, Loader2, PartyPopper, XCircle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState('student');
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, type: '', title: '', message: '' });

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    institution_id: '',
    institution_name: '',
    sipp_number: ''
  });

  const roles = [
    { id: 'student', label: 'Siswa', emoji: '🎓' },
    { id: 'parent', label: 'Orang Tua', emoji: '🏠' },
    { id: 'teacher', label: 'Guru', emoji: '👨‍🏫' },
    { id: 'psychologist', label: 'Psikolog', emoji: '🏥' },
  ];

  // Load daftar sekolah untuk dropdown
  useEffect(() => {
    fetch('/api/signup/school')
      .then(res => res.json())
      .then(json => { if(json.success) setSchools(json.data) });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showAlert = (type, title, message) => {
    setModal({ show: true, type, title, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();

      if (res.ok) {
        showAlert(
          'success', 
          'Pendaftaran Berhasil!', 
          role === 'psychologist' 
            ? 'Akun psikolog Anda akan diverifikasi oleh tim Yayasan Maleo dalam 1x24 jam.' 
            : 'Akun Anda sudah aktif. Silakan masuk untuk memulai.'
        );
        // Redirect ke login setelah 3 detik jika sukses
        setTimeout(() => router.push('/login'), 3500);
      } else {
        showAlert('error', 'Gagal Daftar', data.message || "Terjadi kesalahan.");
      }
    } catch (error) {
      showAlert('error', 'Koneksi Error', 'Gagal menghubungi server. Periksa internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans relative selection:bg-[#00adb5] selection:text-white">
      
      {/* MODAL ALERT CUSTOM */}
      {modal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-8 md:p-10 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center ${modal.type === 'success' ? 'bg-[#00adb5]/10 text-[#00adb5]' : 'bg-red-100 text-red-600'}`}>
              {modal.type === 'success' ? <PartyPopper size={40} /> : <XCircle size={40} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{modal.title}</h3>
              <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">{modal.message}</p>
            </div>
            <button 
              onClick={() => setModal({ ...modal, show: false })} 
              className="w-full py-4 bg-[#0b0e14] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#00adb5] transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full bg-white rounded-[40px] md:rounded-[50px] shadow-2xl shadow-slate-200 overflow-hidden grid lg:grid-cols-2 min-h-[850px]">
        
        {/* LEFT SIDE: Branding */}
        <div className="hidden lg:flex bg-[#00adb5] items-center justify-center p-16 relative overflow-hidden text-center text-white">
          <div className="absolute -left-10 -top-10 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 space-y-10 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[50px] border border-white/20 shadow-2xl">
              <div className="bg-white p-6 rounded-[35px] inline-block mb-8 shadow-xl shadow-[#00adb5]/20 transition-transform hover:scale-105">
                <Image src="/images/logo-edumind-transparan.png" alt="Yayasan Maleo" width={140} height={140} priority />
              </div>
              <h2 className="text-3xl font-black leading-tight mb-4 tracking-tight uppercase italic">Yayasan Maleo</h2>
              <p className="text-sm opacity-90 font-medium leading-relaxed">Ekosistem digital untuk keseimbangan emosional dan pemetaan bakat generasi hebat.</p>
            </div>

            <div className="bg-[#0b0e14]/30 p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold">Sekolah Anda Belum Terdaftar?</h3>
              <Link href="/signup/school" className="flex items-center justify-between w-full p-4 bg-white/10 hover:bg-[#0b0e14] transition-all rounded-2xl group border border-white/5">
                <span className="text-xs font-bold uppercase">Registrasi Sekolah</span>
                <ArrowRight size={18} className="text-[#fbcd2b] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Signup Form */}
        <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center bg-white">
          <div className="mb-10 flex flex-col items-center lg:items-start space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/images/logo-edumind-transparan.png" alt="Logo" width={55} height={55} />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#00adb5] leading-none tracking-tighter">EduMind</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maleotech</span>
              </div>
            </Link>
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">Buat Akun</h1>
              <p className="text-sm md:text-base text-slate-400 font-medium italic">Silakan lengkapi data diri sesuai peran Anda.</p>
            </div>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-10">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`py-4 rounded-2xl md:rounded-[30px] flex flex-col items-center gap-1 transition-all border-2 ${
                  role === r.id 
                    ? 'border-[#00adb5] bg-[#00adb5]/5 shadow-lg shadow-[#00adb5]/10 scale-105' 
                    : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-[#00adb5]/20'
                }`}
              >
                <span className="text-xl md:text-2xl">{r.emoji}</span>
                <span className="text-[10px] font-bold">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto lg:mx-0">
            <InputField label="Nama Lengkap" required icon={<User size={18}/>} name="fullname" placeholder="Contoh: Budi Santoso" value={formData.fullname} onChange={handleChange} />
            <InputField label="Alamat Email" required icon={<Mail size={18}/>} name="email" placeholder="nama@email.com" value={formData.email} onChange={handleChange} type="email" />

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 ml-2">
                {role === 'psychologist' ? 'Lembaga / Klinik' : 'Asal Sekolah'}
                <span className="text-red-500 ml-1 font-black">*</span>
              </label>
              <div className="relative group">
                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00adb5] transition-colors" size={18} />
                
                {role === 'psychologist' ? (
                  <input name="institution_name" required onChange={handleChange} value={formData.institution_name} type="text" placeholder="Nama klinik atau rumah sakit" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[20px] outline-none text-sm font-semibold shadow-inner transition-all" />
                ) : (
                  <>
                    <select name="institution_id" required onChange={handleChange} value={formData.institution_id} className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[20px] outline-none text-sm font-semibold shadow-inner appearance-none cursor-pointer transition-all">
                      <option value="">Pilih institusi pendidikan</option>
                      {schools.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                  </>
                )}
              </div>
            </div>

            {role === 'psychologist' && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                <InputField label="Nomor SIPP / SIP" required icon={<ShieldCheck size={18}/>} name="sipp_number" placeholder="Nomor ijin praktik aktif" value={formData.sipp_number} onChange={handleChange} />
              </div>
            )}

            <InputField label="Kata Sandi" required icon={<Lock size={18}/>} name="password" placeholder="Min. 8 karakter gabungan" value={formData.password} onChange={handleChange} type="password" />

            <button type="submit" disabled={loading} className="w-full h-[60px] bg-[#0b0e14] text-white rounded-[25px] md:rounded-[30px] font-bold text-sm shadow-xl shadow-slate-200 hover:bg-[#00adb5] transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-70 group">
              {loading ? <Loader2 className="animate-spin" /> : `Daftar Sebagai ${role === 'psychologist' ? 'Psikolog' : 'Pengguna'}`}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-slate-400 mt-10">
            Sudah terdaftar sebelumnya? <Link href="/login" className="text-[#00adb5] font-black hover:underline">Masuk Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, icon, name, placeholder, value, onChange, required, type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-600 ml-2">
        {label}
        {required && <span className="text-red-500 ml-1 font-black">*</span>}
      </label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00adb5] transition-colors">{icon}</div>
        <input 
          name={name} 
          required={required}
          onChange={onChange} 
          value={value} 
          type={type} 
          placeholder={placeholder} 
          className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[20px] outline-none text-sm font-semibold shadow-inner transition-all" 
        />
      </div>
    </div>
  );
}