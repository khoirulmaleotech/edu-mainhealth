"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ArrowRight, ClipboardList, Loader2, CheckCircle2, ShieldCheck, ChevronLeft } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const questions = [
  { id: 1,  text: "Kurang berminat atau bergairah untuk melakukan aktivitas sehari-hari." },
  { id: 2,  text: "Merasa terpuruk, tertekan, atau kehilangan harapan." },
  { id: 3,  text: "Kesulitan tidur, tidak bisa tidur nyenyak, atau justru terlalu banyak tidur." },
  { id: 4,  text: "Merasa lelah atau kekurangan tenaga meski sudah beristirahat." },
  { id: 5,  text: "Kurang nafsu makan atau justru makan jauh lebih banyak dari biasanya." },
  { id: 6,  text: "Merasa buruk tentang diri sendiri — seolah gagal atau mengecewakan orang-orang terdekat." },
  { id: 7,  text: "Sulit berkonsentrasi saat belajar, membaca, atau mengerjakan sesuatu." },
  { id: 8,  text: "Bergerak atau berbicara lebih lambat hingga orang lain menyadarinya, atau justru lebih gelisah dan tidak bisa diam." },
  { id: 9,  text: "Adanya pikiran untuk menyakiti diri sendiri.", sensitive: true },
  { id: 10, text: "Adanya pikiran untuk melukai orang lain.", sensitive: true },
];

const openEndedQuestions = [
  {
    id: "feelings",
    label: "Perasaan atau Emosi",
    hint: "Perasaan atau emosi apa yang belakangan ini mengganggu kenyamanan Anda?",
    placeholder: "Ceritakan di sini…",
  },
  {
    id: "thoughts",
    label: "Pikiran",
    hint: "Pikiran apa yang sering muncul dan terasa mengganggu ketenangan Anda?",
    placeholder: "Ceritakan di sini…",
  },
  {
    id: "behaviors",
    label: "Perilaku",
    hint: "Adakah perilaku diri sendiri atau tindakan orang lain yang memengaruhi kesejahteraan Anda?",
    placeholder: "Ceritakan di sini…",
  },
];

// Color spectrum: calm (teal) → mild (blue) → moderate (orange) → frequent (rose)
const scaleOptions = [
  {
    score: 0,
    label: "Tidak Pernah sama sekali",
    sub: "Tidak pernah terjadi",
    days: "0 hari",
    solid: "#2dd4bf",
    tint: "#f0fdfa",
    border: "#99f6e4",
  },
  {
    score: 1,
    label: "Beberapa Hari",
    sub: "Sesekali, 1–6 hari",
    days: "1–6 hari",
    solid: "#60a5fa",
    tint: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    score: 2,
    label: "Lebih dari Seminggu",
    sub: "Cukup sering, 7–10 hari",
    days: "7–10 hari",
    solid: "#fb923c",
    tint: "#fff7ed",
    border: "#fed7aa",
  },
  {
    score: 3,
    label: "Hampir Setiap Hari",
    sub: "Sangat sering, 11–14 hari",
    days: "11–14 hari",
    solid: "#f43f5e",
    tint: "#fff1f2",
    border: "#fecdd3",
  },
];

// ─── Shared Legend ─────────────────────────────────────────────────────────────

function ScaleLegend({ size = "md" }) {
  const dim = size === "sm" ? 36 : 48;
  return (
    <div className="flex items-end justify-center gap-4 md:gap-8 flex-wrap">
      {scaleOptions.map((opt) => (
        <div key={opt.score} className="flex flex-col items-center gap-2">
          <div
            className="rounded-full shadow-sm"
            style={{ width: dim, height: dim, backgroundColor: opt.solid }}
          />
          <span className="text-[11px] font-bold text-slate-500 text-center leading-tight max-w-[72px]">
            {opt.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Welcome Screen ────────────────────────────────────────────────────────────

function WelcomeScreen({ onStart }) {
  return (
    <div className="max-w-xl mx-auto py-14 px-4 space-y-10 animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-2xl bg-[#00adb5]/10 flex items-center justify-center mx-auto">
        <ClipboardList size={30} className="text-[#00adb5]" />
      </div>

      <div className="text-center space-y-2">
        <p className="text-xs font-bold tracking-widest text-[#00adb5] uppercase">Asesmen Kesehatan Mental</p>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Tilik Diri</h1>
        <p className="text-slate-400 text-sm font-medium">Kenali kondisimu, ambil langkah yang tepat</p>
      </div>

      <div className="bg-slate-50 rounded-3xl p-7 space-y-4 border border-slate-100">
        <p className="text-slate-600 text-sm leading-relaxed">
          Mengenali kondisi diri adalah langkah pertama yang berani. Asesmen Tilik Diri dirancang untuk membantu kamu
          menilai bagaimana keadaanmu dalam dua minggu terakhir — apakah ada hal-hal yang perlu mendapat perhatian
          lebih.
        </p>
        <p className="text-slate-600 text-sm leading-relaxed">
          Terdiri dari <strong className="text-slate-700">10 pertanyaan tertutup</strong> dan{" "}
          <strong className="text-slate-700">3 pertanyaan terbuka</strong>, umumnya selesai dalam{" "}
          <strong className="text-slate-700">10–15 menit</strong>.
        </p>
      </div>

      <div className="flex items-start gap-3 bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
        <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-emerald-800 text-xs leading-relaxed font-medium">
          Seluruh jawaban bersifat <strong>rahasia</strong> dan digunakan semata-mata untuk mendukung kesejahteraanmu.
          Tidak ada jawaban yang salah atau benar.
        </p>
      </div>

      <button
        onClick={onStart}
        className="w-full py-5 bg-slate-900 text-white rounded-[20px] font-bold text-sm tracking-wide flex items-center justify-center gap-3 hover:bg-slate-700 transition-all shadow-xl shadow-slate-200"
      >
        Mulai Asesmen <ArrowRight size={18} />
      </button>
    </div>
  );
}

// ─── Instruction Screen ────────────────────────────────────────────────────────

function InstructionScreen({ onContinue }) {
  return (
    <div className="max-w-xl mx-auto py-14 px-4 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Sebelum Memulai</h2>
        <p className="text-slate-500 text-sm">Baca panduan berikut agar pengisian lebih nyaman</p>
      </div>

      <div className="space-y-3">
        {[
          {
            num: "01",
            title: "Kerjakan dengan tenang",
            body: "Pilih tempat yang nyaman dan sunyi. Tidak ada batas waktu — ambil napas dan isi sesuai kondisi riilmu.",
          },
          {
            num: "02",
            title: "Refleksikan 2 minggu terakhir",
            body: "Setiap pertanyaan merujuk pada kondisimu dalam 14 hari terakhir, bukan hanya hari ini.",
          },
          {
            num: "03",
            title: "Jawab dengan jujur",
            body: "Tidak ada jawaban benar atau salah. Kejujuranmu memastikan tindak lanjut yang diberikan benar-benar sesuai.",
          },
          {
            num: "04",
            title: "Kamu tidak sendirian",
            body: "Jika ada pertanyaan yang terasa berat, ingat ada konselor yang siap mendengarkan.",
          },
        ].map((item) => (
          <div key={item.num} className="flex gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-2xl font-black text-slate-100 shrink-0 leading-none pt-0.5">{item.num}</span>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-700">{item.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Color guide */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-5">
        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase text-center">
          Panduan Warna Jawaban
        </p>
        <ScaleLegend size="sm" />
        <div className="grid grid-cols-2 gap-2 pt-1">
          {scaleOptions.map((opt) => (
            <div
              key={opt.score}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2"
              style={{ backgroundColor: opt.tint, border: `1px solid ${opt.border}` }}
            >
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: opt.solid }} />
              <div>
                <p className="text-[11px] font-bold leading-tight" style={{ color: opt.solid }}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-slate-400">{opt.days}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-5 bg-[#00adb5] text-white rounded-[20px] font-bold text-sm tracking-wide flex items-center justify-center gap-3 hover:bg-[#009aa2] transition-all shadow-xl shadow-[#00adb5]/20"
      >
        Saya Siap <ArrowRight size={18} />
      </button>
    </div>
  );
}

// ─── Quiz Screen ───────────────────────────────────────────────────────────────

function QuizScreen({ questions, currentQ, onAnswer, onBack, loading }) {
  const q = questions[currentQ];
  const [hovered, setHovered] = useState(null);
  const progress = (currentQ / questions.length) * 100;

  useEffect(() => {
    setHovered(null);
  }, [currentQ]);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6 animate-in fade-in duration-300">

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            Pertanyaan {currentQ + 1} / {questions.length}
          </span>
          <span className="text-xs font-bold text-slate-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, backgroundColor: "#00adb5" }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">

        {/* Legend header */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-5">
          <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase text-center mb-4">
            Pilih seberapa sering kamu merasakannya dalam 2 minggu terakhir
          </p>
          <ScaleLegend size="md" />
        </div>

        {/* Question */}
        <div className="px-8 py-8 text-center space-y-2">
          {q.sensitive && (
            <span className="inline-block text-[10px] font-bold text-amber-600 tracking-widest uppercase bg-amber-50 border border-amber-100 px-3 py-1 rounded-full mb-2">
              Pertanyaan Sensitif
            </span>
          )}
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
            Dalam 2 minggu terakhir…
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">{q.text}</h2>
        </div>

        {/* Circle answers */}
        <div className="px-6 pb-10">
          <div className="grid grid-cols-4 gap-2">
            {scaleOptions.map((opt) => {
              const isHovered = hovered === opt.score;
              return (
                <button
                  key={opt.score}
                  onClick={() => onAnswer(opt.score)}
                  onMouseEnter={() => setHovered(opt.score)}
                  onMouseLeave={() => setHovered(null)}
                  disabled={loading}
                  className="flex flex-col items-center gap-3 py-3 px-2 rounded-2xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: isHovered ? opt.tint : "transparent" }}
                >
                  {/* Circle */}
                  <div
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: isHovered ? 64 : 52,
                      height: isHovered ? 64 : 52,
                      backgroundColor: opt.solid,
                      boxShadow: isHovered
                        ? `0 10px 28px -6px ${opt.solid}70`
                        : `0 2px 10px -2px ${opt.solid}50`,
                      opacity: isHovered ? 1 : 0.65,
                    }}
                  />
                  {/* Label */}
                  <div className="text-center space-y-0.5">
                    <p
                      className="text-[11px] font-bold leading-tight transition-colors duration-200"
                      style={{ color: isHovered ? opt.solid : "#94a3b8" }}
                    >
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight hidden md:block">{opt.days}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Back + loader */}
      <div className="flex items-center justify-center gap-6">
        {currentQ > 0 && (
          <button
            onClick={onBack}
            disabled={loading}
            className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={14} /> Kembali
          </button>
        )}
        {loading && <Loader2 className="animate-spin text-[#00adb5]" size={20} />}
      </div>
    </div>
  );
}

// ─── Open-Ended Screen ─────────────────────────────────────────────────────────

function OpenEndedScreen({ onSubmit, loading }) {
  const [responses, setResponses] = useState({ feelings: "", thoughts: "", behaviors: "" });

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold tracking-widest text-[#00adb5] uppercase">Bagian Terakhir</span>
        <h2 className="text-2xl font-bold text-slate-800">Ceritakan Kondisimu</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Isi singkat atau panjang sesuai kenyamananmu. Tidak ada format tertentu.
        </p>
      </div>

      <div className="space-y-4">
        {openEndedQuestions.map((q) => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
            <div>
              <p className="text-sm font-bold text-slate-700">{q.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{q.hint}</p>
            </div>
            <textarea
              value={responses[q.id]}
              onChange={(e) =>
                setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
              placeholder={q.placeholder}
              rows={3}
              className="w-full resize-none text-sm text-slate-700 placeholder-slate-300 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00adb5]/30 focus:border-[#00adb5] transition-all"
            />
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400">
        Pertanyaan ini bersifat opsional namun sangat membantu konselor memahami kondisimu.
      </p>

      <button
        onClick={() => onSubmit(responses)}
        disabled={loading}
        className="w-full py-5 bg-slate-900 text-white rounded-[20px] font-bold text-sm tracking-wide flex items-center justify-center gap-3 hover:bg-slate-700 transition-all shadow-xl shadow-slate-200 disabled:opacity-60"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" /> Menyimpan…</>
        ) : (
          <>Selesaikan Asesmen <ArrowRight size={18} /></>
        )}
      </button>
    </div>
  );
}

// ─── Completion Screen ─────────────────────────────────────────────────────────

function CompletionScreen({ hasSensitiveFlag }) {
  return (
    <div className="max-w-xl mx-auto py-14 px-4 space-y-8 text-center animate-in zoom-in duration-500">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 size={44} />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Terima Kasih</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Kamu sudah mengambil langkah yang berani untuk mengenal dirimu lebih baik.
        </p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-2 border border-slate-100">
        <p className="text-sm font-bold text-slate-700">Apa yang terjadi selanjutnya?</p>
        <p className="text-sm text-slate-500 leading-relaxed">
          Periksa inbox email di akun yang terdaftar di akun ini untuk melihat hasilnya yaa....
        </p>
      </div>

      {/* {hasSensitiveFlag && (
        <div className="bg-amber-50 rounded-2xl p-6 text-left space-y-2 border border-amber-100">
          <p className="text-sm font-bold text-amber-800">Dukungan Tersedia Sekarang</p>
          <p className="text-sm text-amber-700 leading-relaxed">
            Berdasarkan jawabanmu, kami menyarankan untuk tidak menunggu. Segera hubungi konselor sekolah
            atau layanan dukungan kesehatan mental.
          </p>
          <p className="text-xs font-semibold text-amber-600 pt-1">
            Hotline Into The Light Indonesia: 119 ext. 8
          </p>
        </div>
      )} */}

      <button
        onClick={() => (window.location.href = "/dashboard/student/progress")}
        className="w-full py-5 bg-[#00adb5] text-white rounded-[20px] font-bold text-sm tracking-wide shadow-xl shadow-[#00adb5]/20 hover:bg-[#009aa2] transition-all"
      >
        Kembali ke Dashboard
      </button>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function TilikDiriPage() {
  const { data: session } = useSession();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSensitiveFlag, setHasSensitiveFlag] = useState(false);

  const handleQuizAnswer = (score) => {
    const updated = [...answers];
    updated[currentQ] = { questionId: questions[currentQ].id, score };
    setAnswers(updated);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setStep(3);
    }
  };

  const handleOpenEndedSubmit = async (openEndedResponses) => {
    if (!session?.user?.id) {
      alert("Sesi tidak ditemukan. Silakan login kembali.");
      return;
    }
    setLoading(true);
    try {
      const sensitiveFlag = answers.some((a) => a.questionId >= 9 && a.score >= 2);
      setHasSensitiveFlag(sensitiveFlag);
      const res = await fetch("/api/student/tilik-diri/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, openEnded: openEndedResponses }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      setStep(4);
    } catch (err) {
      console.error("Gagal submit:", err);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) return <WelcomeScreen onStart={() => setStep(1)} />;
  if (step === 1) return <InstructionScreen onContinue={() => setStep(2)} />;
  if (step === 2)
    return (
      <QuizScreen
        questions={questions}
        currentQ={currentQ}
        onAnswer={handleQuizAnswer}
        onBack={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
        loading={loading}
      />
    );
  if (step === 3) return <OpenEndedScreen onSubmit={handleOpenEndedSubmit} loading={loading} />;
  return <CompletionScreen hasSensitiveFlag={hasSensitiveFlag} />;
}