"use client";
import React, { useState } from 'react';
import { BookOpen, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useSession } from "next-auth/react";

// Bank data soal berisi tepat 10 pertanyaan untuk validasi Gaya Belajar (VAK)
const learningQuestions = [
  { 
    id: 2304, 
    text: "Kamu merasa mudah menghafal materi, jika...", 
    options: [
      { label: "Melihat gambar, bagan, atau membaca catatan ringkas yang rapi", category: "Visual" },
      { label: "Mendengarkan rekaman penjelasan suara atau penjelasan guru", category: "Auditory" },
      { label: "Sembari mempraktikkan gerakan, simulasi langsung, atau berjalan-jalan", category: "Kinesthetic" }
    ]
  },
  { 
    id: 2305, 
    text: "Kamu merasa kesulitan dalam mengikuti pelajaran di kelas, jika...", 
    options: [
      { label: "Memperhatikan papan tulis atau slide presentasi yang terlalu penuh tulisan kaku", category: "Visual" },
      { label: "Mendengarkan penjelasan guru yang terlalu panjang dan monoton tanpa diskusi", category: "Auditory" },
      { label: "Diminta untuk duduk tenang di kursi dalam waktu yang sangat lama", category: "Kinesthetic" }
    ]
  },
  { 
    id: 2306, 
    text: "Kamu biasanya jauh lebih mudah memahami sesuatu yang baru, dengan cara...", 
    options: [
      { label: "Melihat visualisasi, pemutaran video klip, atau demonstrasi contoh sesuatu", category: "Visual" },
      { label: "Mendengarkan jalannya diskusi kelompok atau instruksi audio verbal", category: "Auditory" },
      { label: "Langsung menyentuh objek fisik, melakukan bongkar pasang, atau mempraktikkannya", category: "Kinesthetic" }
    ]
  },
  { 
    id: 2392, 
    text: "Ketika di dalam kelas, aktivitas santai apa yang paling kamu sukai...", 
    options: [
      { label: "Mencatat rangkuman materi menggunakan spidol warna-warni atau menggambar skema", category: "Visual" },
      { label: "Bercerita dengan teman sebangku, mengajukan pertanyaan, atau mendengarkan cerita", category: "Auditory" },
      { label: "Melakukan simulasi fisik, kegiatan olahraga, atau eksperimen langsung di laboratorium", category: "Kinesthetic" }
    ]
  },
  {
    id: 2393,
    text: "Saat senggang atau sedang beristirahat, kamu lebih suka menghabiskan waktu untuk...",
    options: [
      { label: "Membaca komik, buku cerita bergambar, atau berselancar melihat foto di media sosial", category: "Visual" },
      { label: "Mendengarkan musik favorit, podcast audio, atau mengobrol santai bersama teman", category: "Auditory" },
      { label: "Bermain game aktif, berjalan-jalan di sekitar sekolah, atau membuat kerajinan tangan", category: "Kinesthetic" }
    ]
  },
  {
    id: 2394,
    text: "Apabila kamu sedang tersesat dan mencari suatu lokasi, kamu lebih suka dipandu dengan...",
    options: [
      { label: "Melihat peta digital secara mandiri atau penunjuk arah jalan berupa gambar", category: "Visual" },
      { label: "Mendengarkan petunjuk suara navigasi atau bertanya langsung kepada orang di sekitar", category: "Auditory" },
      { label: "Mengikuti insting jalan kaki langsung atau meminta seseorang mengantarkan ke lokasi", category: "Kinesthetic" }
    ]
  },
  {
    id: 2395,
    text: "Kamu cenderung paling mudah terganggu konsentrasi belajarnya ketika keadaan...",
    options: [
      { label: "Ruangan belajar berantakan, pencahayaan minim, atau visual dekorasi terlalu ramai", category: "Visual" },
      { label: "Suasana sekitar bising, banyak orang berbicara, atau ada suara gaduh yang mendengung", category: "Auditory" },
      { label: "Kondisi kursi belajar tidak nyaman atau suhu udara ruangan terlalu gerah untuk bergerak", category: "Kinesthetic" }
    ]
  },
  {
    id: 2396,
    text: "Saat kamu menceritakan suatu kejadian seru kepada temanmu, kamu biasanya...",
    options: [
      { label: "Fokus menjelaskan bentuk visual objek, warna, dan detail penampilan yang kamu lihat", category: "Visual" },
      { label: "Menirukan dialog suara orang, intonasi berbicara, atau detail ucapan kata-katanya", category: "Auditory" },
      { label: "Banyak menggunakan gerakan tangan, ekspresi fisik, dan memperagakan kejadiannya", category: "Kinesthetic" }
    ]
  },
  {
    id: 2397,
    text: "Ketika membeli buku baru atau perlengkapan sekolah, hal pertama yang menarik perhatianmu adalah...",
    options: [
      { label: "Desain sampul yang bagus, ilustrasi gambar yang menarik, atau warna yang mencolok", category: "Visual" },
      { label: "Penjelasan sinopsis yang dibacakan, rekomendasi teman, atau judul buku yang berbunyi unik", category: "Auditory" },
      { label: "Ketebalan kertas yang nyaman diraba, tekstur bahan, atau kelengkapan bonus fisiknya", category: "Kinesthetic" }
    ]
  },
  {
    id: 2398,
    text: "Saat guru memberikan instruksi tugas yang cukup rumit, kamu lebih menyukai jika guru...",
    options: [
      { label: "Menuliskannya dengan rapi di papan tulis atau memberikan modul panduan cetak", category: "Visual" },
      { label: "Menjelaskannya kembali secara lisan perlahan-lahan dalam sesi tanya jawab", category: "Auditory" },
      { label: "Memberikan contoh langsung langkah-langkah pengerjaannya melalui praktik simulasi", category: "Kinesthetic" }
    ]
  }
];

export default function LearningTestPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState(0); // 0: Start Gate, 1: Runtime Quiz, 2: Redirect Loading Screen
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const startTest = () => {
    setAnswers([]);
    setCurrentQ(0);
    setStep(1);
  };

  const handleAnswer = (category) => {
    const newAnswers = [...answers, { category, score: 5 }];
    setAnswers(newAnswers);

    if (currentQ < learningQuestions.length - 1) {
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
      const response = await fetch('/api/student/assessment/learningtest/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      
      if (response.ok) {
        const resData = await response.json();
        const targetId = resData?.resultId;

        if (targetId) {
          // KUNCI: Ubah step ke loading screen, lalu jalankan redirect murni menggunakan token ID dokumen baru
          setStep(2);
          window.location.href = `/dashboard/student/talent/learningtest/result/${targetId}`;
        } else {
          console.error("Token resultId tidak ditemukan di response:", resData);
          alert("ID Hasil analisis gaya belajar tidak ditemukan dari server.");
          window.location.href = '/dashboard/student/talent';
        }
      } else {
        alert("Gagal menyimpan hasil tes Gaya Belajar. Silakan coba kembali.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Gagal mengirim data transaksi tes gaya belajar ke database:", err);
      alert("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  // ── SCREEN 0: START GATE ──────────────────────────────────────────
  if (step === 0) return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-16 px-6">
      <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
        <BookOpen size={40} />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tes Gaya Belajar (VAK)</h1>
        <p className="text-slate-500 font-medium text-sm">Ketahui modalitas penyerapan informasimu: Visual, Auditori, atau Kinestetik</p>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed font-medium">
        Pilihlah satu pernyataan dari 10 pertanyaan berikut yang paling sesuai dan mewakili kebiasaan belajar harianmu.
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
          Mulai Tes Gaya Belajar <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  // ── SCREEN 1: RUNTIME QUIZ ────────────────────────────────────────
  if (step === 1) return (
    <div className="max-w-3xl mx-auto space-y-10 py-12 px-6">
      {/* Progress Bar Indikator */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>Progress Pengisian</span>
          <span>{currentQ + 1} dari {learningQuestions.length} Soal</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300" 
            style={{ width: `${((currentQ + 1) / learningQuestions.length) * 100}%` }} 
          />
        </div>
      </div>

      <div className="bg-white p-10 md:p-14 rounded-[40px] border border-slate-100 shadow-md text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500/20"></div>
        <span className="px-4 py-1.5 bg-blue-50 rounded-full text-xs font-bold text-blue-600">
          Gaya Belajar Assessment
        </span>
        <h2 className="text-xl font-bold text-slate-800 leading-snug max-w-2xl mx-auto">
          "{learningQuestions[currentQ]?.text}"
        </h2>
        
        {/* Render Opsi Pilihan Ganda A, B, C */}
        <div className="flex flex-col gap-4 pt-6 text-left">
          {learningQuestions[currentQ]?.options.map((opt, i) => (
            <button 
              key={i}
              onClick={() => handleAnswer(opt.category)}
              disabled={loading}
              className="p-5 border border-slate-200 hover:border-blue-500 rounded-2xl font-semibold text-slate-700 hover:bg-blue-50/30 transition-all text-sm text-left flex items-center gap-4 shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 shrink-0">
                {String.fromCharCode(65 + i)}
              </div>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center gap-2 text-sm font-semibold text-slate-400">
          <Loader2 className="animate-spin text-blue-500" size={18} />
          <span>Sedang menyimpan data ke modul analisis...</span>
        </div>
      )}
    </div>
  );

  // ── SCREEN 2: REDIRECTING LOADING VIEW (MENCEGAH FLASH SCREEN FINISH LAMA) ──
  return (
    <div className="max-w-2xl mx-auto text-center space-y-4 py-32 px-6 animate-pulse">
      <Loader2 className="animate-spin text-blue-500 mx-auto" size={44} />
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Menganalisis Pola Belajar...</h3>
        <p className="text-xs font-medium text-slate-400">Sedang mengalihkan Anda ke lembar hasil modalitas VAK EduMind.</p>
      </div>
    </div>
  );
}