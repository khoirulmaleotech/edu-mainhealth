"use client";
import React from 'react';
import { RIASEC_DETAILS } from '@/constants/riasecData';
import { Award, BookOpen, Briefcase, AlertCircle } from 'lucide-react';

export default function RiasecResultView({ isCompleted, peringkat1, peringkat2, rekomendasi, keyword }) {
  
  // 1. Validasi Jika Belum Menyelesaikan Tes
  if (!isCompleted) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex gap-4 items-center max-w-2xl mx-auto">
        <AlertCircle className="text-red-500 shrink-0" size={24} />
        <p className="text-sm font-semibold text-red-900 leading-relaxed">
          Maaf, Anda belum menyelesaikan semua kategori dalam penilaian tes RIASEC. Silakan selesaikan seluruh pertanyaan terlebih dahulu.
        </p>
      </div>
    );
  }

  // 2. Jika Ada Rekomendasi Khusus Berbasis AI Kustom (Sesuai Logic Lama)
  if (rekomendasi) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-left">
        <h2 className="text-xl font-bold text-slate-800">Hasil Analisis Minat Karir</h2>
        <div className="p-4 bg-slate-50 rounded-xl font-bold text-[#00adb5]">
          Hasil Dominan: {keyword}
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Rekomendasi Jurusan Utama</h4>
          <p className="text-base font-bold text-slate-800">{rekomendasi.nama}</p>
        </div>
        <div 
          className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100 font-medium"
          dangerouslySetInnerHTML={{ __html: rekomendasi.keterangan }} 
        />
      </div>
    );
  }

  // 3. Ambil Konten Statis Berdasarkan Peringkat Kategori
  const p1Data = RIASEC_DETAILS[peringkat1?.category?.toUpperCase()];
  const p2Data = RIASEC_DETAILS[peringkat2?.category?.toUpperCase()];

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left py-6 px-4">
      {/* Ringkasan Skor Teratas */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center gap-3">
        <Award className="text-[#00adb5]" size={28} />
        <p className="text-sm font-medium">
          Kombinasi Tipe Karir Anda: <span className="font-bold text-[#00adb5] text-base">{peringkat1?.category}</span> dan <span className="font-bold text-[#00adb5] text-base">{peringkat2?.category}</span>
        </p>
      </div>

      {/* Grid Penjelasan Peringkat 1 & Peringkat 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[p1Data, p2Data].map((profile, idx) => {
          if (!profile) return null;
          return (
            <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <span className="px-3 py-1 bg-[#00adb5]/10 text-[#00adb5] rounded-lg text-xs font-bold uppercase tracking-wider">
                  Prioritas {idx + 1}
                </span>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight border-b border-slate-50 pb-2">
                  {profile.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {profile.desc}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                {/* Bagian Jurusan */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wide">
                    <BookOpen size={14} className="text-blue-500" />
                    <span>Rekomendasi Jurusan Kuliah:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.majors.map((major, mIdx) => (
                      <span key={mIdx} className="text-xs font-semibold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100">
                        {major}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bagian Bidang Karir */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wide">
                    <Briefcase size={14} className="text-amber-500" />
                    <span>Bidang Karir yang Sesuai:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-500 space-y-1 font-medium pl-1">
                    {profile.careers.map((career, cIdx) => (
                      <li key={cIdx}>{career}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}