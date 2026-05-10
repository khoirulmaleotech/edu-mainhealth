"use client";
import React, { useState } from 'react';
import { 
  ShieldAlert, MapPin, Clock, Users, 
  Upload, Send, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon, X 
} from 'lucide-react';

export default function StudentReportCreatePage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    incidentType: "",
    location: "",
    time: "",
    description: ""
  });
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null); // Ganti state image menjadi file asli

  const incidentTypes = ["Verbal Bullying", "Physical Bullying", "Cyberbullying", "Social Exclusion", "Lainnya"];

const handleImageChange = (e) => {
    if (e.target.files[0]) {
        setFile(e.target.files[0]);
        setImage(URL.createObjectURL(e.target.files[0])); // Untuk preview
    }
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const formDataPayload = new FormData();
        formDataPayload.append('incidentType', formData.incidentType);
        formDataPayload.append('location', formData.location);
        formDataPayload.append('time', formData.time);
        formDataPayload.append('description', formData.description);
        if (file) formDataPayload.append('file', file);

        const res = await fetch('/api/student/report/submit', {
            method: 'POST',
            body: formDataPayload, // Kirim sebagai FormData
        });

        const data = await res.json();
        if (data.success) setSubmitted(true);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
};

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Laporan berhasil terkirim</h2>
        <p className="max-w-md text-slate-500 font-medium mb-8">
          Terima kasih sudah berani bersuara. Laporanmu akan segera ditinjau oleh tim profesional secara rahasia.
        </p>
        <button 
          onClick={() => window.location.href = '/dashboard/student/report'}
          className="w-full md:w-auto px-10 py-4 bg-[#00adb5] text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#00adb5]/20"
        >
          Lihat riwayat laporan
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Lapor kejadian baru</h2>
        <p className="text-slate-500 font-medium mt-1">Isi formulir di bawah ini dengan jujur. Identitasmu akan kami jaga rahasianya.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex-1 bg-white p-6 md:p-10 rounded-[30px] border border-slate-200 shadow-sm space-y-8">
          
          {/* Jenis Kejadian */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
              Jenis kejadian <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {incidentTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, incidentType: type})}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all text-left ${
                    formData.incidentType === type 
                    ? 'border-[#00adb5] bg-[#00adb5]/5 text-[#00adb5]' 
                    : 'border-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lokasi */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={14} /> Lokasi kejadian <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Misal: Kantin sekolah, WhatsApp"
                className="w-full p-4 bg-slate-50 border border-slate-100 focus:border-[#00adb5] rounded-xl outline-none font-medium text-sm transition-all"
              />
            </div>
            {/* Waktu */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock size={14} /> Waktu kejadian <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                placeholder="Misal: Jam istirahat, 14:30"
                className="w-full p-4 bg-slate-50 border border-slate-100 focus:border-[#00adb5] rounded-xl outline-none font-medium text-sm transition-all"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              Deskripsi kejadian <span className="text-rose-500">*</span>
            </label>
            <textarea 
              rows="5"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Ceritakan apa yang terjadi secara detail..."
              className="w-full p-4 bg-slate-50 border border-slate-100 focus:border-[#00adb5] rounded-2xl outline-none font-medium text-sm transition-all resize-none"
            />
          </div>

          {/* Upload Foto (Opsional) */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ImageIcon size={14} /> Lampiran bukti (Opsional)
            </label>
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-[#00adb5] transition-colors bg-slate-50/50">
                {image ? (
                  <div className="relative w-full h-40">
                    <img src={image} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setImage(null); }}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="text-slate-300 group-hover:text-[#00adb5]" size={32} />
                    <p className="text-xs font-bold text-slate-400 group-hover:text-slate-600">Klik atau tarik foto bukti di sini</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="pt-4 flex flex-col md:flex-row gap-4">
            <button 
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-[#00adb5] text-white rounded-2xl font-bold shadow-xl shadow-[#00adb5]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Kirim laporan sekarang</>}
            </button>
          </div>
        </form>

        {/* Sidebar Info */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-rose-50 p-6 rounded-[30px] border border-rose-100">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 mb-4 shadow-sm">
              <AlertCircle size={20} />
            </div>
            <h4 className="font-bold text-rose-600 mb-2 text-sm">Catatan penting</h4>
            <p className="text-xs text-rose-500/80 leading-relaxed font-medium">
              Jika kamu berada dalam situasi berbahaya secara fisik, jangan menunggu balasan aplikasi. Segera cari bantuan guru atau orang dewasa terdekat.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-[30px] text-white relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="font-bold text-sm mb-2 flex items-center gap-2">Kerahasiaan terjamin 🔒</h4>
               <p className="text-xs opacity-60 leading-relaxed font-medium">
                 Identitas pelapor hanya akan diketahui oleh guru BK dan tim profesional untuk keperluan bantuan.
               </p>
             </div>
             <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#00adb5] opacity-20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}