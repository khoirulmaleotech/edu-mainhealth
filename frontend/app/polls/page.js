"use client";

import { useState } from "react";
import { message } from "antd";
import { GraduationCap, CheckCircle2 } from "lucide-react";

export default function PollsPage() {
  const [selectedSchool, setSelectedSchool] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const schools = [
    "SMAN 1 bukittinggi",
    "SMAN 2 bukittinggi",
    "SMAN 3 bukittinggi",
    "SMAN 4 bukittinggi",
    "SMAN 5 bukittinggi",
  ];

  const handleSubmit = async () => {
    if (!selectedSchool) {
      message.warning("Pilih salah satu sekolah terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: selectedSchool }),
      });

      const result = await response.json();
      if (result.success) {
        setHasVoted(true);
        message.success("Terima kasih atas partisipasi Anda!");
      } else {
        message.error(result.message || "Gagal mengirim jawaban.");
      }
    } catch (error) {
      console.error(error);
      message.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center transform transition-all">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Suara Tersimpan!</h2>
          <p className="text-gray-600">Terima kasih telah berpartisipasi dalam polling ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Polling Sekolah</h1>
          <p className="text-gray-500 mt-2">Pilih sekolah favorit Anda dari daftar di bawah ini.</p>
        </div>

        <div className="space-y-3">
          {schools.map((school) => (
            <button
              key={school}
              onClick={() => setSelectedSchool(school)}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                selectedSchool === school
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
              }`}
            >
              <span className={`font-medium ${selectedSchool === school ? "text-blue-700" : "text-gray-700"}`}>
                {school}
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedSchool === school ? "border-blue-500" : "border-gray-300"
                }`}
              >
                {selectedSchool === school && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedSchool}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all shadow-lg ${
              isSubmitting || !selectedSchool
                ? "bg-gray-300 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            {isSubmitting ? "Mengirim..." : "Kirim Jawaban"}
          </button>
        </div>
      </div>
    </div>
  );
}
