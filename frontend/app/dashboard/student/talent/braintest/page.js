"use client";
import React, { useState } from 'react';
import { Activity, ArrowRight, Loader2, ArrowLeft, Brain, HelpCircle, CheckCircle } from 'lucide-react';
import { useSession } from "next-auth/react";

// 30 Pertanyaan Terpilih Hasil Ekstraksi Dataset Excel Otak Kanan Kiri
const brainQuestions = [
  { id: 252, category: "Otak Kiri", text: "Pertanyaan yang sering saya tanyakan dalam kepala adalah: 'Bagaimana seharusnya ini dikerjakan secara sistematis?'" },
  { id: 251, category: "Otak Kanan", text: "Ketika seorang berbicara, saya lebih fokus memperhatikan bahasa tubuh dan gerak-gerik mereka daripada kata-katanya." },
  { id: 226, category: "Otak Kanan", text: "Saya memiliki kepribadian atau cara penyelesaian masalah yang imajinatif dan kreatif." },
  { id: 225, category: "Otak Kanan", text: "Saya sangat menyukai aktivitas seni bebas, ilustrasi kreatif, atau mendengarkan aransemen musik." },
  { id: 224, category: "Otak Kanan", text: "Saya cenderung tidak menyukai tipe soal ujian sekolah yang berbentuk pilihan ganda rumit." },
  { id: 223, category: "Otak Kiri", text: "Saya merupakan seorang pengingat nama orang, angka detail, rumus matematika, atau tanggal sejarah yang baik." },
  { id: 222, category: "Otak Kiri", text: "Saya tidak suka jika sebuah opini atau pendapat disampaikan kepada saya seolah-olah sebagai fakta data." },
  { id: 221, category: "Otak Kiri", text: "Saya lebih menyukai lingkungan kerja atau belajar yang memiliki aturan, struktur, dan arahan jadwal yang jelas." },
  { id: 220, category: "Otak Kanan", text: "Saya merasa lebih mudah mengekspresikan ide pemikiran saya melalui gambar, grafik, sketsa, atau simbol visual." },
  { id: 219, category: "Otak Kanan", text: "Saya sering mengandalkan firasat, insting, atau intuisi spontan saat harus mengambil keputusan cepat." },
  { id: 218, category: "Otak Kiri", text: "Saya sangat menyukai hal-hal yang terorganisir dengan rapi, terencana matang, dan terjadwal secara berkala." },
  { id: 217, category: "Otak Kiri", text: "Saya merasa lebih nyaman dan fokus saat menganalisis masalah yang berhubungan dengan angka fakta dan logika pasti." },
  { id: 216, category: "Otak Kanan", text: "Saya lebih suka melihat gambaran besar (holistik) dari suatu rencana pekerjaan terlebih dahulu daripada meributkan rincian kecilnya." },
  { id: 215, category: "Otak Kanan", text: "Saya merasa mudah terhanyut secara emosional ketika menonton film drama, membaca novel fiksi, atau mendengarkan lagu puitis." },
  { id: 214, category: "Otak Kiri", text: "Saya selalu mengutamakan objektivitas analitis dan akal sehat logis di atas perasaan pribadi dalam berargumen." },
  { id: 213, category: "Otak Kiri", text: "Saya lebih memilih membaca instruksi manual tertulis secara urut sebelum mulai merakit barang baru." },
  { id: 212, category: "Otak Kanan", text: "Saya senang mencoba metode eksperimen baru yang spontan dan menantang, meskipun belum teruji keamanannya." },
  { id: 211, category: "Otak Kanan", text: "Saya seringkali menemukan inspirasi atau solusi pemecahan masalah secara tidak sengaja di saat sedang santai melamun." },
  { id: 210, category: "Otak Kiri", text: "Saya merasa risih dan tidak tenang jika harus bekerja di dalam lingkungan tim yang tidak memiliki kejelasan pembagian tugas." },
  { id: 209, category: "Otak Kiri", text: "Saya lebih mudah berkonsentrasi belajar di dalam ruangan yang hening, tenang, dan tertata rapi." },
  { id: 208, category: "Otak Kanan", text: "Saya menikmati kebebasan berkreasi tanpa batasan aturan kaku dan menyukai dekorasi ruangan yang bervariasi warna." },
  { id: 207, category: "Otak Kanan", text: "Saya menganggap diri saya sebagai orang yang fleksibel, santai, mudah beradaptasi, dan menyukai kejutan baru." },
  { id: 206, category: "Otak Kiri", text: "Saya terbiasa mencatat poin-poin penting harian dalam bentuk teks tertulis yang berurutan secara sistemik kronologis." },
  { id: 205, category: "Otak Kiri", text: "Saya merasa tertantang dan puas jika berhasil memecahkan teka-teki logika, sandi rumit, atau hitungan matematika tingkat lanjut." },
  { id: 204, category: "Otak Kanan", text: "Saya lebih suka belajar kelompok secara santai berdiskusi interpersonal daripada membaca buku teks pelajaran sendirian." },
  { id: 203, category: "Otak Kanan", text: "Saya menyukai tantangan untuk memikirkan ide-ide out-of-the-box yang belum pernah terpikirkan oleh rekan sekelompok saya." },
  { id: 202, category: "Otak Kiri", text: "Saya cenderung berhati-hati, penuh perhitungan risiko, dan memikirkan sebab-akibat secara mendalam sebelum melangkah." },
  { id: 201, category: "Otak Kiri", text: "Saya menyukai mata pelajaran yang memiliki kepastian jawaban mutlak (seperti Sains dan Akuntansi) dibandingkan subjek interpretatif." },
  { id: 200, category: "Otak Kanan", text: "Saya lebih mengagumi keindahan estetika seni desain suatu produk daripada menghafal spesifikasi teknis di lembar kertas." },
  { id: 199, category: "Otak Kiri", text: "Saya merasa bangga jika tugas-tugas saya selesai tepat waktu sesuai dengan target jadwal rencana yang saya buat." }
];

export default function BrainTestPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState(0); 
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const startTest = () => {
    setAnswers([]);
    setCurrentQ(0);
    setStep(1);
  };

  const handleAnswer = (value) => {
    const score = value === "ya" ? 5 : 1;
    const newAnswers = [...answers, { category: brainQuestions[currentQ].category, score }];
    setAnswers(newAnswers);

    if (currentQ < brainQuestions.length - 1) {
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
      const response = await fetch('/api/student/assessment/braintest/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      
      if (response.ok) {
        const resData = await response.json();
        const targetId = resData?.resultId;

        if (targetId) {
          setStep(2); 
          window.location.href = `/dashboard/student/talent/braintest/result/${targetId}`;
        } else {
          console.error("Token resultId tidak ditemukan di response:", resData);
          alert("ID Hasil analisis tidak ditemukan dari server.");
          window.location.href = '/dashboard/student/talent';
        }
      } else {
        alert("Gagal menyimpan hasil tes dominasi otak. Silakan coba kembali.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Gagal mengirim data transaksi tes otak ke database:", err);
      alert("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  // ── SCREEN 0: START GATE ──────────────────────────────────────────
  if (step === 0) return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-16 px-6">
      <div className="w-20 h-20 bg-purple-50 text-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
        <Brain size={40} />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tes Dominasi Belahan Otak</h1>
        <p className="text-slate-500 font-medium text-sm">Ukur tingkat keseimbangan cara berpikir rasional-analitis vs intuitif-kreatif</p>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed font-medium">
        Jawablah 30 pertanyaan evaluasi berikut secara natural dengan memilih opsi "YA" jika sesuai kecenderungan pemikiran pribadimu, atau "TIDAK" jika kurang sesuai.
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
          Mulai Analisis Otak <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  // ── SCREEN 1: RUNTIME QUIZ ────────────────────────────────────────
  if (step === 1) return (
    <div className="max-w-3xl mx-auto space-y-10 py-12 px-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <Activity size={14} className="text-purple-500 animate-pulse" />
            Progress Pengisian Asesmen
          </span>
          <span>{currentQ + 1} dari {brainQuestions.length} Soal</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-500 transition-all duration-300" 
            style={{ width: `${((currentQ + 1) / brainQuestions.length) * 100}%` }} 
          />
        </div>
      </div>

      <div className="bg-white p-10 md:p-14 rounded-[40px] border border-slate-100 shadow-md text-center space-y-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-500/20"></div>
        <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-purple-50 rounded-full text-xs font-bold text-purple-600">
          <HelpCircle size={12} /> Braintest
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed max-w-2xl mx-auto px-2">
          "{brainQuestions[currentQ]?.text}"
        </h2>
        
        {/* UPDATE: Ukuran Opsi Tombol Diperbesar (py-6, text-base, font-extrabold, hover scale) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 max-w-md mx-auto">
          {["ya", "tidak"].map((opt) => (
            <button 
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={loading}
              className="py-6 px-8 border-2 border-slate-200 hover:border-purple-500 rounded-3xl font-extrabold text-slate-700 hover:bg-purple-50/30 hover:text-purple-600 disabled:opacity-50 transition-all text-base uppercase tracking-widest shadow-sm flex items-center justify-center gap-3 group hover:scale-[1.02] active:scale-[0.98]"
            >
              {opt === "ya" && <CheckCircle size={18} className="text-slate-400 group-hover:text-purple-500 transition-colors shrink-0" />}
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center gap-2 text-sm font-semibold text-slate-400">
          <Loader2 className="animate-spin text-purple-500" size={18} />
          <span>Sedang menghitung rasio dominasi hemisfer...</span>
        </div>
      )}
    </div>
  );

  // ── SCREEN 2: REDIRECTING LOADING VIEW ──
  return (
    <div className="max-w-2xl mx-auto text-center space-y-4 py-32 px-6 animate-pulse">
      <Loader2 className="animate-spin text-purple-500 mx-auto" size={44} />
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Kalkulasi Struktur Neurologis...</h3>
        <p className="text-xs font-medium text-slate-400">Sedang mengalihkan Anda ke lembar pemetaan dominasi otak EduMind.</p>
      </div>
    </div>
  );
}