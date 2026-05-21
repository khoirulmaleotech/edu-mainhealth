"use client";
import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  BookOpen, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  UserPlus, 
  LogIn, 
  X, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User,
  Zap
} from 'lucide-react';

export default function TalentPortalLandingPage() {
  // State Kontrol untuk Popup Modal Auth
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' atau 'signup'
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulasi autentikasi / pendaftaran akun siswa
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mengalihkan langsung ke dashboard tujuan target setelah sukses
      window.location.href = '/dashboard/student/talent';
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#00adb5]/20 selection:text-[#00adb5]">
      
      {/* ── SEKTOR NAVBAR ── */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 bg-[#00adb5]/10 text-[#00adb5] rounded-xl flex items-center justify-center font-black text-xl shadow-inner">
              E
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              EduMind <span className="text-[#00adb5] font-medium text-xs bg-[#00adb5]/5 px-2 py-0.5 rounded-md border border-[#00adb5]/10 ml-1">Talent Portal</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleOpenAuth('login')}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Masuk
            </button>
            <button 
              onClick={() => handleOpenAuth('signup')}
              className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition-all"
            >
              Daftar Akun Siswa
            </button>
          </div>
        </div>
      </nav>

      {/* ── SEKTOR HERO BANNER ── */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00adb5]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
        
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00adb5]/10 text-[#00adb5] rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} /> AI-Powered Assessment Center
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Temukan Potensi Terbaik Emas Dirimu Bersama <span className="text-[#00adb5]">EduMind</span>
        </h1>
        <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Ukur minat bakat karir, cara kerja belahan otak, hingga modalitas gaya belajar harianmu lewat 3 instrumen asesmen psikometri terpadu.
        </p>
        <div className="pt-4">
          <button 
            onClick={() => handleOpenAuth('signup')}
            className="px-8 py-4.5 bg-[#00adb5] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#00adb5]/20 hover:bg-[#00969e] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 group"
          >
            Mulai Tes Gratis Sekarang <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* ── SEKTOR DETAIL MANFAAT POIN PER TEST ── */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center space-y-2 mb-16">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">3 Pilar Modul Analisis Bakat Siswa</h2>
          <p className="text-sm text-slate-400 font-medium">Setiap instrumen dirancang spesifik untuk memetakan cetak biru keahlianmu</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KARTU 1: RIASEC TEST */}
          <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500/20 group-hover:bg-amber-500 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">1. Asesmen Minat Karir RIASEC</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Memetakan kecenderungan tipe kepribadian kerja bersandar pada 6 rumpun harian: Realistik, Investigatif, Artistik, Sosial, Enterprising, dan Konvensional.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs font-semibold text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500 shrink-0" /> Mencari Kombinasi Ranking 1 & 2 Teratas</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500 shrink-0" /> Rekomendasi Jurusan Kuliah Akurat</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500 shrink-0" /> Validasi Rumpun Karir Masa Depan</li>
              </ul>
            </div>
            <button 
              onClick={() => handleOpenAuth('signup')}
              className="w-full py-3 bg-amber-500/5 text-amber-600 font-bold text-xs rounded-xl hover:bg-amber-500 hover:text-white transition-all pt-4"
            >
              Pelajari RIASEC
            </button>
          </div>

          {/* KARTU 2: LEARNING STYLE (VAK) */}
          <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500/20 group-hover:bg-blue-500 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">2. Tes Modalitas Gaya Belajar (VAK)</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Mengidentifikasi jalur sensorik paling efisien yang kamu miliki dalam menyerap materi ilmu pengetahuan baru di kelas sekolah maupun rumah.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs font-semibold text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500 shrink-0" /> Pemetaan Nilai Rasio Visual, Auditori, & Kinestetik</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500 shrink-0" /> Grafik Batang Komparatif Komprehensif</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500 shrink-0" /> Dilengkapi Taktik Strategi Belajar Pintar</li>
              </ul>
            </div>
            <button 
              onClick={() => handleOpenAuth('signup')}
              className="w-full py-3 bg-blue-500/5 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-500 hover:text-white transition-all pt-4"
            >
              Pelajari Gaya Belajar
            </button>
          </div>

          {/* KARTU 3: BRAIN DOMINANCE */}
          <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-500/20 group-hover:bg-purple-500 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center shadow-inner">
                <Activity size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">3. Evaluasi Dominasi Belahan Otak</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Menganalisis keseimbangan fungsionalitas belahan hemisfer otak dalam memproses keputusan taktis-rasional vs konseptual-kreatif.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs font-semibold text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500 shrink-0" /> Mengukur Rasio Otak Kiri (IQ Analitis)</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500 shrink-0" /> Mengukur Rasio Otak Kanan (EQ Imajinatif)</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500 shrink-0" /> Rekomendasi Sinkronisasi Keseimbangan Berpikir</li>
              </ul>
            </div>
            <button 
              onClick={() => handleOpenAuth('signup')}
              className="w-full py-3 bg-purple-500/5 text-purple-600 font-bold text-xs rounded-xl hover:bg-purple-500 hover:text-white transition-all pt-4"
            >
              Pelajari Dominasi Otak
            </button>
          </div>

        </div>
      </main>

      {/* ── SEKTOR POPUP INTERAKTIF MODAL AUTH (LOGIN / SIGNUP REGISTER) ── */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden relative p-8 md:p-10 text-left animate-in zoom-in-95 duration-300">
            {/* Tombol Close Popup */}
            <button 
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl transition-colors"
            >
              <X size={16} />
            </button>

            {/* Header Modal */}
            <div className="space-y-2 mb-6">
              <div className="inline-flex p-2.5 bg-[#00adb5]/10 text-[#00adb5] rounded-xl">
                {authMode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {authMode === 'login' ? 'Selamat Datang Kembali!' : 'Buat Akun Portal Siswa'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {authMode === 'login' ? 'Masuk untuk melanjutkan riwayat pengerjaan asesmen bakat.' : 'Daftar sekali untuk membuka hak akses gratis seluruh fitur tes EduMind.'}
              </p>
            </div>

            {/* Form Interaktif */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Nama Lengkap Siswa</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      name="name"
                      required
                      placeholder="Masukkan nama lengkap Anda"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 text-xs border border-slate-200 focus:border-[#00adb5] rounded-xl outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Alamat Email Aktif</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="email" 
                    name="email"
                    required
                    placeholder="nama@sekolah.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 text-xs border border-slate-200 focus:border-[#00adb5] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Kata Sandi (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="password" 
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 text-xs border border-slate-200 focus:border-[#00adb5] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#00adb5] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#00adb5]/20 hover:bg-[#00969e] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    <span>Mempersiapkan Lembar Kerja...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Masuk ke Dashboard Siswa' : 'Daftar Akun & Mulai Evaluasi'}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Switch Toggle Auth Mode Handler */}
            <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs font-medium text-slate-400">
              {authMode === 'login' ? (
                <p>
                  Belum memiliki akun siswa?{' '}
                  <button onClick={() => setAuthMode('signup')} className="text-[#00adb5] font-bold hover:underline">Daftar Sekarang</button>
                </p>
              ) : (
                <p>
                  Sudah terdaftar di sistem?{' '}
                  <button onClick={() => setAuthMode('login')} className="text-[#00adb5] font-bold hover:underline">Masuk Akun</button>
                </p>
              )}
            </div>

            <div className="flex gap-2 items-center justify-center pt-4 text-[10px] font-semibold text-slate-400">
              <ShieldCheck size={12} className="text-emerald-500" /> Secure SSL Data Encryption
            </div>

          </div>
        </div>
      )}

    </div>
  );
}