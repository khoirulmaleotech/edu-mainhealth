"use client";
import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useSession } from "next-auth/react";

// 24 Pertanyaan Lengkap Hasil Ekstraksi Data Excel/CSV Bapak
const riasecQuestions = [
  { id: 2319, category: "ENTERPRISING", text: "Apakah kamu suka bercerita di depan kelas?" },
  { id: 2289, category: "SOSIAL", text: "Apakah kamu senang berkenalan dengan teman baru?" },
  { id: 2288, category: "KONVENSIONAL", text: "Apakah kamu suka menyiapkan buku pelajaran sendiri?" },
  { id: 2287, category: "KONVENSIONAL", text: "Apakah kamu mencatat pelajaran di kelas secara rutin?" },
  { id: 2286, category: "ENTERPRISING", text: "Apakah kamu suka mengajak teman bermain game?" },
  { id: 2285, category: "KONVENSIONAL", text: "Kalau kamu mau mandi/pakai baju, apakah kamu senang kalau dikasih petunjuk oleh orang tua?" },
  { id: 2284, category: "SOSIAL", text: "Apakah kamu suka mengerjakan PR bersama teman?" },
  { id: 2283, category: "ARTISTIK", text: "Apakah kamu suka belajar seni budaya (art) di sekolah?" },
  { id: 2282, category: "ARTISTIK", text: "Apakah kamu suka bermain alat musik?" },
  { id: 2281, category: "INVESTIGATIF", text: "Apakah kamu suka bereksperimen (contoh : mencampur teh dengan kopi atau susu)?" },
  { id: 2280, category: "INVESTIGATIF", text: "Apakah kamu tertarik mengikuti kursus matematika?" },
  { id: 2279, category: "ARTISTIK", text: "Apakah kamu suka melakukan kegiatan menggambar?" },
  { id: 2278, category: "REALISTIK", text: "Apakah kamu suka membuat sesuatu dari kertas atau kayu?" },
  { id: 2277, category: "REALISTIK", text: "Apakah kamu tertarik mengikuti kursus robotik?" },
  { id: 2276, category: "ENTERPRISING", text: "Apakah kamu suka menjadi ketua kelompok?" },
  { id: 2274, category: "SOSIAL", text: "Apakah kamu suka membantu orang lain?" },
  { id: 2273, category: "ARTISTIK", text: "Apakah kamu suka membaca cerita bergambar/komik?" },
  { id: 2272, category: "INVESTIGATIF", text: "Apakah kamu suka menyelesaikan hitung-hitungan?" },
  { id: 2271, category: "REALISTIK", text: "Apakah kamu suka menyusun puzzle?" },
  { id: 2270, category: "KONVENSIONAL", text: "Apakah kamu suka membersihkan tempat tidur atau meja belajar?" },
  { id: 2269, category: "ENTERPRISING", text: "Apakah orang tua kamu suka menerima ajakanmu untuk pergi ke suatu tempat?" },
  { id: 2268, category: "SOSIAL", text: "Apakah kamu suka mengobrol dengan teman-teman?" },
  { id: 2267, category: "INVESTIGATIF", text: "Apakah kamu suka bermain game online (misalnya Minecraft/Roblox)?" },
  { id: 2266, category: "REALISTIK", text: "Apakah kamu suka memperbaiki barang atau mainan kamu yang rusak?" }
];

export default function RiasecTestPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState(0); // 0: Start Gate, 1: Runtime Quiz, 2: Redirecting Loading
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const startTest = () => {
    setAnswers([]);
    setCurrentQ(0);
    setStep(1);
  };

  const handleAnswer = (value) => {
    const score = value === "Ya" ? 5 : 1;
    const newAnswers = [...answers, { category: riasecQuestions[currentQ].category, score }];
    setAnswers(newAnswers);

    if (currentQ < riasecQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitTest(newAnswers);
    }
  };

  const submitTest = async (finalAnswers) => {
    if (!session?.user?.id) {
      alert("Sesi tidak ditemukan. Silakan login kembali.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/student/assessment/riasectest/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      
      if (response.ok) {
        const resData = await response.json();
        
        // Menangkap parameter token resultId aman dari backend
        const targetId = resData?.resultId;

        if (targetId && targetId !== "[object Object]") {
          setStep(2); // Alihkan view ke screen loading transisi murni
          window.location.href = `/dashboard/student/talent/riasectest/result/${targetId}`;
        } else {
          console.error("Gagal mendeteksi string token ID dari response backend:", resData);
          alert("ID Hasil analisis tidak ditemukan dari server. Mengalihkan ke dashboard utama.");
          window.location.href = '/dashboard/student/talent';
        }
      } else {
        alert("Gagal menyimpan hasil tes RIASEC. Silakan coba lagi.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Gagal mengirim data transaksi tes RIASEC ke database:", err);
      alert("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  // ── SCREEN 0: START GATE ──────────────────────────────────────────
  if (step === 0) return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-16 px-6">
      <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto">
        <Sparkles size={40} />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tes Minat Bakat RIASEC</h1>
        <p className="text-slate-500 font-medium text-sm">Temukan kecenderungan tipe kepribadian kerja dan karir idealmu</p>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed font-medium">
        Jawablah 24 pertanyaan berikut dengan memilih "Ya" jika sesuai dengan minat harianmu, atau "Tidak" jika dirasa tidak sesuai.
      </p>
      <div className="flex gap-4 justify-center">
        <button 
          onClick={() => window.location.href = '/dashboard/student/talent'} 
          className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <button 
          onClick={startTest} 
          className="px-10 py-4 bg-slate-950 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          Mulai Tes RIASEC <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  // ── SCREEN 1: RUNTIME QUIZ ────────────────────────────────────────
  if (step === 1) return (
    <div className="max-w-3xl mx-auto space-y-10 py-12 px-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>Progress Pengisian</span>
          <span>{currentQ + 1} dari {riasecQuestions.length} Soal</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all duration-300" 
            style={{ width: `${((currentQ + 1) / riasecQuestions.length) * 100}%` }} 
          />
        </div>
      </div>

      <div className="bg-white p-10 md:p-14 rounded-[40px] border border-slate-100 shadow-md text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500/20"></div>
        <span className="px-4 py-1.5 bg-amber-50 rounded-full text-xs font-bold text-amber-600">
          Dimensi: {riasecQuestions[currentQ]?.category}
        </span>
        <h2 className="text-2xl font-bold text-slate-800 leading-snug max-w-2xl mx-auto">
          "{riasecQuestions[currentQ]?.text}"
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 max-w-md mx-auto">
          {["Ya", "Tidak"].map((opt) => (
            <button 
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={loading}
              className="p-5 border border-slate-200 hover:border-amber-500 rounded-2xl font-bold text-slate-600 hover:bg-amber-50/50 hover:text-amber-600 disabled:opacity-50 transition-all text-base shadow-sm"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center gap-2 text-sm font-semibold text-slate-400">
          <Loader2 className="animate-spin text-amber-500" size={18} />
          <span>Sedang menyimpan data ke modul analisis...</span>
        </div>
      )}
    </div>
  );

  // ── SCREEN 2: REDIRECTING LOADING VIEW (PENGGANTI SCREEN FINISH LAMA) ──
  return (
    <div className="max-w-2xl mx-auto text-center space-y-4 py-32 px-6 animate-pulse">
      <Loader2 className="animate-spin text-[#00adb5] mx-auto" size={44} />
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Menganalisis Jawaban...</h3>
        <p className="text-xs font-medium text-slate-400">Sedang mengalihkan Anda ke lembar hasil rekomendasi EduMind.</p>
      </div>
    </div>
  );
}