"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchInstance } from "@/lib/fetchInstance";
import { Loader2, ArrowLeft, Download, FileSpreadsheet, Lock, AlertCircle, Printer, BarChart3 } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const allQuestions = [
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
  { id: 12, text: "Saya dapat mengenali emosi yang sedang saya rasakan." },
  { id: 13, text: "Saya dapat mengendalikan diri ketika menghadapi situasi yang membuat saya kesal." },
  { id: 14, text: "Jika mengalami masalah serius, saya bersedia mencari bantuan." },
  { id: 15, text: "Saya tahu kepada siapa harus meminta bantuan ketika menghadapi masalah emosional." },
  { id: 16, text: "Jika sedang mengalami masalah berat, siapa orang yang PALING mungkin Anda ajak bicara?" },
  { id: 17, text: "Menurut Anda, apa tantangan terbesar yang dihadapi remaja saat ini?" },
  { id: 18, text: "Dalam 6 bulan terakhir, apakah Anda pernah mengalami bullying?" },
  { id: 19, text: "Dalam 6 bulan terakhir, apakah Anda pernah melakukan bullying kepada orang lain?" },
  { id: 20, text: "Jika pernah mengalami bullying, bentuk yang paling sering Anda alami adalah:" },
  { id: 21, text: "Dalam satu minggu terakhir, seberapa sering Anda mengalami atau melihat bullying di sekolah?" },
  { id: 22, text: "Dalam satu minggu terakhir, seberapa sering Anda mengalami atau melihat cyberbullying?" },
  { id: 23, text: "Menurut Anda, di mana cyberbullying paling sering terjadi?" },
  { id: 24, text: "Jika Anda pernah mengalami bullying, apa yang biasanya Anda lakukan?" },
  { id: 25, text: "Menurut Anda, apa perbedaan antara bullying dengan konflik biasa antar teman?" },
  { id: 26, text: "Jika Anda melihat teman sekolah mengalami stres emosional, apa tanda-tandanya?" },
  { id: 27, text: "Jika Anda melihat seseorang dibully, apa yang bisa Anda lakukan untuk membantunya?" },
  { id: 28, text: "Jika Anda ingin melaporkan kasus bullying di sekolah, kepada siapa Anda akan melapor dan mengapa?" },
  { id: 29, text: "Menurut Anda, apa alasan utama seorang korban bullying enggan melapor kepada guru atau orang tua?" },
  { id: 30, text: "Saran apa yang bisa Anda berikan agar sekolah menjadi tempat yang lebih aman dan nyaman dari bullying?" }
];

export default function PostTestSummaryPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [postTestData, setPostTestData] = useState([]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === "edumindeducourse") {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchInstance("/api/kuisoner/responses");
        if (response?.success) {
          const postTests = response.data.filter(item => item.assessment_type === "post_test");
          setPostTestData(postTests);
        }
      } catch (err) {
        console.error("Failed to fetch", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const chartData = useMemo(() => {
    if (!postTestData.length) return [];
    
    const sums = Array(15).fill(0);
    let count = 0;

    postTestData.forEach(item => {
      const metrics = item.part_A?.scaled_metrics;
      if (metrics) {
        count++;
        for (let i = 1; i <= 15; i++) {
          sums[i - 1] += parseInt(metrics[i]) || 0;
        }
      }
    });

    if (count === 0) return [];

    return sums.map((sum, index) => ({
      name: `Q${index + 1}`,
      average: Number((sum / count).toFixed(2))
    }));
  }, [postTestData]);

  const getMetrics = (item) => {
    const metrics = item.part_A?.scaled_metrics || {};
    let total = 0;
    const qScores = {};
    for (let i = 1; i <= 15; i++) {
      const val = parseInt(metrics[i]) || 0;
      qScores[`Q${i}`] = val;
      total += val;
    }
    return { qScores, total };
  };

  const exportExcel = () => {
    const dataToExport = postTestData.map((item, idx) => {
      const { qScores, total } = getMetrics(item);
      const row = {
        "No": idx + 1,
        "Email": item.metadata?.email || "-",
        "WhatsApp": item.metadata?.whatsapp || "-",
        "Sekolah": item.metadata?.school_name || "-",
        "Kelas": item.metadata?.student_class || "-",
        "Tanggal Pengisian": formatDate(item.timestamp),
        "Total Skor Part A": total,
      };

      // Part A
      for (let i = 1; i <= 15; i++) {
        row[`${allQuestions[i - 1].text}`] = qScores[`Q${i}`];
      }

      // Part A (Q16-Q17)
      row[`${allQuestions[15].text}`] = Array.isArray(item.part_A?.most_likely_confidant) ? item.part_A.most_likely_confidant.join(", ") : (item.part_A?.most_likely_confidant || "-");
      if (item.part_A?.most_likely_confidant?.includes("Lainnya")) {
        row[`${allQuestions[15].text} (Lainnya)`] = item.part_A?.most_likely_confidant_others || "-";
      }
      row[`${allQuestions[16].text}`] = item.part_A?.biggest_teen_challenge || "-";

      // Part B (Q18-Q24)
      row[`${allQuestions[17].text}`] = item.part_B?.experienced_bullying || "-";
      row[`${allQuestions[18].text}`] = item.part_B?.perpetrated_bullying || "-";
      row[`${allQuestions[19].text}`] = Array.isArray(item.part_B?.bullying_types_suffered) ? item.part_B.bullying_types_suffered.join(", ") : (item.part_B?.bullying_types_suffered || "-");
      if (item.part_B?.bullying_types_suffered?.includes("Lainnya")) {
        row[`${allQuestions[19].text} (Lainnya)`] = item.part_B?.bullying_types_suffered_others || "-";
      }
      row[`${allQuestions[20].text}`] = item.part_B?.school_bullying_frequency_weekly || "-";
      row[`${allQuestions[21].text}`] = item.part_B?.cyberbullying_frequency_weekly || "-";
      row[`${allQuestions[22].text}`] = Array.isArray(item.part_B?.cyberbullying_platforms) ? item.part_B.cyberbullying_platforms.join(", ") : (item.part_B?.cyberbullying_platforms || "-");
      if (item.part_B?.cyberbullying_platforms?.includes("Lainnya")) {
        row[`${allQuestions[22].text} (Lainnya)`] = item.part_B?.cyberbullying_platforms_others || "-";
      }
      row[`${allQuestions[23].text}`] = Array.isArray(item.part_B?.victim_coping_mechanism) ? item.part_B.victim_coping_mechanism.join(", ") : (item.part_B?.victim_coping_mechanism || "-");

      // Part C (Q25-Q30)
      row[`${allQuestions[24].text}`] = item.part_C?.bullying_vs_conflict_definition || "-";
      row[`${allQuestions[25].text}`] = item.part_C?.emotional_distress_signs_bystander || "-";
      row[`${allQuestions[26].text}`] = item.part_C?.bystander_intervention_action || "-";
      row[`${allQuestions[27].text}`] = `Target: ${item.part_C?.help_seeking_target || "-"} | Alasan: ${item.part_C?.help_seeking_reason || "-"}`;
      row[`${allQuestions[28].text}`] = item.part_C?.victim_silence_reason || "-";
      row[`${allQuestions[29].text}`] = item.part_C?.school_safe_environment_recommendation || "-";

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Raw Data Post-Test");
    XLSX.writeFile(workbook, `Data_Mentah_Post_Test_${new Date().getTime()}.xlsx`);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans selection:bg-[#00adb5] selection:text-white">
        <div className="bg-white p-8 md:p-10 rounded-[35px] max-w-md w-full shadow-2xl text-center border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#00adb5]"></div>
          
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200">
            <Lock size={28} />
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Post-Test Data Access</h2>
          <p className="text-slate-400 font-medium text-xs mt-3 leading-relaxed">
            Silakan masukkan kata sandi otorisasi sistem untuk mengakses data mentah Post-Test Kuesioner.
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

            <button type="submit" className="w-full h-13 bg-[#0b0e14] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#00adb5] transition-all py-3.5 shadow-lg shadow-slate-900/10">
              Buka Akses Data
            </button>
          </form>
          
          <div className="mt-6">
            <Link href="/kuisoner/responden" className="text-[10px] font-bold text-slate-400 hover:text-[#00adb5] uppercase tracking-widest transition-colors flex items-center justify-center gap-1">
               <ArrowLeft size={12} /> Kembali ke Responden
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const averageTotal = postTestData.length > 0
    ? (postTestData.reduce((acc, item) => acc + getMetrics(item).total, 0) / postTestData.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700 pb-16 selection:bg-[#00adb5] selection:text-white print:bg-white print:pb-0">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .print-hidden { display: none !important; }
          .print-full-width { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print-shadow-none { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
        }
      `}} />

      <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-40 border-b border-slate-100 px-4 md:px-8 py-4 flex justify-between items-center h-16 shadow-sm print-hidden">
        <div className="flex items-center gap-4">
          <Link href="/kuisoner/responden" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-black text-[#00adb5] leading-none tracking-tighter uppercase">Post-Test Data</span>
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Raw Data & Grafik Rangkuman</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => { setIsAuthenticated(false); setPasswordInput(""); }} className="h-10 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-500 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all border border-slate-200">
              Kunci Kembali
            </button>
            <button onClick={handlePrintPDF} className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2">
              <Printer size={14} />
              Cetak PDF
            </button>
            <button onClick={exportExcel} className="h-10 px-4 bg-[#00adb5] hover:bg-[#009299] text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2">
              <Download size={14} />
              Export Excel
            </button>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto pt-24 px-4 md:px-8 print:pt-4 print:px-2 print-full-width">
        <div className="mb-6 hidden print:block">
           <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wider">Laporan Post-Test Kuesioner</h1>
           <p className="text-sm text-slate-500">Dicetak pada: {formatDate(new Date())}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
           <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm flex items-center gap-5 print-shadow-none">
              <div className="w-16 h-16 bg-[#00adb5]/10 text-[#00adb5] rounded-2xl flex items-center justify-center">
                 <FileSpreadsheet size={28} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Partisipan Post-Test</p>
                 <h3 className="text-3xl font-black text-slate-800 mt-1">{postTestData.length} <span className="text-sm text-slate-400 font-medium">Orang</span></h3>
              </div>
           </div>
           
           <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm flex items-center gap-5 print-shadow-none">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                 <BarChart3 size={28} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Rata-Rata Skor Total</p>
                 <h3 className="text-3xl font-black text-slate-800 mt-1">{averageTotal} <span className="text-sm text-slate-400 font-medium">Poin</span></h3>
              </div>
           </div>
        </div>

        {/* Legend Section */}
        <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-6 print-shadow-none print:break-inside-avoid">
          <div className="p-5 bg-slate-50 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Daftar Pertanyaan Kuesioner (Q1 - Q15)</h2>
            <p className="text-xs text-slate-500 mt-1">Referensi butir pertanyaan untuk membaca metrik pada grafik dan tabel di bawah.</p>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 bg-white">
            {allQuestions.map(q => (
               <div key={q.id} className="flex gap-2.5 items-start">
                 <span className="text-[10px] font-black bg-[#00adb5]/10 text-[#00adb5] px-2 py-1 rounded-md shrink-0 mt-0.5 w-8 text-center">Q{q.id}</span>
                 <span className="text-xs text-slate-600 font-medium leading-relaxed">{q.text}</span>
               </div>
            ))}
          </div>
        </div>

        {/* Chart Section */}
        {postTestData.length > 0 && chartData.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-6 print-shadow-none print:break-inside-avoid">
             <div className="p-5 bg-slate-50 border-b border-slate-100">
               <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Rata-Rata Nilai per Pertanyaan (Q1 - Q15)</h2>
               <p className="text-xs text-slate-500 mt-1">Grafik batang yang menunjukkan skor rata-rata untuk setiap pertanyaan pada seluruh populasi post-test.</p>
             </div>
             <div className="p-6 h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                   <Tooltip 
                     cursor={{ fill: '#f8fafc' }}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                   />
                   <Bar dataKey="average" radius={[6, 6, 0, 0]} barSize={40}>
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#00adb5" : "#38bdf8"} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        )}

        {/* Data Table Section */}
        <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden print-shadow-none print:mt-8">
          <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center print:bg-white print:border-b-2 print:border-slate-800">
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Data Mentah Post-Test</h2>
              <p className="text-xs text-slate-500 mt-1">Seluruh rincian hasil post-test individu beserta skor per pertanyaan.</p>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-[#00adb5] w-8 h-8" />
              </div>
            ) : postTestData.length === 0 ? (
              <div className="flex justify-center items-center h-64 text-slate-400 font-bold text-sm">
                Tidak ada data Post-Test.
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[1200px] print:min-w-full">
                <thead>
                  <tr className="bg-slate-100/50 text-[10px] font-black uppercase text-slate-500 tracking-wider print:bg-slate-100">
                    <th className="p-4 border-b border-r border-slate-200">No</th>
                    <th className="p-4 border-b border-r border-slate-200 min-w-[200px]">Peserta</th>
                    <th className="p-4 border-b border-r border-slate-200 text-center bg-blue-50/50">Skor Total</th>
                    {[...Array(15)].map((_, i) => (
                      <th key={i} className="p-4 border-b border-slate-200 text-center">Q{i+1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {postTestData.map((item, idx) => {
                    const { qScores, total } = getMetrics(item);
                    return (
                      <tr key={item._id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 border-r border-slate-100 text-center text-slate-400">{idx + 1}</td>
                        <td className="p-4 border-r border-slate-100">
                          <span className="block font-black text-slate-800">{item.metadata?.email || "-"}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">{item.metadata?.school_name || "-"}</span>
                        </td>
                        <td className="p-4 border-r border-slate-100 text-center font-black text-blue-500 bg-blue-50/30 text-sm">
                          {total}
                        </td>
                        {[...Array(15)].map((_, i) => (
                          <td key={i} className="p-4 border-r border-slate-100 text-center text-slate-500">
                            {qScores[`Q${i+1}`]}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
