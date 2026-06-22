"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  MapPin,
  Phone,
  ArrowRight,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Lock,
  Loader2,
  ArrowLeft,
  XCircle,
  PartyPopper,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SchoolSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    schoolName: "",
    schoolAddress: "",
    schoolPhone: "",
    schoolWebsite: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  // Fungsi handle change utama
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showAlert = (type, title, message) => {
    setModal({ show: true, type, title, message });
  };

  const nextStep = () => {
    if (
      !formData.schoolName ||
      !formData.schoolAddress ||
      !formData.schoolPhone
    ) {
      showAlert(
        "error",
        "Data Belum Lengkap",
        "Mohon isi Nama, Alamat, dan Telepon sekolah.",
      );
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/signup/school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        showAlert(
          "success",
          "Registrasi Berhasil!",
          `Kode Afiliasi: ${data.data.affiliation_code}. Mengalihkan ke login...`,
        );
        setTimeout(() => router.push("/login"), 3500);
      } else {
        showAlert(
          "error",
          "Gagal Mendaftar",
          data.message || "Terjadi kesalahan.",
        );
      }
    } catch (err) {
      showAlert("error", "Koneksi Error", "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans relative selection:bg-[#00adb5] selection:text-white'>
      {/* MODAL ALERT */}
      {modal.show && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300'>
          <div className='bg-white rounded-[30px] md:rounded-[40px] p-8 md:p-10 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300'>
            <div
              className={`mx-auto w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center ${modal.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
              {modal.type === "success" ? (
                <PartyPopper size={32} />
              ) : (
                <XCircle size={32} />
              )}
            </div>
            <div>
              <h3 className='text-lg md:text-xl font-black text-slate-800 tracking-tight'>
                {modal.title}
              </h3>
              <p className='text-xs md:text-sm text-slate-500 font-medium mt-2 leading-relaxed'>
                {modal.message}
              </p>
            </div>
            <button
              onClick={() => setModal({ ...modal, show: false })}
              className='w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#00adb5] transition-all'>
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className='max-w-6xl w-full bg-white rounded-[40px] md:rounded-[50px] shadow-2xl shadow-slate-200 overflow-hidden grid lg:grid-cols-2 min-h-[600px] lg:min-h-[850px]'>
        {/* LEFT SIDE: Institutional Branding */}
        <div className='hidden lg:flex bg-[#0b0e14] items-center justify-center p-20 relative overflow-hidden text-center'>
          <div className='absolute inset-0 bg-[#00adb5]/10 opacity-50'></div>
          <div className='relative z-10 space-y-12'>
            <div className='bg-white/5 backdrop-blur-3xl p-10 rounded-[50px] border border-white/10 shadow-2xl'>
              <div className='bg-white p-5 rounded-[35px] inline-flex items-center gap-4 mb-8 shadow-xl shadow-[#00adb5]/20'>
                <Image
                  src='/images/telkom-indonesia.png'
                  alt='Telkom Indonesia'
                  width={130}
                  height={65}
                  priority
                  className="h-12 w-auto"
                />
                <Image
                  src='/images/tjsl.png'
                  alt='TJSL'
                  width={130}
                  height={65}
                  priority
                  className="h-12 w-auto"
                />
              </div>
              <h2 className='text-4xl font-black text-white leading-tight mb-6 tracking-tight'>
                Kemitraan <br />{" "}
                <span className='text-[#fbcd2b] italic uppercase'>
                  EduMind.
                </span>
              </h2>
              <div className='space-y-6 text-left'>
                <SchoolFeature text='Panel Kontrol Admin Sekolah' />
                <SchoolFeature text='Laporan Karakter Kolektif' />
                <SchoolFeature text='Verifikasi Tenaga Pengajar' />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: School Registration Form */}
        <div className='p-8 md:p-12 lg:p-20 flex flex-col justify-center bg-white relative'>
          <div className='mb-8 md:mb-12 flex justify-between items-center'>
            <Link href='/' className='flex items-center gap-2 md:gap-3'>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                <Image
                  src='/images/telkom-indonesia.png'
                  alt='Telkom Indonesia'
                  width={60}
                  height={30}
                  className="h-6 md:h-8 w-auto"
                />
                <Image
                  src='/images/tjsl.png'
                  alt='TJSL'
                  width={60}
                  height={30}
                  className="h-6 md:h-8 w-auto"
                />
              </div>
              <div className='flex flex-col'>
                <span className='text-lg md:text-xl font-black text-[#00adb5] leading-none uppercase'>
                  EduMind
                </span>
                <span className='text-[8px] md:text-[9px] font-bold text-slate-400 tracking-widest uppercase italic'>
                  School Portal
                </span>
              </div>
            </Link>
            <div className='text-right'>
              <span className='text-[9px] md:text-[10px] font-black text-[#00adb5] uppercase'>
                Step {step} / 2
              </span>
            </div>
          </div>

          <div className='space-y-2 mb-6 md:mb-10'>
            <h1 className='text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight'>
              Registrasi Sekolah
            </h1>
            <p className='text-sm md:text-base text-slate-400 font-medium italic italic'>
              Daftarkan institusi Anda secara mandiri.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className='space-y-4 md:space-y-5 w-full'>
            {step === 1 ? (
              <div className='space-y-4 md:space-y-5 animate-in slide-in-from-right-4 duration-500'>
                <InputField
                  label='Nama Resmi Sekolah'
                  icon={<Building2 size={18} />}
                  name='schoolName'
                  placeholder='Nama sekolah'
                  value={formData.schoolName}
                  onChange={handleChange}
                />
                <InputField
                  label='Alamat Lengkap'
                  icon={<MapPin size={18} />}
                  name='schoolAddress'
                  placeholder='Alamat institusi'
                  value={formData.schoolAddress}
                  onChange={handleChange}
                />
                <InputField
                  label='Nomor Telepon'
                  icon={<Phone size={18} />}
                  name='schoolPhone'
                  placeholder='021-...'
                  value={formData.schoolPhone}
                  onChange={handleChange}
                  type='tel'
                />
                <InputField
                  label='Website (Opsional)'
                  icon={<Globe size={18} />}
                  name='schoolWebsite'
                  placeholder='https://...'
                  value={formData.schoolWebsite}
                  onChange={handleChange}
                  type='url'
                />

                <button
                  type='button'
                  onClick={nextStep}
                  className='w-full py-4 md:py-5 bg-[#00adb5] text-white rounded-[25px] md:rounded-[30px] font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl shadow-[#00adb5]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3'>
                  Berikutnya <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className='space-y-4 md:space-y-5 animate-in slide-in-from-right-4 duration-500'>
                <InputField
                  label='Nama Admin'
                  icon={<User size={18} />}
                  name='adminName'
                  placeholder='Penanggung Jawab'
                  value={formData.adminName}
                  onChange={handleChange}
                />
                <InputField
                  label='Email Admin'
                  icon={<Mail size={18} />}
                  name='adminEmail'
                  placeholder='admin@sekolah.com'
                  value={formData.adminEmail}
                  onChange={handleChange}
                  type='email'
                />
                <InputField
                  label='Password'
                  icon={<Lock size={18} />}
                  name='adminPassword'
                  placeholder='••••••••'
                  value={formData.adminPassword}
                  onChange={handleChange}
                  type='password'
                />

                {/* PERBAIKAN TOMBOL DI STEP 2 */}
                <div className='flex flex-col sm:flex-row gap-3 md:gap-4 pt-4'>
                  <button
                    type='button'
                    onClick={() => setStep(1)}
                    className='w-full sm:flex-1 h-[56px] md:h-[60px] bg-slate-100 text-slate-500 rounded-[20px] md:rounded-[30px] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center order-2 sm:order-1'>
                    Kembali
                  </button>
                  <button
                    type='button'
                    onClick={handleSubmit}
                    disabled={loading}
                    className='w-full sm:flex-[2] h-[56px] md:h-[60px] bg-[#0b0e14] text-white rounded-[20px] md:rounded-[30px] font-black text-xs md:text-sm uppercase tracking-widest shadow-xl hover:bg-[#00adb5] transition-all flex items-center justify-center gap-3 disabled:opacity-70 order-1 sm:order-2'>
                    {loading ? (
                      <Loader2 className='animate-spin' />
                    ) : (
                      <>
                        Selesaikan Registrasi <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className='mt-8 md:mt-12 text-center border-t border-slate-100 pt-6'>
            <Link
              href='/signup'
              className='text-xs md:text-sm font-black text-[#00adb5] hover:underline flex items-center justify-center gap-2'>
              <ArrowLeft size={16} /> Daftar sebagai Siswa / Ortu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components - MEMASTIKAN ONCHANGE DIOPER DARI PROPS
function InputField({
  label,
  icon,
  name,
  placeholder,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className='space-y-1'>
      <label className='text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-2'>
        {label}
      </label>
      <div className='relative group'>
        <div className='absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00adb5] transition-colors'>
          {icon}
        </div>
        <input
          name={name}
          onChange={onChange} // <--- SEKARANG SUDAH DEFINED
          value={value}
          type={type}
          placeholder={placeholder}
          className='w-full pl-12 md:pl-14 pr-4 md:pr-5 py-3.5 md:py-4 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[18px] md:rounded-[20px] outline-none text-xs md:text-sm font-bold shadow-inner transition-all font-sans'
        />
      </div>
    </div>
  );
}

function SchoolFeature({ text }) {
  return (
    <div className='flex items-center gap-4 group'>
      <div className='bg-[#fbcd2b] p-1.5 rounded-full text-slate-900 shadow-lg group-hover:scale-110 transition-transform'>
        <CheckCircle2 size={16} />
      </div>
      <span className='text-sm font-bold text-white/90'>{text}</span>
    </div>
  );
}
