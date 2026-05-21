"use client";
import React, { useState } from 'react';
import { Brain, ArrowRight, CheckCircle2, Sparkles, Loader2, BookOpen, Activity, Award, ChevronRight } from 'lucide-react';
import { useSession } from "next-auth/react";

// Data pertanyaan asli bawaan tetap dipertahankan di sini
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

export default function IntegratedAssessmentCenterPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState(0); // 0: Menu Hub Center, 1: Talent Quiz, 2: Talent Finish
  const [currentQ, setCurrentQ] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fungsi internal bawaan asli untuk mengacak pertanyaan EduMind Talent Mapping
  const startTalentAssessment = () => {
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
    if (!session?.user?.id) {
      alert("Sesi tidak ditemukan. Silakan login kembali.");
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/student/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: "talent", answers: finalAnswers }),
      });
      setStep(2);
    } catch (err) {
      console.error("Gagal submit asesmen:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── MENU HUB CENTER (STEP 0) ───────────────────────────────────────
  if (step === 0) {
    const assessmentMenus = [
      {
        title: "1. EduMind Talent Mapping",
        desc: "Asesmen dasar kecenderungan bakat harian dan pemetaan gaya kerja aplikatif.",
        icon: <Award className="text-[#00adb5]" size={24} />,
        bgIcon: "bg-[#00adb5]/10",
        borderColor: "hover:border-[#00adb5]/30",
        action: startTalentAssessment // Menjalankan fungsi start internal bawaan asli
      },
      {
        title: "2. Minat Bakat (RIASEC)",
        desc: "Pemetaan rumpun karir profesional berdasarkan kecenderungan minat kepribadian kerja.",
        icon: <Sparkles className="text-amber-500" size={24} />,
        bgIcon: "bg-amber-50",
        borderColor: "hover:border-amber-200",
        action: () => { window.location.href = '/dashboard/student/talent/riasectest'; }
      },
      {
        title: "3. Gaya Belajar (VAK)",
        desc: "Menemukan metode penyerapan materi terbaik (Visual, Auditori, Kinestetik).",
        icon: <BookOpen className="text-blue-500" size={24} />,
        bgIcon: "bg-blue-50",
        borderColor: "hover:border-blue-200",
        action: () => { window.location.href = '/dashboard/student/talent/learningtest'; }
      },
      {
        title: "4. Dominasi Otak Kanan & Kiri",
        desc: "Mengukur keseimbangan cara berpikir logis matematis vs intuitif kreatif.",
        icon: <Activity className="text-purple-500" size={24} />,
        bgIcon: "bg-purple-50",
        borderColor: "hover:border-purple-200",
        action: () => { window.location.href = '/dashboard/student/talent/braintest'; }
      }
    ];

    return (
      <div className="max-w-5xl mx-auto py-12 px-6 space-y-12">
        {/* Header Dashboard Hub */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-[#00adb5]/10 text-[#00adb5] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Brain size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pusat Asesmen EduMind</h1>
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Powered by Educourse AI engine</p>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            Selamat datang, {session?.user?.name || "Siswa"}. Pilih salah satu instrumen asesmen terpadu di bawah ini untuk memulai analisis profil perkembangan belajarmu.
          </p>
        </div>

        {/* Grid Pilihan Menu Tombol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessmentMenus.map((menu, index) => (
            <div
              key={index}
              onClick={menu.action}
              className={`bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm ${menu.borderColor} transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5`}
            >
              <div className="space-y-6">
                <div className={`w-12 h-12 ${menu.bgIcon} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  {menu.icon}
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">{menu.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{menu.desc}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-slate-400 group-hover:text-[#00adb5] font-bold text-xs tracking-wide pt-8 transition-colors text-left">
                Mulai Evaluasi <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Informasi Aturan Pengisian */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left max-w-3xl mx-auto flex gap-4 items-center">
          <Sparkles className="text-[#00adb5] shrink-0" size={24} />
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            Masing-masing modul tes bersifat independen dan memiliki halaman pengisian terpisah. Rangkuman gabungan grafik hasil analisis akan ditampilkan secara otomatis pada halaman rekapitulasi utama perkembangan siswa.
          </p>
        </div>
      </div>
    );
  }

  // ── RUNTIME EVALUASI TALENT MAPPING ASLI (STEP 1) ───────────────────
  if (step === 1) return (
    <div className="max-w-3xl mx-auto space-y-12 py-10 px-6">
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
              className="p-6 border-2 border-slate-50 rounded-[24px] font-bold text-slate-600 hover:border-[#00adb5] hover:bg-[#00adb5]/5 hover:text-[#00adb5] transition-all flex items-center justify-center text-sm"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {loading && <div className="flex justify-center"><Loader2 className="animate-spin text-[#00adb5]" /></div>}
    </div>
  );

  // ── HALAMAN BERHASIL SUBMIT TALENT MAPPING ASLI (STEP 2) ─────────────
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-12 px-6 animate-in zoom-in duration-500">
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
      <div className="flex gap-4 justify-center">
        <button 
          onClick={() => setStep(0)} 
          className="px-6 py-5 bg-slate-100 text-slate-700 rounded-[25px] font-bold text-sm"
        >
          Kembali ke Dashboard Asesmen
        </button>
        <button 
          onClick={() => window.location.href = '/dashboard/student/progress'}
          className="px-10 py-5 bg-[#00adb5] text-white rounded-[25px] font-bold text-sm tracking-wide shadow-xl shadow-[#00adb5]/20"
        >
          Lihat Hasil Progres
        </button>
      </div>
    </div>
  );
}