"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, Mail, Lock, Building2, ArrowRight, 
  ChevronDown, Loader2, PartyPopper, XCircle, Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState('student');
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [isSchoolOpen, setIsSchoolOpen] = useState(false);
  const [modal, setModal] = useState({ show: false, type: '', title: '', message: '' });

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    institution_id: '',
    institution_name: '', // Tetap di state agar tidak breaking, tapi tidak dirender
    school_display_name: '' 
  });

  const roles = [
    { id: 'student', label: 'Siswa', emoji: '🎓' },
    { id: 'parent', label: 'Orang Tua', emoji: '🏠' },
    { id: 'teacher', label: 'Guru', emoji: '👨‍🏫' },
    { id: 'psychologist', label: 'Psikolog', emoji: '🏥' },
  ];

  useEffect(() => {
    fetch('/api/signup/school')
      .then(res => res.json())
      .then(json => { if(json.success) setSchools(json.data) });
  }, []);

  const filteredSchools = useMemo(() => {
    return schools.filter(s => s.name.toLowerCase().includes(schoolSearch.toLowerCase()));
  }, [schools, schoolSearch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectSchool = (id, name) => {
    setFormData({ ...formData, institution_id: id, school_display_name: name });
    setIsSchoolOpen(false);
    setSchoolSearch("");
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
            ? 'Akun psikolog Anda akan segera ditinjau oleh tim Admin EduMind.' 
            : 'Akun Anda sudah aktif. Silakan masuk untuk memulai.'
        );
        setTimeout(() => router.push('/login'), 3500);
      } else {
        showAlert('error', 'Gagal Daftar', data.message || "Terjadi kesalahan.");
      }
    } catch (error) {
      showAlert('error', 'Koneksi Error', 'Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans relative selection:bg-[#00adb5] selection:text-white">
      
      {modal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
            <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center ${modal.type === 'success' ? 'bg-[#00adb5]/10 text-[#00adb5]' : 'bg-red-100 text-red-600'}`}>
              {modal.type === 'success' ? <PartyPopper size={40} /> : <XCircle size={40} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{modal.title}</h3>
              <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">{modal.message}</p>
            </div>
            <button onClick={() => setModal({ ...modal, show: false })} className="w-full py-4 bg-[#0b0e14] text-white rounded-2xl font-bold text-xs uppercase hover:bg-[#00adb5] transition-all">Tutup</button>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden grid lg:grid-cols-2 min-h-[850px]">
        
        <div className="hidden lg:flex bg-[#00adb5] items-center justify-center p-16 relative overflow-hidden text-center text-white">
          <div className="absolute -left-10 -top-10 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
          <div className="relative z-10 space-y-10 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[50px] border border-white/20 shadow-2xl text-primary">
              <div className="bg-white p-6 rounded-[35px] inline-block mb-8 shadow-xl shadow-[#00adb5]/20">
                <Image src="/images/logo-edumind-transparan.png" alt="EduMind" width={140} height={140} priority />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tight mb-4">Yayasan Maleo</h2>
              <p className="text-sm opacity-90 font-medium leading-relaxed">Ekosistem digital untuk keseimbangan emosional dan pemetaan bakat generasi hebat.</p>
            </div>
            <div className="bg-[#0b0e14]/30 p-8 rounded-[40px] border border-white/10 space-y-4">
              <h3 className="text-lg font-bold">Sekolah Belum Terdaftar?</h3>
              <Link href="/signup/school" className="flex items-center justify-between w-full p-4 bg-white/10 hover:bg-[#0b0e14] transition-all rounded-2xl group">
                <span className="text-xs font-bold uppercase">Registrasi Sekolah</span>
                <ArrowRight size={18} className="text-[#00adb5] group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center bg-white text-primary">
          <div className="mb-10 flex flex-col items-center lg:items-start space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/images/logo-edumind-transparan.png" alt="Logo" width={55} height={55} />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#00adb5] leading-none tracking-tighter">EduMind</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maleotech</span>
              </div>
            </Link>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">Buat Akun</h1>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 text-primary">
            {roles.map((r) => (
              <button key={r.id} onClick={() => setRole(r.id)} className={`py-4 rounded-[30px] flex flex-col items-center gap-1 transition-all border-2 ${role === r.id ? 'border-[#00adb5] bg-[#00adb5]/5 shadow-lg shadow-[#00adb5]/10' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                <span className="text-2xl">{r.emoji}</span>
                <span className="text-[10px] font-bold">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto lg:mx-0 text-primary">
            <InputField label="Nama Lengkap" required icon={<User size={18}/>} name="fullname" placeholder="Nama Anda" value={formData.fullname} onChange={handleChange} />
            <InputField label="Email" required icon={<Mail size={18}/>} name="email" placeholder="nama@email.com" value={formData.email} onChange={handleChange} type="email" />

            {/* HANYA MUNCUL JIKA BUKAN PSIKOLOG */}
            {role !== 'psychologist' && (
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-slate-600 ml-2">
                  Asal Sekolah <span className="text-red-500 ml-1 font-black">*</span>
                </label>
                
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 z-10" size={18} />
                  <div className="relative">
                    <button 
                      type="button" 
                      onClick={() => setIsSchoolOpen(!isSchoolOpen)}
                      className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-transparent text-left rounded-[20px] outline-none text-sm font-semibold transition-all focus:border-[#00adb5]/20 focus:bg-white"
                    >
                      <span className={formData.school_display_name ? "text-slate-800" : "text-slate-400"}>
                        {formData.school_display_name || "Cari sekolah Anda..."}
                      </span>
                      <ChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 transition-transform ${isSchoolOpen ? 'rotate-180' : ''}`} size={18} />
                    </button>

                    {isSchoolOpen && (
                      <div className="absolute z-50 mt-2 w-full bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 animate-in slide-in-from-top-2">
                        <div className="relative mb-4">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input 
                            autoFocus
                            placeholder="Ketik nama sekolah..." 
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-xs font-bold border-none outline-none"
                            value={schoolSearch}
                            onChange={(e) => setSchoolSearch(e.target.value)}
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                          {filteredSchools.length > 0 ? (
                            filteredSchools.map(s => (
                              <button key={s._id} type="button" onClick={() => selectSchool(s._id, s.name)} className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#00adb5] hover:text-white transition-all">
                                {s.name}
                              </button>
                            ))
                          ) : (
                            <p className="text-[10px] text-center p-4 text-slate-400 italic">Sekolah tidak ditemukan</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <InputField label="Kata Sandi" required icon={<Lock size={18}/>} name="password" placeholder="Min. 8 karakter" value={formData.password} onChange={handleChange} type="password" />

            <button type="submit" disabled={loading} className="w-full h-[60px] bg-[#0b0e14] text-white rounded-[30px] font-bold text-sm shadow-xl hover:bg-[#00adb5] transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-70 group">
              {loading ? <Loader2 className="animate-spin" /> : `Daftar Sebagai ${role === 'psychologist' ? 'Psikolog' : 'Pengguna'}`}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-slate-400 mt-10">
            Sudah terdaftar? <Link href="/login" className="text-[#00adb5] font-black hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, icon, name, placeholder, value, onChange, required, type = "text" }) {
  return (
    <div className="space-y-1 text-primary">
      <label className="text-xs font-bold text-slate-600 ml-2">{label}{required && <span className="text-red-500 ml-1 font-black">*</span>}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00adb5] transition-colors">{icon}</div>
        <input name={name} required={required} onChange={onChange} value={value} type={type} placeholder={placeholder} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[20px] outline-none text-sm font-semibold transition-all shadow-inner" />
      </div>
    </div>
  );
}