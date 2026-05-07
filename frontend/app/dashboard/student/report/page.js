"use client";
import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Users, 
  Upload, 
  Send,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function StudentReportPage() {
  const [submitted, setSubmitted] = useState(false);

  // Opsi Jenis Kejadian [cite: 382, 388-391]
  const incidentTypes = ["Verbal Bullying", "Physical Bullying", "Cyberbullying", "Social Exclusion", "Lainnya"];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Logika integrasi ke API reporting Anda
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 shadow-inner">
          <CheckCircle2 size={60} />
        </div>
        <h2 className="text-3xl font-black text-slate-800">Laporan Terkirim</h2>
        <p className="max-w-md text-slate-500 font-medium">
          Terima kasih sudah berani melapor. Tim guru BK akan segera meninjau laporanmu dengan sangat rahasia. Kamu tidak sendirian.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="px-8 py-3 bg-primary text-white rounded-2xl font-bold transition-transform hover:scale-105 shadow-lg shadow-primary/20"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION [cite: 336-339] */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Lapor Kejadian</h2>
        <p className="text-slate-500 font-medium italic">Privasi dan keamananmu adalah prioritas kami. Semua laporan dienkripsi secara ketat.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FORM SECTION [cite: 381-386] */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
          
          {/* Jenis Kejadian [cite: 382, 387-391] */}
          <div className="space-y-4">
            <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-500" /> Jenis Kejadian
            </label>
            <div className="grid grid-cols-2 gap-3">
              {incidentTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className="px-4 py-3 rounded-2xl border-2 border-slate-50 text-slate-600 text-sm font-bold hover:border-primary/30 hover:bg-slate-50 transition-all text-left focus:border-primary focus:bg-primary/5 outline-none"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Lokasi & Waktu [cite: 383-384] */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={16} /> Lokasi Kejadian
              </label>
              <input 
                type="text" 
                placeholder="Misal: Kantin, Lab, Sosmed"
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} /> Waktu Kejadian
              </label>
              <input 
                type="text" 
                placeholder="Kapan ini terjadi?"
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all"
              />
            </div>
          </div>

          {/* Deskripsi [cite: 385] */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={16} /> Siapa yang terlibat?
            </label>
            <textarea 
              rows="4"
              placeholder="Ceritakan sedikit kronologinya..."
              className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[30px] outline-none font-medium text-sm transition-all resize-none"
            />
          </div>

          {/* Upload Bukti [cite: 386] */}
          <div className="p-8 border-2 border-dashed border-slate-100 rounded-[30px] flex flex-col items-center justify-center gap-4 hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-primary transition-colors">
              <Upload size={32} />
            </div>
            <p className="text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Upload bukti foto atau tangkapan layar (Opsional)</p>
          </div>

          {/* Submit Button [cite: 392-393] */}
          <button 
            type="submit"
            className="w-full py-5 bg-primary text-white rounded-[25px] font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
          >
            <Send size={20} /> Kirim Laporan
          </button>
        </form>

        {/* SIDEBAR INFO [cite: 377-378, 504-505] */}
        <div className="space-y-8">
          <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 space-y-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
              <AlertCircle size={24} />
            </div>
            <h4 className="font-bold text-red-600">Catatan Keamanan</h4>
            <p className="text-xs text-red-500 leading-relaxed font-semibold uppercase tracking-tight">
              Jika kejadian melibatkan ancaman fisik segera atau bahaya nyata, tolong segera temui guru atau orang dewasa yang kamu percayai secara langsung. 
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-4 relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="font-bold text-lg mb-2">Anonimitas Kamu Aman 🔒</h4>
               <p className="text-sm opacity-70 leading-relaxed font-medium">
                 Identitasmu hanya akan diketahui oleh guru BK dan psikolog profesional untuk keperluan bantuan. [cite: 139, 270]
               </p>
             </div>
             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary opacity-20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}