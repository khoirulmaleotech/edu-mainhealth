"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Lock, 
  Search, 
  FileText, 
  Calendar, 
  User,
  Loader2,
  AlertCircle,
  ClipboardList,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { fetchInstance } from "@/lib/fetchInstance";

export default function ParentAgreementResponsesDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLabel, setFilterLabel] = useState("all"); 
  const [selectedRecord, setSelectedRecord] = useState(null);

  const isStreamRunningRef = useRef(false);


  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === "edumindeducourse") {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const loadInitialRecords = async () => {
    setLoading(true);
    try {
      const response = await fetchInstance("/api/parent-agreement/responses");
      if (response?.success) {
        setRecords(response?.data || []);
      }
    } catch (err) {
      console.error("Gagal menarik data respons kesepakatan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    loadInitialRecords();

    let eventSource;

    if (!isStreamRunningRef.current) {
      isStreamRunningRef.current = true;
      eventSource = new EventSource("/api/parent-agreement/stream");

      eventSource.addEventListener("newParentAgreement", (event) => {
        try {
          const incomingDoc = JSON.parse(event.data);
          setRecords((prevList) => {
            const exists = prevList.some((item) => String(item._id) === String(incomingDoc._id));
            if (exists) return prevList;
            return [incomingDoc, ...prevList];
          });
        } catch (err) {
          console.error("Gagal mendecode data stream:", err);
        }
      });

      eventSource.onerror = () => {
        console.error("Koneksi stream terputus, Next.js otomatis mencoba menyambung ulang...");
      };
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        isStreamRunningRef.current = false;
      }
    };
  }, [isAuthenticated]);

  const filteredRecords = records.filter((item) => {
    const searchTarget = `${item.metadata?.parent_name} ${item.metadata?.child_name}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
    const matchesFilter = filterLabel === "all" || item.assessment?.label === filterLabel;

    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans selection:bg-[#00adb5] selection:text-white">
        <div className="bg-white p-8 md:p-10 rounded-[35px] max-w-md w-full shadow-2xl border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#00adb5]"></div>
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Protected Dashboard</h2>
          <p className="text-slate-400 font-medium text-xs mt-3 leading-relaxed">
            Masukkan kata sandi otorisasi untuk membuka berkas data pengawasan Kesepakatan Keluarga Cerdas AI.
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
                  <span>Kata sandi salah. Akses ditolak.</span>
                </div>
              )}
            </div>
            <button type="submit" className="w-full h-14 bg-[#0b0e14] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#00adb5] transition-all shadow-lg">
              Buka Akses Data
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700 pb-16 selection:bg-[#00adb5] selection:text-white">
      <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-40 border-b border-slate-100 px-4 md:px-8 py-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-black text-[#00adb5] leading-none tracking-tighter uppercase">Family Agreement Console</span>
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">EduMind Real-time Monitor</span>
          </div>
        </div>
        <button onClick={() => { setIsAuthenticated(false); setPasswordInput(""); }} className="h-10 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-500 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all border border-slate-200 cursor-pointer">
          Kunci Console
        </button>
      </nav>

      <div className="max-w-7xl mx-auto pt-24 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Pencarian Komitmen</h3>
            <div className="bg-slate-50 px-4 py-3 border border-slate-200/60 flex items-center gap-3 rounded-xl h-12">
              <Search size={16} className="text-slate-300 shrink-0" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama orang tua / anak..."
                className="bg-transparent outline-none text-xs font-bold w-full"
              />
            </div>

            {/* Navigasi Filter: Menggunakan Ukuran h-11 Proporsional Tanpa Gepeng */}
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/40 text-center">
              {[
                { id: "all", label: "Semua" },
                { id: "GREEN", label: "Adaptif" },
                { id: "YELLOW", label: "Berkembang" },
                { id: "RED", label: "Berisiko" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterLabel(tab.id)}
                  className={`h-11 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center ${filterLabel === tab.id ? "bg-white text-slate-800 shadow-sm font-black" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm flex flex-col h-[calc(100vh-320px)]">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <div className="flex items-center gap-1.5 text-slate-500">
                <ClipboardList size={14} className="text-[#00adb5]" />
                <span>Stream Keluarga Masuk ({filteredRecords.length})</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {loading ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#00adb5]" /></div>
              ) : filteredRecords.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-400 italic">Belum ada komitmen terekam.</div>
              ) : (
                filteredRecords.map((res) => {
                  const isSelected = selectedRecord?._id === res._id;
                  const labelColor = res.assessment?.label === "GREEN" ? "bg-emerald-500" : res.assessment?.label === "YELLOW" ? "bg-amber-500" : res.assessment?.label === "ORANGE" ? "bg-orange-500" : "bg-rose-500";
                  return (
                    <button
                      key={res._id}
                      type="button"
                      onClick={() => setSelectedRecord(res)}
                      className={`w-full text-left p-4 flex flex-col gap-1 transition-all border-none ${isSelected ? "bg-[#00adb5]/5 border-l-4 border-l-[#00adb5]" : "hover:bg-slate-50/60"}`}
                    >
                      <div className="flex justify-between items-start w-full gap-2">
                        <span className="text-xs font-black text-slate-800 truncate block">P: {res.metadata?.parent_name}</span>
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${labelColor}`} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 truncate block">C: {res.metadata?.child_name}</span>
                      <div className="flex justify-between text-[9px] font-medium text-slate-400 mt-1">
                        <span>Skor: {res.assessment?.total_score || "-"} / 50</span>
                        <span>{res.metadata?.agreement_date}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedRecord ? (
            <div className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] p-6 md:p-8 shadow-sm space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto animate-in fade-in duration-200">
              <header className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-[#00adb5]/10 text-[#00adb5] px-2.5 py-0.5 rounded">
                    Status: {selectedRecord.assessment?.category || "Belum Terkalkulasi"}
                  </span>
                  <h2 className="text-lg font-black text-slate-800">Keluarga: {selectedRecord.metadata?.parent_name} & {selectedRecord.metadata?.child_name}</h2>
                </div>
                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <Calendar size={13} />
                  <span>Tanggal: {selectedRecord.metadata?.agreement_date}</span>
                </div>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="block text-[9px] font-black text-slate-400 uppercase mb-1">Identitas Penandatangan Orang Tua</span>
                  <span className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase"><User size={14} className="text-[#00adb5]" /> {selectedRecord.metadata?.parent_name}</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="block text-[9px] font-black text-slate-400 uppercase mb-1">Identitas Penandatangan Anak</span>
                  <span className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase"><User size={14} className="text-[#00adb5]" /> {selectedRecord.metadata?.child_name}</span>
                </div>
              </div>

              {/* TAMPILAN JAWABAN DETIL ASESSMENT */}
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5">
                <div className="flex justify-between items-center border-b pb-2 mb-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Hasil Pengisian Lembar Self-Assessment</h4>
                  <span className="text-xs font-black text-[#00adb5]">Skor: {selectedRecord.assessment?.total_score} / 50</span>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {selectedRecord.assessment?.detailed_responses && Object.entries(selectedRecord.assessment.detailed_responses).map(([key, data]) => (
                    <div key={key} className="bg-white border p-3 rounded-xl flex justify-between items-center gap-4 text-xs">
                      <span className="font-bold text-slate-600">{data.question_text}</span>
                      <span className="font-black text-[#00adb5] bg-[#00adb5]/5 px-3 py-1 rounded-lg shrink-0">Skor {data.given_score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TAMPILAN JAWABAN LEMBAR KESEPAKATAN POIN KELUARGA */}
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-2 mb-1">Butir Kesepakatan Keluarga Cerdas AI</h4>
                <div className="space-y-2">
                  {selectedRecord.agreement?.detailed_signs && Object.entries(selectedRecord.agreement.detailed_signs).map(([key, data]) => (
                    <div key={key} className="bg-white border p-3 rounded-xl flex justify-between items-center gap-4 text-xs">
                      <span className="font-bold text-slate-600">{data.agreement_text}</span>
                      <span className={`font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 ${data.is_agreed ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                        {data.is_agreed ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                        {data.is_agreed ? "Setuju" : "Ditolak"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-[calc(100vh-140px)] bg-slate-50/50 border border-dashed border-slate-200 rounded-[35px] flex flex-col items-center justify-center text-slate-300">
              <FileText size={48} />
              <p className="mt-3 text-xs font-black uppercase tracking-wider">Pilih berkas keluarga untuk memantau data komitmen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}