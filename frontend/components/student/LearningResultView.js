"use client";
import React from 'react';
import { Award, BookOpen, CheckCircle2, Lightbulb, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Kamus data deskripsi Gaya Belajar VAK EduMind
const LEARNING_STYLE_DETAILS = {
  VISUAL: {
    title: "Gaya Belajar Visual (Spasial)",
    desc: "Kamu lebih mudah menyerap informasi melalui apa yang kamu lihat. Diagram, grafik, gambar, slide presentasi, dan video pembelajaran adalah media terbaik untuk membantumu memahami materi pelajaran.",
    tips: [
      "Gunakan spidol warna-warni (stabilo) saat membuat catatan rangkuman.",
      "Petakan materi pelajaran yang rumit ke dalam bentuk Mind Mapping atau skema visual.",
      "Duduk di barisan depan kelas agar pandangan ke papan tulis tidak terhalang."
    ],
    color: "#3b82f6" // Blue
  },
  AUDITORY: {
    title: "Gaya Belajar Auditori (Audio)",
    desc: "Kamu mengandalkan pendengaran sebagai jalur utama menyerap ilmu. Penjelasan lisan guru, sesi diskusi, podcast edukasi, dan mendengarkan penjelasan ulang adalah cara belajar paling efektif untukmu.",
    tips: [
      "Baca materi pelajaran atau catatanmu dengan suara keras saat menghafal.",
      "Rekam penjelasan guru di kelas, lalu dengarkan kembali saat di rumah.",
      "Gunakan teknik belajar berdiskusi aktif atau tanya jawab bersama teman."
    ],
    color: "#f59e0b" // Amber
  },
  KINESTHETIC: {
    title: "Gaya Belajar Kinestetik (Fisik)",
    desc: "Kamu belajar paling cepat melalui praktik langsung, menyentuh objek secara nyata, dan melibatkan gerakan fisik. Duduk diam terlalu lama di kelas justru sering membuat fokus belajarmu menurun.",
    tips: [
      "Belajar atau menghafal materi sembari berjalan santai di dalam ruangan.",
      "Perbanyak simulasi, eksperimen laboratorium, atau rakit objek replika.",
      "Gunakan jeda belajar pendek (Teknik Pomodoro) untuk sekadar meregangkan otot tubuh."
    ],
    color: "#ec4899" // Pink
  }
};

export default function LearningResultView({ isCompleted, scores, hasilDominan, completedAt }) {
  
  if (!isCompleted || !scores || !hasilDominan) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-center max-w-2xl mx-auto">
        <p className="text-sm font-semibold text-red-900">
          Data evaluasi gaya belajar tidak lengkap atau belum selesai dikerjakan.
        </p>
      </div>
    );
  }

  // Ambil profil data statis berdasarkan kategori dominan hasil submit backend
  const activeCategory = hasilDominan.category?.toUpperCase() || "VISUAL";
  const profile = LEARNING_STYLE_DETAILS[activeCategory] || LEARNING_STYLE_DETAILS.VISUAL;

  // Format data scores agar kompatibel dan mulus dirender oleh Recharts
  const chartData = scores.map(item => ({
    name: item.category === "AUDITORY" ? "Auditori" : item.category === "KINESTHETIC" ? "Kinestetik" : "Visual",
    Skor: item.value,
    rawKey: item.category?.toUpperCase()
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-10 text-left px-4">
      
      {/* 1. Header Banner Dominasi Hasil */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-10 rounded-[32px] shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
          <BookOpen size={240} />
        </div>
        <div className="space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00adb5]/10 text-[#00adb5] rounded-lg text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 size={14} /> Asesmen VAK Selesai
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Gaya Belajar Dominanmu adalah <span className="text-[#00adb5]">{profile.title.split(' ')[2]}</span>
          </h2>
          <p className="text-sm text-slate-400 font-medium max-w-2xl leading-relaxed">
            {profile.desc}
          </p>
          {completedAt && (
            <div className="text-[11px] text-slate-500 font-medium pt-2">
              Dikerjakan pada: {new Date(completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Grid Visualisasi Grafik & Tips Belajar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Kolom Grafik Batang (Metode Recharts) */}
        <div className="md:col-span-3 bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Award size={18} className="text-blue-500" />
              Perbandingan Skor Modalitas
            </h3>
            <p className="text-xs text-slate-400 font-medium">Grafik akumulasi nilai penyerapan materi harian siswa.</p>
          </div>

          <div className="w-full h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} fontStyle="bold" tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 50]} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="Skor" radius={[8, 8, 0, 0]} barSize={45}>
                  {chartData.map((entry, index) => {
                    const matchedProfile = LEARNING_STYLE_DETAILS[entry.rawKey];
                    return (
                      <Cell key={`cell-${index}`} fill={matchedProfile ? matchedProfile.color : '#00adb5'} />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kolom Strategi/Tips Belajar Efektif */}
        <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" />
              Tips Belajar Efektif
            </h3>
            <p className="text-xs text-slate-400 font-medium">Rekomendasi taktik belajar ditenagai AI Educourse.</p>
          </div>

          <div className="space-y-4">
            {profile.tips.map((tip, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-[#00adb5]/10 group-hover:text-[#00adb5] transition-colors shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed text-left">
                  {tip}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 items-center">
            <Zap className="text-blue-500 shrink-0" size={20} />
            <p className="text-[11px] font-semibold text-slate-500 leading-normal text-left">
              Gunakan rekomendasi taktik ini di rumah maupun sekolah untuk mengoptimalkan efisiensi belajarmu!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}