"use client";

import React, { useState } from "react";

import {
  HeartHandshake,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";

export default function EarlyAwarenessPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const questions = [
    {
      id: "q1",
      question:
        "Anak terlihat lebih sering menyendiri dibanding biasanya?",
    },

    {
      id: "q2",
      question:
        "Anak mudah marah atau emosinya berubah drastis?",
    },

    {
      id: "q3",
      question:
        "Anak kehilangan minat terhadap aktivitas favoritnya?",
    },

    {
      id: "q4",
      question:
        "Anak mengalami perubahan pola tidur atau makan?",
    },

    {
      id: "q5",
      question:
        "Anak tampak cemas berlebihan saat sekolah atau menggunakan media sosial?",
    },
  ];

  const handleSelect = (id, value) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(
        "/api/parent/assesmen",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            answers,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setResult(data.result);
        setSubmitted(true);
      }
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedStyle = (
    questionId,
    value,
    activeClass
  ) => {
    return answers[questionId] === value
      ? activeClass
      : "border-slate-200 bg-white text-slate-600 hover:border-primary/40";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 md:px-6 md:py-8">

      {/* HERO */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary via-primary to-primary/80 p-6 md:p-8 lg:p-10 text-white shadow-xl shadow-primary/10">

        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 grid lg:grid-cols-[1fr_280px] gap-8 items-center">

          {/* LEFT */}
          <div className="space-y-5">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
              <Sparkles size={14} />
              Parent Emotional Insight
            </div>

            <div className="space-y-3">

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
                Early Awareness
                <br />
                Assessment
              </h1>

              <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-2xl font-medium">
                Screening awal untuk membantu orang tua memahami
                kemungkinan emotional distress pada anak
                berdasarkan perubahan perilaku sehari-hari.
              </p>

            </div>

          </div>

          {/* RIGHT */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
              <HeartPulse
                size={90}
                className="text-white/90"
              />
            </div>
          </div>

        </div>

      </div>

      {/* DISCLAIMER */}
      <div className="mt-6 bg-amber-50 border border-amber-100 rounded-[28px] p-5 md:p-6 flex items-start gap-4">

        <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle
            className="text-amber-600"
            size={20}
          />
        </div>

        <div className="space-y-1">

          <h3 className="font-black text-amber-800 text-sm md:text-base">
            Informasi Penting
          </h3>

          <p className="text-sm leading-relaxed text-amber-700 font-medium">
            Assessment ini bukan diagnosis medis profesional.
            Hasil hanya digunakan sebagai deteksi awal agar
            orang tua dapat memberikan perhatian dan
            pendampingan lebih dini.
          </p>

        </div>

      </div>

      {/* QUESTIONS */}
      {!submitted && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 mt-8"
        >

          {questions.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-[28px] border border-slate-100 p-5 md:p-6 shadow-sm hover:shadow-md transition-all"
            >

              {/* TOP */}
              <div className="flex gap-4 mb-6">

                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-base shrink-0 shadow-lg shadow-primary/20">
                  {index + 1}
                </div>

                <div className="space-y-1">

                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">
                    Pertanyaan
                  </p>

                  <h2 className="text-base md:text-lg lg:text-xl font-black text-slate-800 leading-relaxed">
                    {item.question}
                  </h2>

                </div>

              </div>

              {/* OPTIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {/* TIDAK */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelect(item.id, 0)
                  }
                  className={`h-14 rounded-2xl border-2 text-sm font-black transition-all ${getSelectedStyle(
                    item.id,
                    0,
                    "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  )}`}
                >
                  Tidak Pernah
                </button>

                {/* KADANG */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelect(item.id, 1)
                  }
                  className={`h-14 rounded-2xl border-2 text-sm font-black transition-all ${getSelectedStyle(
                    item.id,
                    1,
                    "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20"
                  )}`}
                >
                  Kadang
                </button>

                {/* SERING */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelect(item.id, 2)
                  }
                  className={`h-14 rounded-2xl border-2 text-sm font-black transition-all ${getSelectedStyle(
                    item.id,
                    2,
                    "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20"
                  )}`}
                >
                  Sering
                </button>

              </div>

            </div>
          ))}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={
              loading ||
              Object.keys(answers).length !==
                questions.length
            }
            className="w-full h-14 md:h-16 rounded-[24px] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Memproses...
              </>
            ) : (
              <>
                <HeartHandshake size={18} />
                Lihat Hasil Assessment
              </>
            )}

          </button>

        </form>
      )}

      {/* RESULT */}
      {submitted && result && (
        <div className="mt-8 bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* TOP */}
          <div className="text-center space-y-5">

            <div
              className={`w-24 h-24 md:w-28 md:h-28 mx-auto rounded-full flex items-center justify-center ${
                result.level === "high"
                  ? "bg-red-100"
                  : result.level === "medium"
                  ? "bg-amber-100"
                  : "bg-emerald-100"
              }`}
            >

              {result.level === "high" ? (
                <AlertTriangle
                  className="text-red-500"
                  size={42}
                />
              ) : (
                <ShieldCheck
                  className={
                    result.level === "medium"
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }
                  size={42}
                />
              )}

            </div>

            <div className="space-y-2">

              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">
                Hasil Assessment
              </p>

              <h2 className="text-2xl md:text-4xl font-black text-slate-800">
                {result.title}
              </h2>

            </div>

          </div>

          {/* RECOMMENDATION */}
          <div className="mt-10 space-y-5">

            <div>

              <h3 className="text-xl md:text-2xl font-black text-slate-800">
                Rekomendasi Pendekatan
              </h3>

              <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">
                Berikut langkah yang dapat dilakukan orang tua:
              </p>

            </div>

            <div className="space-y-4">

              {result.recommendations.map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 md:p-5 rounded-2xl bg-slate-50 border border-slate-100"
                  >

                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">

                      <CheckCircle2
                        className="text-primary"
                        size={18}
                      />

                    </div>

                    <p className="font-semibold text-sm md:text-base text-slate-700 leading-relaxed">
                      {item}
                    </p>

                  </div>
                )
              )}

            </div>

          </div>

          {/* ACTION */}
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setResult(null);
            }}
            className="mt-8 w-full h-14 rounded-2xl border border-slate-200 font-black text-sm text-slate-700 hover:bg-slate-50 transition-all"
          >
            Ulangi Assessment
          </button>

        </div>
      )}

    </div>
  );
}