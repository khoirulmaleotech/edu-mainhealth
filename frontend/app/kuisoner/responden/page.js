"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Lock, 
  Search, 
  FileText, 
  Calendar, 
  School, 
  GraduationCap, 
  Phone, 
  Loader2,
  AlertCircle,
  ShieldAlert,
  HelpCircle,
  ClipboardList,
  Download
} from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";
import * as XLSX from "xlsx";

export default function QuestionnaireResponsesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); 
  const [selectedResponse, setSelectedResponse] = useState(null);

  const streamInitializedRef = useRef(false);

  const partAQuestions = [
    { id: 1, text: "Saya merasa sedih tanpa alasan yang jelas." },
    { id: 2, text: "Saya merasa sulit menikmati hal-hal yang biasanya saya sukai." },
    { id: 3, text: "Saya merasa tertekan oleh berbagai masalah yang saya hadapi." },
    { id: 4, text: "Saya merasa kewalahan menghadapi tuntutan sekolah atau kehidupan sehari-hari." },
    { id: 5, text: "Saya sering merasa khawatir berlebihan tentang sesuatu." },
    { id: 6, text: "Saya sulit berhenti memikirkan masalah yang sedang saya hadapi." },
    { id: 7, text: "Saya merasa gugup atau cemas menghadapi situasi sehari-hari." },
    { id: 8, text: "Saya merasa sendirian meskipun berada di sekitar banyak orang." },
    { id: 9, text: "Saya merasa tidak memiliki teman yang benar-benar memahami saya." },
    { id: 10, text: "Saya merasa sulit menemukan seseorang yang bisa diajak bicara ketika sedang memiliki masalah." },
    { id: 11, text: "Ketika marah atau sedih, saya mampu menenangkan diri dengan cara yang sehat." },
    { id: 12, text: "Saya dapat mengenali emosi yang sedang saya rasakan" },
    { id: 13, text: "Saya dapat mengendalikan diri ketika menghadapi situasi yang membuat saya kesal." },
    { id: 14, text: "Jika mengalami masalah serius, saya bersedia mencari bantuan." },
    { id: 15, text: "Saya tahu kepada siapa harus meminta bantuan ketika menghadapi masalah emosional." }
  ];

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === "edumind") {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const fetchResponsesData = async () => {
    setLoading(true);
    try {
      const response = await fetchInstance("/api/kuisoner/responses");
      if (response?.success) {
        setResponses(response?.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch questionnaire responses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchResponsesData();

    let eventSource;

    if (!streamInitializedRef.current) {
      streamInitializedRef.current = true;
      
      eventSource = new EventSource("/api/kuisoner/stream");

      eventSource.addEventListener("newResponse", (event) => {
        try {
          const newSubmission = JSON.parse(event.data);
          
          setResponses((previous) => {
            const isExist = previous.some((item) => String(item._id) === String(newSubmission._id));
            if (isExist) return previous;
            return [newSubmission, ...previous];
          });
        } catch (err) {
          console.error("Gagal membaca payload data stream respons:", err);
        }
      });

      eventSource.onerror = (err) => {
        console.error("Koneksi data stream kuesioner terputus, mengupayakan reconnect...", err);
      };
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        streamInitializedRef.current = false;
      }
    };
  }, [isAuthenticated]);

  const filteredResponses = responses.filter((item) => {
    const matchesSearch = 
      item.metadata?.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.metadata?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.metadata?.student_class?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterType === "all" || item.assessment_type === filterType;

    const itemDate = new Date(item.timestamp);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const isToday = itemDate >= todayStart && itemDate <= todayEnd;

    return matchesSearch && matchesFilter && isToday;
  });

  const handleDownloadExcel = () => {
    if (!filteredResponses || filteredResponses.length === 0) {
      alert("Tidak ada data untuk didownload");
      return;
    }

    const dataToExport = filteredResponses.map((res, index) => {
      const getVal = (val) => {
        if (Array.isArray(val)) return val.join(", ");
        return val || "-";
      };

      const totalNilai = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].reduce((sum, qId) => {
        const val = parseInt(res.part_A?.scaled_metrics?.[qId]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

      return {
        "No": index + 1,
        "Email": res.metadata?.email || "-",
        "Tipe Asesmen": res.assessment_type === "pre_test" ? "Pre-Test" : "Post-Test",
        "Sekolah": res.metadata?.school_name || "-",
        "Kelas": res.metadata?.student_class || "-",
        "WhatsApp": res.metadata?.whatsapp || "-",
        "Waktu Submit": new Date(res.timestamp).toLocaleString("id-ID"),
        
        // Part A
        "Q1": res.part_A?.scaled_metrics?.[1] || "-",
        "Q2": res.part_A?.scaled_metrics?.[2] || "-",
        "Q3": res.part_A?.scaled_metrics?.[3] || "-",
        "Q4": res.part_A?.scaled_metrics?.[4] || "-",
        "Q5": res.part_A?.scaled_metrics?.[5] || "-",
        "Q6": res.part_A?.scaled_metrics?.[6] || "-",
        "Q7": res.part_A?.scaled_metrics?.[7] || "-",
        "Q8": res.part_A?.scaled_metrics?.[8] || "-",
        "Q9": res.part_A?.scaled_metrics?.[9] || "-",
        "Q10": res.part_A?.scaled_metrics?.[10] || "-",
        "Q11": res.part_A?.scaled_metrics?.[11] || "-",
        "Q12": res.part_A?.scaled_metrics?.[12] || "-",
        "Q13": res.part_A?.scaled_metrics?.[13] || "-",
        "Q14": res.part_A?.scaled_metrics?.[14] || "-",
        "Q15": res.part_A?.scaled_metrics?.[15] || "-",
        "Total Nilai Kuantitatif": totalNilai,
        "Teman Bicara": `${getVal(res.part_A?.most_likely_confidant)} ${res.part_A?.most_likely_confidant_others ? `(${res.part_A.most_likely_confidant_others})` : ""}`.trim(),
        "Tantangan Terbesar": getVal(res.part_A?.biggest_teen_challenge),

        // Part B
        "Pernah Dibully": getVal(res.part_B?.experienced_bullying),
        "Pernah Membully": getVal(res.part_B?.perpetrated_bullying),
        "Bentuk Bullying Dialami": `${getVal(res.part_B?.bullying_types_suffered)} ${res.part_B?.bullying_types_suffered_others ? `(${res.part_B.bullying_types_suffered_others})` : ""}`.trim(),
        "Frekuensi Sekolah": getVal(res.part_B?.school_bullying_frequency_weekly),
        "Frekuensi Cyber": getVal(res.part_B?.cyberbullying_frequency_weekly),
        "Platform Cyber": `${getVal(res.part_B?.cyberbullying_platforms)} ${res.part_B?.cyberbullying_platforms_others ? `(${res.part_B.cyberbullying_platforms_others})` : ""}`.trim(),
        "Tindakan Korban": getVal(res.part_B?.victim_coping_mechanism),

        // Part C
        "Definisi Bullying": getVal(res.part_C?.bullying_vs_conflict_definition),
        "Tanda Teman Stres": getVal(res.part_C?.emotional_distress_signs_bystander),
        "Tindakan Bystander": getVal(res.part_C?.bystander_intervention_action),
        "Target Bantuan": getVal(res.part_C?.help_seeking_target),
        "Alasan Bantuan": getVal(res.part_C?.help_seeking_reason),
        "Alasan Korban Diam": getVal(res.part_C?.victim_silence_reason),
        "Rekomendasi Sekolah": getVal(res.part_C?.school_safe_environment_recommendation)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Responden");

    XLSX.writeFile(workbook, `Data_Responden_Kuesioner_${new Date().getTime()}.xlsx`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans selection:bg-[#00adb5] selection:text-white">
        <div className="bg-white p-8 md:p-10 rounded-[35px] max-w-md w-full shadow-2xl text-center border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#00adb5]"></div>
          
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200">
            <Lock size={28} />
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Protected Dashboard</h2>
          <p className="text-slate-400 font-medium text-xs mt-3 leading-relaxed">
            Silakan masukkan kata sandi otorisasi sistem untuk mengakses dan meninjau berkas data respons kuesioner peserta.
          </p>

          <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Sistem Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full px-4 py-3.5 bg-slate-50 border-2 ${passwordError ? "border-rose-500/30 focus:border-rose-500 bg-rose-50/20" : "border-transparent focus:border-[#00adb5]"} focus:bg-white rounded-xl outline-none text-xs font-bold transition-all shadow-inner`}
                required
              />
              {passwordError && (
                <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold mt-1 ml-1">
                  <AlertCircle size={12} />
                  <span>Kata sandi tidak valid. Hubungi Tim Admin IT.</span>
                </div>
              )}
            </div>

            {/* TOMBOL LOGIN: Menggunakan Tinggi Standar Proporsional h-13 */}
            <button type="submit" className="w-full h-13 bg-[#0b0e14] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#00adb5] transition-all shadow-lg shadow-slate-900/10">
              Buka Akses Data
            </button>
          </form>
        </div>
      </div>
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayPretestCount = responses.filter(r => r.assessment_type === "pre_test" && new Date(r.timestamp) >= todayStart).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700 pb-16 selection:bg-[#00adb5] selection:text-white">
      <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-40 border-b border-slate-100 px-4 md:px-8 py-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-black text-[#00adb5] leading-none tracking-tighter uppercase">EduMind Responses</span>
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Wellbeing Camp Bukittinggi</span>
          </div>
        </div>
        {/* TOMBOL KUNCI KEMBALI: Menggunakan Tinggi Standar h-10 */}
        <button onClick={() => { setIsAuthenticated(false); setPasswordInput(""); }} className="h-10 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-500 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all border border-slate-200">
          Kunci Kembali
        </button>
      </nav>

      <div className="max-w-7xl mx-auto pt-24 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Filter Data Respons</h3>
            
            <div className="bg-slate-50 px-4 py-3 border border-slate-200/60 flex items-center gap-3 rounded-xl h-12">
              <Search size={16} className="text-slate-300 shrink-0" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari email atau sekolah..."
                className="bg-transparent outline-none text-xs font-bold w-full"
              />
            </div>

            {/* ── UPDATE TOMBOL FILTER: MENGGUNAKAN TINGGI STANDAR h-11 AGAR TIDAK GEPENG ── */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/40 text-center">
              <button onClick={() => setFilterType("all")} className={`h-11 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center ${filterType === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                Semua
              </button>
              <button onClick={() => setFilterType("pre_test")} className={`h-11 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center ${filterType === "pre_test" ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                Pre
              </button>
              <button onClick={() => setFilterType("post_test")} className={`h-11 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center ${filterType === "post_test" ? "bg-[#00adb5] text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                Post
              </button>
            </div>

            <button
               onClick={handleDownloadExcel}
               className="h-11 w-full bg-[#00adb5] hover:bg-[#009299] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
            >
               <Download size={16} />
               Download Excel
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm flex flex-col h-[calc(100vh-320px)]">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <div className="flex items-center gap-1.5 text-slate-500">
                <ClipboardList size={14} className="text-[#00adb5]" />
                <span>Daftar Peserta Real-time ({filteredResponses.length})</span>
              </div>
              <div className="text-[9px] font-bold text-[#00adb5] bg-[#00adb5]/10 px-2 py-0.5 rounded">
                Pre-Test Hari Ini: {todayPretestCount}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {loading ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#00adb5]" /></div>
              ) : Object.keys(filteredResponses).length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-400 italic">Tidak ada lembar data respons found.</div>
              ) : (
                filteredResponses.map((res) => {
                  const isSelected = selectedResponse?._id === res._id;
                  return (
                    <button
                      key={res._id}
                      type="button"
                      onClick={() => setSelectedResponse(res)}
                      className={`w-full text-left p-4 flex flex-col gap-1 transition-all border-none ${isSelected ? "bg-[#00adb5]/5 border-l-4 border-l-[#00adb5]" : "hover:bg-slate-50/60"}`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-xs font-black text-slate-800 truncate max-w-[160px]">{res.metadata?.email}</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${res.assessment_type === "pre_test" ? "bg-slate-100 text-slate-800" : "bg-[#00adb5]/10 text-[#00adb5]"}`}>
                          {res.assessment_type === "pre_test" ? "Pre" : "Post"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 truncate w-full uppercase">{res.metadata?.school_name}</span>
                      <div className="flex justify-between text-[9px] font-medium text-slate-400 mt-1">
                        <span>Kelas: {res.metadata?.student_class}</span>
                        <span>{new Date(res.timestamp).toLocaleDateString("id-ID", {day:"numeric", month:"short"})}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedResponse ? (
            <div className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] p-6 md:p-8 shadow-sm space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto animate-in fade-in duration-200">
              <header className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <span className={`inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${selectedResponse.assessment_type === "pre_test" ? "bg-slate-100 text-slate-800" : "bg-[#00adb5]/10 text-[#00adb5]"}`}>
                    Lembar Hasil: {selectedResponse.assessment_type === "pre_test" ? "Pre-Test" : "Post-Test"} ({new Date(selectedResponse.timestamp).toLocaleDateString("id-ID", { day: "numeric", month: "short" })})
                  </span>
                  <h2 className="text-xl font-black text-slate-800 truncate">{selectedResponse.metadata?.email}</h2>
                </div>
                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <Calendar size={13} />
                  <span>Submit: {new Date(selectedResponse.timestamp).toLocaleString("id-ID")}</span>
                </div>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                  <School className="text-[#00adb5] shrink-0" size={18} />
                  <div className="min-w-0"><span className="block text-[8px] font-black text-slate-400 uppercase">Sekolah</span><span className="text-xs font-black text-slate-700 truncate block uppercase">{selectedResponse.metadata?.school_name}</span></div>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                  <GraduationCap className="text-[#00adb5] shrink-0" size={18} />
                  <div className="min-w-0"><span className="block text-[8px] font-black text-slate-400 uppercase">Kelas</span><span className="text-xs font-black text-slate-700 truncate block uppercase">{selectedResponse.metadata?.student_class}</span></div>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                  <Phone className="text-[#00adb5] shrink-0" size={18} />
                  <div className="min-w-0"><span className="block text-[8px] font-black text-slate-400 uppercase">WhatsApp</span><span className="text-xs font-black text-slate-700 truncate block">{selectedResponse.metadata?.whatsapp}</span></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between items-center mb-3 border-b pb-2">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Bagian A: Metrik Pengukuran Well-Being</h4>
                    <span className="text-[9px] font-black bg-sky-50 text-[#00adb5] px-2 py-0.5 rounded">Skala 1-5</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
                    {partAQuestions.map((q) => {
                      const val = selectedResponse.part_A?.scaled_metrics?.[q.id] || "-";
                      return (
                        <div key={q.id} className="bg-white border p-2.5 rounded-xl group relative cursor-help">
                          <span className="block text-[9px] font-black text-slate-400">No. {q.id}</span>
                          <span className="block text-sm font-black text-[#00adb5] mt-0.5">Skala {val}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-left font-medium leading-relaxed shadow-xl">
                            {q.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 space-y-2 text-xs font-bold text-slate-700">
                    <p>💬 Teman Bicara Masalah Berat: <span className="font-black text-slate-800">{Array.isArray(selectedResponse.part_A?.most_likely_confidant) ? selectedResponse.part_A.most_likely_confidant.join(", ") : selectedResponse.part_A?.most_likely_confidant || "-"} {selectedResponse.part_A?.most_likely_confidant_others ? `(${selectedResponse.part_A.most_likely_confidant_others})` : ""}</span></p>
                    <div className="pt-2 border-t border-dashed">
                      <span className="block text-[9px] text-slate-400 uppercase">Tantangan Terbesar Remaja:</span>
                      <p className="font-medium text-slate-600 italic mt-0.5">"{selectedResponse.part_A?.biggest_teen_challenge || "-"}"</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1 text-slate-800 border-b pb-2 mb-1">
                    <ShieldAlert size={14} className="text-rose-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Bagian B: Riwayat Paparan Bullying</h4>
                  </div>
                  <p>🔴 Pernah Mengalami Dibully: <span className="font-black text-slate-800">{selectedResponse.part_B?.experienced_bullying || "-"}</span></p>
                  <p>⚔️ Pernah Melakukan Bullying: <span className="font-black text-slate-800">{selectedResponse.part_B?.perpetrated_bullying || "-"}</span></p>
                  <p>📂 Bentuk Bullying Yang Dialami: <span className="font-black text-slate-800">{selectedResponse.part_B?.bullying_types_suffered?.join(", ") || "-"} {selectedResponse.part_B?.bullying_types_suffered_others ? `(${selectedResponse.part_B.bullying_types_suffered_others})` : ""}</span></p>
                  <p>🏫 Frekuensi Bullying di Sekolah: <span className="font-black text-slate-800">{selectedResponse.part_B?.school_bullying_frequency_weekly || "-"}</span></p>
                  <p>🌐 Frekuensi Cyberbullying: <span className="font-black text-slate-800">{selectedResponse.part_B?.cyberbullying_frequency_weekly || "-"}</span></p>
                  <p>📱 Platform Cyberbullying Sering Terjadi: <span className="font-black text-slate-800">{selectedResponse.part_B?.cyberbullying_platforms?.join(", ") || "-"} {selectedResponse.part_B?.cyberbullying_platforms_others ? `(${selectedResponse.part_B.cyberbullying_platforms_others})` : ""}</span></p>
                  <p>🛡️ Tindakan Saat Mengalami Bullying: <span className="font-black text-slate-800">{selectedResponse.part_B?.victim_coping_mechanism?.join(", ") || "-"}</span></p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1 text-slate-800 border-b pb-2 mb-1">
                    <HelpCircle size={14} className="text-emerald-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Bagian C: Hasil Jawaban Esai Deskriptif</h4>
                  </div>
                  
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">25. Perbedaan Bullying vs Konflik Biasa:</span>
                    <p className="font-medium text-slate-600 italic mt-1">"{selectedResponse.part_C?.bullying_vs_conflict_definition || "-"}"</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">26. Tanda Teman Mengalami Tekanan Emosional:</span>
                    <p className="font-medium text-slate-600 italic mt-1">"{selectedResponse.part_C?.emotional_distress_signs_bystander || "-"}"</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">27. Tindakan Siswa Saat Melihat Teman Korban Bullying:</span>
                    <p className="font-medium text-slate-600 italic mt-1">"{selectedResponse.part_C?.bystander_intervention_action || "-"}"</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">28. Target Bantuan & Alasan Penguat:</span>
                    <p className="font-medium text-slate-600 mt-1">Target: <span className="font-black text-slate-800">{selectedResponse.part_C?.help_seeking_target || "-"}</span></p>
                    <p className="font-medium text-slate-600 italic mt-0.5">Alasan: "{selectedResponse.part_C?.help_seeking_reason || "-"}"</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">29. Alasan Korban Memilih Diam & Enggan Bercerita:</span>
                    <p className="font-medium text-slate-600 italic mt-1">"{selectedResponse.part_C?.victim_silence_reason || "-"}"</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">30. Rekomendasi Fasilitas Aman Untuk Sekolah:</span>
                    <p className="font-medium text-slate-600 italic mt-1">"{selectedResponse.part_C?.school_safe_environment_recommendation || "-"}"</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[calc(100vh-140px)] bg-slate-50/50 border border-dashed border-slate-200 rounded-[35px] flex flex-col items-center justify-center text-slate-300">
              <FileText size={48} />
              <p className="mt-3 text-xs font-black uppercase tracking-wider">Pilih salah satu peserta untuk melihat detail jawaban</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}