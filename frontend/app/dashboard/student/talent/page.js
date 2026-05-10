"use client";
import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { useSession } from "next-auth/react"; // Tambahkan import session

// Data pertanyaan lengkap dari Google Doc
const originalQuestions = [
  { id: 1, category: "Logika & Riset", text: "Saya senang menganalisis pola angka atau data untuk menemukan solusi." },
  { id: 2, category: "Seni & Kreatif", text: "Saya suka mengekspresikan diri melalui desain visual, musik, atau tulisan kreatif." },
  { id: 3, category: "Sosial & Empati", text: "Saya merasa puas dan bahagia saat bisa membantu menyelesaikan masalah teman." },
  { id: 4, category: "Kepemimpinan", text: "Saya merasa percaya diri dan nyaman saat harus memimpin diskusi atau kelompok." },
  { id: 5, category: "Teknis & Praktis", text: "Saya lebih suka memperbaiki barang atau merakit sesuatu daripada sekadar membaca teorinya." },
  { id: 6, category: "Logika & Riset", text: "Saya suka mencari tahu alasan di balik cara kerja suatu hal melalui eksperimen." },
  { id: 7, category: "Seni & Kreatif", text: "Saya sering memiliki ide-ide baru yang berbeda dari orang lain dalam mengerjakan tugas." },
  { id: 8, category: "Sosial & Empati", text: "Menjadi pendengar yang baik bagi orang lain adalah salah satu kekuatan saya." },
  { id: 9, category: "Kepemimpinan", text: "Saya berani mengambil risiko untuk mencapai tujuan yang telah direncanakan." },
  { id: 10, category: "Teknis & Praktis", text: "Saya senang bekerja dengan alat-alat atau teknologi untuk menghasilkan karya nyata." },
];

export default function TalentAssessmentPage() {
  const { data: session } = useSession(); // Ambil data session
  const [step, setStep] = useState(0); // 0: Start, 1: Quiz, 2: Finish
  const [currentQ, setCurrentQ] = useState(0);
  const [questions, setQuestions] = useState([]); // State untuk menampung pertanyaan yang diacak
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fungsi untuk mengacak pertanyaan saat komponen dimuat atau saat mulai ulang
  const startAssessment = () => {
    const shuffled = [...originalQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setAnswers([]);
    setCurrentQ(0);
    setStep(1);
  };

  const handleAnswer = (score) => {
    const newAnswers = [...answers, { category: questions[currentQ].category, score }];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitAssessment(newAnswers);
    }
  };

  const submitAssessment = async (finalAnswers) => {
    // Tambahkan gate session sebelum submit
    if (!session?.user?.id) {
      alert("Sesi tidak ditemukan. Silakan login kembali.");
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/student/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      setStep(2);
    } catch (err) {
      console.error("Gagal submit asesmen:", err);
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
      <div className="w-20 h-20 bg-[#00adb5]/10 text-[#00adb5] rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-[#00adb5]/5">
        <Brain size={40} />
      </div>
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">EduMind Talent</h1>
        <p className="text-slate-500 font-bold tracking-wide text-sm">Kenali potensimu, rancang masa depanmu</p>
      </div>
      <p className="text-slate-600 leading-relaxed font-medium">
        Asesmen ini akan membantu memetakan bakat dominanmu berdasarkan minat dan gaya kerjamu. Tidak ada jawaban salah atau benar.
      </p>
      <button 
        onClick={startAssessment}
        className="px-10 py-5 bg-slate-900 text-white rounded-[25px] font-bold text-sm tracking-wide flex items-center gap-3 mx-auto hover:scale-105 transition-all shadow-2xl shadow-slate-200"
      >
        Mulai Asesmen <ArrowRight size={20} />
      </button>
    </div>
  );

  if (step === 1) return (
    <div className="max-w-3xl mx-auto space-y-12 py-10">
      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#00adb5] transition-all duration-500" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-sm text-center space-y-8">
        <span className="px-4 py-2 bg-slate-50 rounded-xl text-[11px] font-bold text-slate-400 tracking-widest uppercase">
          Pertanyaan {currentQ + 1} dari {questions.length}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
          "{questions[currentQ]?.text}"
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
          {[
            { label: "Sangat Tidak Setuju", score: 1 },
            { label: "Tidak Setuju", score: 2 },
            { label: "Setuju", score: 4 },
            { label: "Sangat Setuju", score: 5 },
          ].map((opt) => (
            <button 
              key={opt.label}
              onClick={() => handleAnswer(opt.score)}
              disabled={loading}
              className="p-6 border-2 border-slate-50 rounded-[24px] font-bold text-slate-600 hover:border-[#00adb5] hover:bg-[#00adb5]/5 hover:text-[#00adb5] transition-all flex items-center justify-center"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {loading && <div className="flex justify-center"><Loader2 className="animate-spin text-[#00adb5]" /></div>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-12 animate-in zoom-in duration-500">
      <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 size={56} />
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-slate-800">Asesmen Selesai!</h2>
        <p className="text-slate-500 font-medium">Bakatmu sedang dipetakan oleh AI EduMind.</p>
      </div>
      <div className="p-8 bg-amber-50 rounded-[30px] border border-amber-100 flex items-center gap-4 text-left">
        <Sparkles className="text-amber-500 shrink-0" size={32} />
        <p className="text-sm font-bold text-amber-900">
          Hasil pemetaan bakatmu kini tersedia di halaman "Progress Saya". Kamu bisa melihat jurusan dan karir yang direkomendasikan.
        </p>
      </div>
      <button 
        onClick={() => window.location.href = '/dashboard/student/progress'}
        className="px-10 py-5 bg-[#00adb5] text-white rounded-[25px] font-bold text-sm tracking-wide shadow-xl shadow-[#00adb5]/20"
      >
        Lihat Hasil Progres
      </button>
    </div>
  );
}