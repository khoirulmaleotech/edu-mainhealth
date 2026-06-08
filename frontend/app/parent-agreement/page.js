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
  ChevronRight
} from "lucide-react";

export default function FamilyAiAgreementPage() {
  const router = useRouter();

  const [isSubmitted, setIsSuccessSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");
  const [agreementDate, setAgreementDate] = useState("");
  const [agreements, setAgreements] = useState({
    point1: false,
    point2: false,
    point3: false,
    point4: false,
    point5: false,
    point6: false,
    point7: false,
  });

  useEffect(() => {
    const today = new Date();
    setAgreementDate(today.toLocaleDateString("en-CA"));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedParent = localStorage.getItem("fa_parent_name");
      const savedChild = localStorage.getItem("fa_child_name");
      const savedAgreements = localStorage.getItem("fa_agreements");

      if (savedParent) setParentName(savedParent);
      if (savedChild) setChildName(savedChild);
      if (savedAgreements) setAgreements(JSON.parse(savedAgreements));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fa_parent_name", parentName);
  }, [parentName]);

  useEffect(() => {
    localStorage.setItem("fa_child_name", childName);
  }, [childName]);

  useEffect(() => {
    localStorage.setItem("fa_agreements", JSON.stringify(agreements));
  }, [agreements]);

  const agreementPoints = [
    { id: "point1", text: "Teknologi adalah alat, bukan tujuan hidup." },
    { id: "point2", text: "AI digunakan untuk belajar dan berkembang." },
    { id: "point3", text: "AI tidak digunakan untuk menyontek." },
    { id: "point4", text: "Kami akan berdiskusi terbuka tentang penggunaan teknologi." },
    { id: "point5", text: "Kami memiliki waktu khusus tanpa gadget." },
    { id: "point6", text: "Kami menjaga sopan santun dan etika digital." },
    { id: "point7", text: "Kami menghormati privasi dan keamanan data." }
  ];

  const handleCheckboxChange = (pointId) => {
    setAgreements((prev) => ({
      ...prev,
      [pointId]: !prev[pointId]
    }));
  };

  const clearLocalStorageCache = () => {
    localStorage.removeItem("fa_parent_name");
    localStorage.removeItem("fa_child_name");
    localStorage.removeItem("fa_agreements");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const allChecked = Object.values(agreements).every((val) => val === true);
    if (!allChecked) {
      alert("Mohon diskusikan dan setujui seluruh poin kesepakatan keluarga cerdas AI terlebih dahulu.");
      return;
    }

    setSubmitting(true);

    const payload = {
      parent_name: parentName.toUpperCase().trim(),
      child_name: childName.toUpperCase().trim(),
      agreement_date: agreementDate,
      agreements_signed: agreements,
    };

    try {
      await fetch("/api/parent-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      clearLocalStorageCache();
      setIsSuccessSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-[#00adb5] selection:text-white">
        <div className="bg-white p-8 md:p-14 rounded-[35px] md:rounded-[45px] max-w-xl w-full shadow-2xl text-center border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500"></div>
          <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-50 text-emerald-500 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 border border-emerald-100">
            <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">Komitmen Keluarga Berhasil Disimpan!</h2>
          <p className="text-slate-500 font-bold text-sm mt-4 leading-relaxed text-emerald-600 bg-emerald-50/50 py-3 px-5 rounded-2xl border border-emerald-100/40">
            Kesepakatan Keluarga Cerdas AI berhasil disimpan ke database.
          </p>
          <p className="text-slate-400 font-medium text-xs mt-3 leading-relaxed italic">
            Terima kasih telah membangun ekosistem digital yang sehat, aman, dan kolaboratif di lingkungan keluarga. Langkah kecil ini berdampak besar bagi masa depan anak.
          </p>
          <div className="mt-8 md:mt-10">
            <button onClick={() => router.push("/")} className="w-full h-14 bg-[#0b0e14] text-white rounded-[20px] font-bold text-xs uppercase tracking-widest hover:bg-[#00adb5] transition-all shadow-xl">
              Selesai & Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#00adb5] selection:text-white pb-24">
      <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100 px-4 md:px-6 py-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <Image src="/images/logo-edumind-transparan.png" alt="Logo" width={38} height={38} />
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-black text-[#00adb5] leading-none tracking-tighter uppercase">EduMind</span>
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Family AI Agreement</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto pt-24 px-4">
        <header className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] p-6 md:p-10 shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#00adb5]"></div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-[#00adb5]/10 text-[#00adb5]">
              Family AI Agreement Sheet
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">Kesepakatan Keluarga Cerdas AI</h1>
            <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
              Komitmen bersama antara orang tua dan anak dalam mewujudkan pemanfaatan kecerdasan buatan (AI) secara produktif, beretika, aman, dan seimbang.
            </p>
          </div>

          <div className="mt-5 p-4 md:p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 rounded-2xl">
            <div className="flex items-center gap-2 text-[#00adb5] mb-2">
              <Sparkles size={15} className="animate-pulse" />
              <h4 className="text-xs font-black uppercase tracking-widest">Kami Sepakat Bahwa:</h4>
            </div>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Teknologi dan kecerdasan buatan (AI) adalah fasilitas penunjang masa depan. Diskusikan setiap poin di bawah ini bersama seluruh anggota keluarga sebelum menandatangani komitmen resmi.
            </p>
          </div>
        </header>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          {/* ── SEKTOR TANDA TANGAN / IDENTITAS PINDAH KE ATAS SEBELUM BUTIR PERTANYAAN ── */}
          <div className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-1.5 text-slate-800 border-b border-slate-50 pb-2">
              <FileCheck size={16} className="text-[#00adb5]" />
              <h3 className="text-sm font-black uppercase tracking-wider">Lembar Penandatanganan Komitmen</h3>
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
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Tanggal Kesepakatan</label>
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

          {/* Sektor Butir Kesepakatan Bersama */}
          <div className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-[10px] md:text-[11px] font-black uppercase tracking-wider text-slate-400">
              <span>Butir Kesepakatan Bersama</span>
              <span className="text-[#00adb5] bg-[#00adb5]/10 px-2.5 py-1 rounded-md">[WAJIB DISETUJUI]</span>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6 w-12 text-center">No</th>
                    <th className="py-4 px-6">Pernyataan Komitmen Keluarga</th>
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
                          onClick={() => handleCheckboxChange(item.id)}
                          className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${agreements[item.id] ? "bg-[#00adb5] text-white border-transparent shadow-md shadow-[#00adb5]/10" : "bg-white text-slate-400 border-slate-200 hover:border-[#00adb5]/30 hover:text-slate-600"}`}
                        >
                          {agreements[item.id] ? "✓ Setuju" : "Setuju"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Vertical View (Standard Rounded Buttons - Non Gepeng) */}
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
                      onClick={() => handleCheckboxChange(item.id)}
                      className={`h-11 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${agreements[item.id] ? "bg-[#00adb5] text-white border-transparent shadow-md w-full" : "bg-slate-50/80 text-slate-500 border-slate-200 w-full"}`}
                    >
                      <span>{agreements[item.id] ? "✓ Berhasil Disetujui" : "Konfirmasi Setuju"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto h-14 px-10 bg-[#0b0e14] hover:bg-[#00adb5] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-[#00adb5]/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Merekam Komitmen Keluarga...</span>
                </>
              ) : (
                <>
                  <span>Kirim Lembar Kesepakatan</span>
                  <Send size={13} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}