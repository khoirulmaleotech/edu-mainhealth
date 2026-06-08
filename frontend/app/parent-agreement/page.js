"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Heart,
  User, 
  Calendar, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  FileCheck,
  RefreshCcw,
  X
} from "lucide-react";

export default function FamilyAiAgreementAllInOnePage() {
  const router = useRouter();

  const [showPopup, setShowPopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");
  const [agreementDate, setAgreementDate] = useState("");

  const [assessmentScores, setAssessmentScores] = useState({});
  const [agreementSigns, setAgreementSigns] = useState({
    point1: false,
    point2: false,
    point3: false,
    point4: false,
    point5: false,
    point6: false,
    point7: false,
  });

  const assessmentQuestions = [
    { id: 1, text: "Saya mengetahui aplikasi AI yang digunakan anak saya." },
    { id: 2, text: "Saya berdiskusi dengan anak tentang apa yang mereka lihat di internet." },
    { id: 3, text: "Saya memberi contoh penggunaan gadget yang sehat." },
    { id: 4, text: "Saya memiliki aturan penggunaan gadget di rumah." },
    { id: 5, text: "Saya makan bersama keluarga tanpa gadget." },
    { id: 6, text: "Saya mengetahui akun media sosial yang digunakan anak." },
    { id: 7, text: "Saya lebih sering berdialog daripada memarahi terkait gadget." },
    { id: 8, text: "Saya memahami manfaat dan risiko AI bagi anak." },
    { id: 9, text: "Saya meluangkan waktu khusus berbicara dengan anak setiap hari." },
    { id: 10, text: "Saya mengajarkan etika dan tanggung jawab digital kepada anak." }
  ];

  const scaleOptions = [
    { value: 1, label: "Tidak Pernah" },
    { value: 2, label: "Jarang" },
    { value: 3, label: "Kadang-kadang" },
    { value: 4, label: "Sering" },
    { value: 5, label: "Selalu" }
  ];

  const agreementPoints = [
    { id: "point1", text: "Teknologi adalah alat, bukan tujuan hidup." },
    { id: "point2", text: "AI digunakan untuk belajar dan berkembang." },
    { id: "point3", text: "AI tidak digunakan untuk menyontek." },
    { id: "point4", text: "Kami akan berdiskusi terbuka tentang penggunaan teknologi." },
    { id: "point5", text: "Kami memiliki waktu khusus tanpa gadget." },
    { id: "point6", text: "Kami menjaga sopan santun dan etika digital." },
    { id: "point7", text: "Kami menghormati privasi dan keamanan data." }
  ];

  useEffect(() => {
    const today = new Date();
    setAgreementDate(today.toLocaleDateString("en-CA"));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedParent = localStorage.getItem("fa_parent_name");
      const savedChild = localStorage.getItem("fa_child_name");
      const savedScores = localStorage.getItem("fa_assessment_scores");
      const savedAgreements = localStorage.getItem("fa_agreement_signs");

      if (savedParent) setParentName(savedParent);
      if (savedChild) setChildName(savedChild);
      if (savedScores) setAssessmentScores(JSON.parse(savedScores));
      if (savedAgreements) setAgreementSigns(JSON.parse(savedAgreements));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fa_parent_name", parentName);
  }, [parentName]);

  useEffect(() => {
    localStorage.setItem("fa_child_name", childName);
  }, [childName]);

  useEffect(() => {
    localStorage.setItem("fa_assessment_scores", JSON.stringify(assessmentScores));
  }, [assessmentScores]);

  useEffect(() => {
    localStorage.setItem("fa_agreement_signs", JSON.stringify(agreementSigns));
  }, [agreementSigns]);

  const handleScoreChange = (qId, value) => {
    setAssessmentScores((prev) => ({ ...prev, [qId]: value }));
  };

  const handleAgreementToggle = (pointId) => {
    setAgreementSigns((prev) => ({ ...prev, [pointId]: !prev[pointId] }));
  };

  const resetAllFields = () => {
    setAssessmentScores({});
    setAgreementSigns({
      point1: false, point2: false, point3: false, point4: false, point5: false, point6: false, point7: false
    });
    localStorage.removeItem("fa_assessment_scores");
    localStorage.removeItem("fa_agreement_signs");
  };

  const clearLocalStorageCache = () => {
    localStorage.removeItem("fa_parent_name");
    localStorage.removeItem("fa_child_name");
    localStorage.removeItem("fa_assessment_scores");
    localStorage.removeItem("fa_agreement_signs");
  };

  const totalAnswered = Object.keys(assessmentScores).length;
  const isAssessmentComplete = totalAnswered === assessmentQuestions.length;

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!isAssessmentComplete) {
      alert("Mohon selesaikan lembar Self-Assessment terlebih dahulu.");
      return;
    }

    const allAgreed = Object.values(agreementSigns).every((val) => val === true);
    if (!allAgreed) {
      alert("Mohon diskusikan dan centang seluruh poin Kesepakatan Keluarga Cerdas AI.");
      return;
    }

    setSubmitting(true);

    const payload = {
      metadata: {
        parent_name: parentName.toUpperCase().trim(),
        child_name: childName.toUpperCase().trim(),
        agreement_date: agreementDate
      },
      assessment_scores: assessmentScores,
      agreement_signed: agreementSigns
    };

    try {
      await fetch("/api/parent-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      clearLocalStorageCache();
      setShowPopup(true);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#00adb5] selection:text-white pb-24">
      <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100 px-4 md:px-6 py-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <Image src="/images/logo-edumind-transparan.png" alt="Logo" width={38} height={38} />
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-black text-[#00adb5] leading-none tracking-tighter uppercase">EduMind</span>
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Parenting & Family Modul</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto pt-24 px-4">
        <header className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] p-6 md:p-10 shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#00adb5]"></div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-[#00adb5]/10 text-[#00adb5]">
              Integrated Parenting Modul
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">Evaluasi & Komitmen Keluarga Cerdas AI</h1>
            <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
              Satu halaman terintegrasi untuk mengukur kesiapan pengasuhan era digital sekaligus merumuskan komitmen kesepakatan bersama antara orang tua dan anak.
            </p>
          </div>
        </header>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          {/* SEKTOR 1: LEMBAR PENANDATANGANAN IDENTITAS UTAMA */}
          <div className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-1.5 text-slate-800 border-b border-slate-50 pb-2">
              <FileCheck size={16} className="text-[#00adb5]" />
              <h3 className="text-sm font-black uppercase tracking-wider">1. Lembar Penandatanganan Komitmen</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Nama Orang Tua</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value.toUpperCase())}
                    placeholder="NAMA LENGKAP AYAH / IBU"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#00adb5] focus:bg-white rounded-xl outline-none text-xs font-black transition-all shadow-inner tracking-wide"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Nama Anak</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="text"
                    required
                    value={childName}
                    onChange={(e) => setChildName(e.target.value.toUpperCase())}
                    placeholder="NAMA LENGKAP ANAK"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#00adb5] focus:bg-white rounded-xl outline-none text-xs font-black transition-all shadow-inner tracking-wide"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Tanggal Pengisian</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="date"
                    required
                    value={agreementDate}
                    onChange={(e) => setAgreementDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#00adb5] focus:bg-white rounded-xl outline-none text-xs font-bold transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEKTOR 2: INSTRUMEN SELF-ASSESSMENT KESIAPAN ORANG TUA */}
          <div className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between text-[10px] md:text-[11px] font-black uppercase tracking-wider text-slate-400">
                <span className="text-slate-800 font-black">2. Self Assessment: Seberapa Siap Kita Menjadi Orang Tua di Era AI?</span>
                <span className="text-[#00adb5] font-black bg-[#00adb5]/10 px-2.5 py-1 rounded-md shrink-0">Progres: {totalAnswered}/10</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-400 text-center pt-1 border-t border-slate-100/70">
                {scaleOptions.map((opt) => (
                  <div key={opt.value} className="bg-white border border-slate-200/50 p-2 rounded-xl shadow-inner flex items-center justify-center gap-1.5 sm:flex-col sm:gap-0.5">
                    <span className="text-[#00adb5] text-xs font-black">{opt.value} =</span>
                    <span className="text-slate-500 font-bold truncate">{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6 w-12 text-center">No</th>
                    <th className="py-4 px-6">Pernyataan Sikap & Kebiasaan Mandiri</th>
                    <th className="py-4 px-6 text-center w-64">Skala Skor (1 - 5)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {assessmentQuestions.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-5 px-6 text-sm font-black text-slate-400 text-center">{idx + 1}</td>
                      <td className="py-5 px-6 text-sm font-bold text-slate-700 leading-relaxed">{q.text}</td>
                      <td className="py-5 px-6">
                        <div className="flex justify-between items-center gap-1 max-w-[220px] mx-auto">
                          {[1, 2, 3, 4, 5].map((num) => {
                            const isSelected = assessmentScores[q.id] === num;
                            return (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleScoreChange(q.id, num)}
                                className={`w-9 h-9 rounded-xl text-xs font-black transition-all border ${isSelected ? "bg-[#00adb5] text-white border-transparent scale-110 shadow-md" : "bg-white text-slate-400 border-slate-200 hover:border-[#00adb5]/30"}`}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Vertical View (Standard Size - Non Gepeng) */}
            <div className="block md:hidden px-4 divide-y divide-slate-100">
              {assessmentQuestions.map((q, idx) => (
                <div key={q.id} className="py-5 space-y-3">
                  <div className="flex gap-2 items-start">
                    <span className="text-xs font-black text-[#00adb5] bg-[#00adb5]/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{q.text}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const isSelected = assessmentScores[q.id] === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleScoreChange(q.id, num)}
                          className={`w-11 h-11 rounded-xl text-xs font-black transition-all border flex items-center justify-center shrink-0 ${isSelected ? "bg-[#00adb5] text-white border-transparent scale-105 shadow-md" : "bg-slate-50/80 text-slate-500 border-slate-200"}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEKTOR 3: INSTRUMEN FAMILY AI AGREEMENT SHEET */}
          <div className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-[10px] md:text-[11px] font-black uppercase tracking-wider text-slate-400">
              <span className="text-slate-800 font-black">3. Family AI Agreement Sheet (Kesepakatan Keluarga Cerdas AI)</span>
              <span className="text-[#00adb5] bg-[#00adb5]/10 px-2.5 py-1 rounded-md shrink-0">[WAJIB CHECKED]</span>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6 w-12 text-center">No</th>
                    <th className="py-4 px-6">Butir Pernyataan Komitmen Kesepakatan Bersama</th>
                    <th className="py-4 px-6 text-center w-36">Konfirmasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {agreementPoints.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-5 px-6 text-sm font-black text-slate-400 text-center">{idx + 1}</td>
                      <td className="py-5 px-6 text-sm font-bold text-slate-700 leading-relaxed">{item.text}</td>
                      <td className="py-5 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleAgreementToggle(item.id)}
                          className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${agreementSigns[item.id] ? "bg-[#00adb5] text-white border-transparent shadow-md" : "bg-white text-slate-400 border-slate-200 hover:border-[#00adb5]/30"}`}
                        >
                          {agreementSigns[item.id] ? "✓ Setuju" : "Setuju"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Vertical View (Standard Size - Non Gepeng) */}
            <div className="block md:hidden px-4 divide-y divide-slate-100">
              {agreementPoints.map((item, idx) => (
                <div key={item.id} className="py-5 space-y-3.5">
                  <div className="flex gap-2 items-start">
                    <span className="text-xs font-black text-[#00adb5] bg-[#00adb5]/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{item.text}</p>
                  </div>
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleAgreementToggle(item.id)}
                      className={`h-11 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${agreementSigns[item.id] ? "bg-[#00adb5] text-white border-transparent shadow-md w-full" : "bg-slate-50/80 text-slate-500 border-slate-200 w-full"}`}
                    >
                      <span>{agreementSigns[item.id] ? "✓ Berhasil Disetujui" : "Konfirmasi Setuju"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTON CONSOLE */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
            {totalAnswered > 0 && (
              <button
                type="button"
                onClick={resetAllFields}
                className="w-full sm:w-auto h-14 px-6 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 transition-all bg-transparent cursor-pointer shrink-0"
              >
                <RefreshCcw size={13} /> Reset Form Isian
              </button>
            )}
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto sm:ml-auto h-14 px-10 bg-[#0b0e14] hover:bg-[#00adb5] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Mengunci Komitmen Keluarga...</span>
                </>
              ) : (
                <>
                  <span>Kirim Seluruh Berkas Paket</span>
                  <Send size={13} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* POPUP MODAL REAL-TIME OVERLAY */}
      {showPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[999] animate-in fade-in duration-300">
          <div className="bg-white rounded-[35px] md:rounded-[40px] max-w-md w-full p-8 text-center border border-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#00adb5]"></div>
            
            <button 
              type="button" 
              onClick={() => { setShowPopup(false); router.push("/"); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1 bg-slate-50 rounded-lg border border-slate-100"
            >
              <X size={16} />
            </button>

            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-100/50">
              <CheckCircle2 size={42} />
            </div>

            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Paket Komitmen Terkirim!</h3>
            
            <div className="mt-4 p-4 bg-emerald-50/60 border border-emerald-100/40 rounded-2xl text-emerald-700 font-bold text-xs leading-relaxed">
              Seluruh riwayat isian dan lembar kesepakatan cerdas AI Anda berhasil direkam dengan aman ke dalam sistem database pusat.
            </div>

            <p className="text-slate-400 font-medium text-xs mt-4 leading-relaxed italic">
              Terima kasih telah membangun ekosistem digital yang sehat, aman, dan kolaboratif di lingkungan keluarga. Langkah kecil ini berdampak besar bagi masa depan anak.
            </p>

            <div className="mt-8">
              <button 
                type="button"
                onClick={() => { setShowPopup(false); router.push("/"); }}
                className="w-full h-14 bg-[#0b0e14] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#00adb5] transition-all shadow-lg flex items-center justify-center border-none cursor-pointer"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}