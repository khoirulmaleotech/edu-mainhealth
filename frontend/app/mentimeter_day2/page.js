"use client";

import React, { useState } from "react";
import { message } from "antd";

export default function MentimeterPage() {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      message.error("Jawaban tidak boleh kosong!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/mentimeter_day2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answer }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setAnswer("");
      } else {
        message.error(data.message || "Terjadi kesalahan. Silakan coba lagi.");
      }
    } catch (error) {
      console.error(error);
      message.error("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border border-white/20">
          <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Berhasil!</h2>
          <p className="text-white/90 text-lg mb-8">Terima kasih atas jawaban Anda yang sangat berharga.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-md"
          >
            Kirim Jawaban Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Question Card */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-[2rem] p-8 md:p-12 mb-8 shadow-2xl text-center border border-white/10 transform transition-all hover:scale-[1.02]">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Tanpa mikir panjang — apa SATU kata yang langsung muncul di kepalamu saat dengar kata 'AI'?
          </h1>
        </div>

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="mb-6">
            <label htmlFor="answer" className="block text-gray-700 font-semibold mb-3 text-lg">
              Ketik jawabanmu di bawah ini:
            </label>
            <textarea
              id="answer"
              rows={4}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all text-lg resize-none"
              placeholder="Contoh: Tugas sekolah, ekspektasi orang tua..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-full text-white font-bold text-lg shadow-lg transition-all ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 hover:shadow-xl transform hover:-translate-y-1"
            }`}
          >
            {loading ? "Mengirim..." : "Kirim Jawaban"}
          </button>
        </form>
      </div>
    </div>
  );
}
