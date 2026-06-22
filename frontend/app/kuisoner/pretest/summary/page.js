"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchInstance } from "@/lib/fetchInstance";
import { Loader2, ArrowLeft, Download, FileSpreadsheet, Lock, AlertCircle, Printer, BarChart3 } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

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

const COLORS = [
  '#00adb5', '#38bdf8', '#818cf8', '#a78bfa', '#e879f9', 
  '#fb7185', '#f43f5e', '#fb923c', '#facc15', '#a3e635', 
  '#4ade80', '#2dd4bf', '#0ea5e9', '#6366f1', '#d946ef'
];

export default function PreTestSummaryPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [preTestData, setPreTestData] = useState([]);

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
          const preTests = response.data.filter(item => item.assessment_type === "pre_test");
          setPreTestData(preTests);
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
    if (!preTestData.length) return [];
    
    const sums = Array(15).fill(0);
    let count = 0;

    preTestData.forEach(item => {
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
  }, [preTestData]);

  const pieChartData = useMemo(() => {
    if (!preTestData.length) return {};
    
    const getLevenshteinDistance = (a, b) => {
      const matrix = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
          }
        }
      }
      return matrix[b.length][a.length];
    };

    const normalizeText = (text) => {
      if (typeof text !== 'string') return String(text);
      return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
    };

    const getSimilarity = (s1, s2) => {
      let longer = s1;
      let shorter = s2;
      if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
      }
      let longerLength = longer.length;
      if (longerLength === 0) return 1.0;
      return (longerLength - getLevenshteinDistance(longer, shorter)) / parseFloat(longerLength);
    };

    const freqs = {};

    for (let i = 16; i <= 30; i++) {
      freqs[i] = {};
    }

    const processSingleAnswer = (qId, answer) => {
      let finalAnswer = answer;
      const cleanAns = normalizeText(answer);
      
      const existingKeys = Object.keys(freqs[qId]);
      let foundMatch = false;
      
      if (cleanAns === "") {
        freqs[qId]["Tidak Menjawab"] = (freqs[qId]["Tidak Menjawab"] || 0) + 1;
        return;
      }

      for (const key of existingKeys) {
        if (key === "Tidak Menjawab") continue;
        const cleanKey = normalizeText(key);
        // Case exact match or high similarity
        if (cleanKey === cleanAns || getSimilarity(cleanKey, cleanAns) > 0.75) {
          finalAnswer = key; // Group into existing key
          foundMatch = true;
          break;
        }
      }
      freqs[qId][finalAnswer] = (freqs[qId][finalAnswer] || 0) + 1;
    };

    const addFreq = (qId, answer) => {
      if (!answer || answer === "-") {
        freqs[qId]["Tidak Menjawab"] = (freqs[qId]["Tidak Menjawab"] || 0) + 1;
        return;
      }
      if (Array.isArray(answer)) {
        if (answer.length === 0) {
          freqs[qId]["Tidak Menjawab"] = (freqs[qId]["Tidak Menjawab"] || 0) + 1;
          return;
        }
        answer.forEach(a => {
          processSingleAnswer(qId, a);
        });
      } else {
        processSingleAnswer(qId, answer);
      }
    };

    preTestData.forEach(item => {
      addFreq(16, item.part_A?.most_likely_confidant);
      addFreq(17, item.part_A?.biggest_teen_challenge);
      addFreq(18, item.part_B?.experienced_bullying);
      addFreq(19, item.part_B?.perpetrated_bullying);
      addFreq(20, item.part_B?.bullying_types_suffered);
      addFreq(21, item.part_B?.school_bullying_frequency_weekly);
      addFreq(22, item.part_B?.cyberbullying_frequency_weekly);
      addFreq(23, item.part_B?.cyberbullying_platforms);
      addFreq(24, item.part_B?.victim_coping_mechanism);
      addFreq(25, item.part_C?.bullying_vs_conflict_definition);
      addFreq(26, item.part_C?.emotional_distress_signs_bystander);
      addFreq(27, item.part_C?.bystander_intervention_action);
      addFreq(28, item.part_C?.help_seeking_target);
      addFreq(29, item.part_C?.victim_silence_reason);
      addFreq(30, item.part_C?.school_safe_environment_recommendation);
    });

    const result = {};
    for (let i = 16; i <= 30; i++) {
      const entries = Object.entries(freqs[i])
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      
      const totalAnswers = entries.reduce((acc, curr) => acc + curr.value, 0);
      result[i] = {
        data: entries,
        totalAnswers
      };
    }

    return result;
  }, [preTestData]);

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

  const [isExporting, setIsExporting] = useState(false);

  const exportExcel = async () => {
    setIsExporting(true);
    try {
      const ExcelJS = (await import('exceljs')).default;
      const html2canvas = (await import('html2canvas')).default;
      const { saveAs } = await import('file-saver');

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Raw Data Pre-Test');

      // Define columns
      const columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'WhatsApp', key: 'whatsapp', width: 15 },
        { header: 'Sekolah', key: 'sekolah', width: 25 },
        { header: 'Kelas', key: 'kelas', width: 10 },
        { header: 'Tanggal Pengisian', key: 'tanggal', width: 20 },
        { header: 'Total Skor Part A', key: 'total', width: 15 },
      ];

      for (let i = 1; i <= 15; i++) {
        columns.push({ header: allQuestions[i - 1].text, key: `q${i}`, width: 20 });
      }
      
      columns.push({ header: allQuestions[15].text, key: `q16`, width: 30 });
      columns.push({ header: `${allQuestions[15].text} (Lainnya)`, key: `q16_lain`, width: 20 });
      columns.push({ header: allQuestions[16].text, key: `q17`, width: 30 });

      columns.push({ header: allQuestions[17].text, key: `q18`, width: 30 });
      columns.push({ header: allQuestions[18].text, key: `q19`, width: 30 });
      columns.push({ header: allQuestions[19].text, key: `q20`, width: 30 });
      columns.push({ header: `${allQuestions[19].text} (Lainnya)`, key: `q20_lain`, width: 20 });
      columns.push({ header: allQuestions[20].text, key: `q21`, width: 30 });
      columns.push({ header: allQuestions[21].text, key: `q22`, width: 30 });
      columns.push({ header: allQuestions[22].text, key: `q23`, width: 30 });
      columns.push({ header: `${allQuestions[22].text} (Lainnya)`, key: `q23_lain`, width: 20 });
      columns.push({ header: allQuestions[23].text, key: `q24`, width: 30 });

      columns.push({ header: allQuestions[24].text, key: `q25`, width: 30 });
      columns.push({ header: allQuestions[25].text, key: `q26`, width: 30 });
      columns.push({ header: allQuestions[26].text, key: `q27`, width: 30 });
      columns.push({ header: allQuestions[27].text, key: `q28`, width: 30 });
      columns.push({ header: allQuestions[28].text, key: `q29`, width: 30 });
      columns.push({ header: allQuestions[29].text, key: `q30`, width: 30 });

      worksheet.columns = columns;

      preTestData.forEach((item, idx) => {
        const { qScores, total } = getMetrics(item);
        const row = {
          no: idx + 1,
          email: item.metadata?.email || "-",
          whatsapp: item.metadata?.whatsapp || "-",
          sekolah: item.metadata?.school_name || "-",
          kelas: item.metadata?.student_class || "-",
          tanggal: formatDate(item.timestamp),
          total: total,
        };

        for (let i = 1; i <= 15; i++) {
          row[`q${i}`] = qScores[`Q${i}`];
        }

        row.q16 = Array.isArray(item.part_A?.most_likely_confidant) ? item.part_A.most_likely_confidant.join(", ") : (item.part_A?.most_likely_confidant || "-");
        row.q16_lain = item.part_A?.most_likely_confidant_others || "-";
        row.q17 = item.part_A?.biggest_teen_challenge || "-";

        row.q18 = item.part_B?.experienced_bullying || "-";
        row.q19 = item.part_B?.perpetrated_bullying || "-";
        row.q20 = Array.isArray(item.part_B?.bullying_types_suffered) ? item.part_B.bullying_types_suffered.join(", ") : (item.part_B?.bullying_types_suffered || "-");
        row.q20_lain = item.part_B?.bullying_types_suffered_others || "-";
        row.q21 = item.part_B?.school_bullying_frequency_weekly || "-";
        row.q22 = item.part_B?.cyberbullying_frequency_weekly || "-";
        row.q23 = Array.isArray(item.part_B?.cyberbullying_platforms) ? item.part_B.cyberbullying_platforms.join(", ") : (item.part_B?.cyberbullying_platforms || "-");
        row.q23_lain = item.part_B?.cyberbullying_platforms_others || "-";
        row.q24 = Array.isArray(item.part_B?.victim_coping_mechanism) ? item.part_B.victim_coping_mechanism.join(", ") : (item.part_B?.victim_coping_mechanism || "-");

        row.q25 = item.part_C?.bullying_vs_conflict_definition || "-";
        row.q26 = item.part_C?.emotional_distress_signs_bystander || "-";
        row.q27 = item.part_C?.bystander_intervention_action || "-";
        row.q28 = `Target: ${item.part_C?.help_seeking_target || "-"} | Alasan: ${item.part_C?.help_seeking_reason || "-"}`;
        row.q29 = item.part_C?.victim_silence_reason || "-";
        row.q30 = item.part_C?.school_safe_environment_recommendation || "-";

        worksheet.addRow(row);
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

      const chartWorksheet = workbook.addWorksheet('Grafik Pie Chart');
      let currentRow = 2; 

      for (const q of allQuestions.slice(15)) {
        const el = document.getElementById(`chart-q${q.id}`);
        if (el) {
          try {
            const canvas = await html2canvas(el, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            
            const imageId = workbook.addImage({
              base64: imgData,
              extension: 'png',
            });

            chartWorksheet.getCell(`B${currentRow}`).value = `Q${q.id} - ${q.text}`;
            chartWorksheet.getCell(`B${currentRow}`).font = { bold: true, size: 14 };

            let targetWidth = 600;
            let targetHeight = Math.floor((canvas.height * targetWidth) / canvas.width);

            chartWorksheet.addImage(imageId, {
              tl: { col: 1, row: currentRow + 1 },
              ext: { width: targetWidth, height: targetHeight }
            });

            currentRow += Math.ceil(targetHeight / 20) + 4; 
          } catch (e) {
            console.error("Failed to generate image for", q.id, e);
          }
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Data_Mentah_Pre_Test_${new Date().getTime()}.xlsx`);
    } catch (err) {
      console.error("Export error:", err);
      alert("Terjadi kesalahan saat mengexport Excel.");
    } finally {
      setIsExporting(false);
    }
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

          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Pre-Test Data Access</h2>
          <p className="text-slate-400 font-medium text-xs mt-3 leading-relaxed">
            Silakan masukkan kata sandi otorisasi sistem untuk mengakses data mentah Pre-Test Kuesioner.
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

  const averageTotal = preTestData.length > 0
    ? (preTestData.reduce((acc, item) => acc + getMetrics(item).total, 0) / preTestData.length).toFixed(1)
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
            <span className="text-base md:text-lg font-black text-[#00adb5] leading-none tracking-tighter uppercase">Pre-Test Data</span>
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
            <button onClick={exportExcel} disabled={isExporting} className={`h-10 px-4 ${isExporting ? "bg-slate-300 cursor-not-allowed" : "bg-[#00adb5] hover:bg-[#009299]"} text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2`}>
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {isExporting ? "Memproses..." : "Export Excel"}
            </button>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto pt-24 px-4 md:px-8 print:pt-4 print:px-2 print-full-width">
        <div className="mb-6 hidden print:block">
           <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wider">Laporan Pre-Test Kuesioner</h1>
           <p className="text-sm text-slate-500">Dicetak pada: {formatDate(new Date())}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
           <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm flex items-center gap-5 print-shadow-none">
              <div className="w-16 h-16 bg-[#00adb5]/10 text-[#00adb5] rounded-2xl flex items-center justify-center">
                 <FileSpreadsheet size={28} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Partisipan Pre-Test</p>
                 <h3 className="text-3xl font-black text-slate-800 mt-1">{preTestData.length} <span className="text-sm text-slate-400 font-medium">Orang</span></h3>
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
        {preTestData.length > 0 && chartData.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-6 print-shadow-none print:break-inside-avoid">
             <div className="p-5 bg-slate-50 border-b border-slate-100">
               <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Rata-Rata Nilai per Pertanyaan (Q1 - Q15)</h2>
               <p className="text-xs text-slate-500 mt-1">Grafik batang yang menunjukkan skor rata-rata untuk setiap pertanyaan pada seluruh populasi pre-test.</p>
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

        {/* Pie Charts Section for Q16-Q30 */}
        {preTestData.length > 0 && Object.keys(pieChartData).length > 0 && (
          <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-6 print-shadow-none print:break-inside-avoid">
            <div className="p-5 bg-slate-50 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Distribusi Jawaban (Q16 - Q30)</h2>
              <p className="text-xs text-slate-500 mt-1">Grafik lingkaran yang menunjukkan persentase distribusi jawaban untuk pertanyaan pilihan/isian.</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white">
              {allQuestions.slice(15).map(q => {
                const chartInfo = pieChartData[q.id];
                if (!chartInfo || chartInfo.data.length === 0) return null;
                const { data, totalAnswers } = chartInfo;
                
                return (
                  <div key={q.id} id={`chart-q${q.id}`} className="flex flex-col items-center bg-slate-50 border border-slate-100 rounded-[20px] p-5 shadow-sm print-shadow-none">
                    <h3 className="text-xs font-bold text-slate-700 text-center mb-4 min-h-[40px] flex items-center justify-center w-full px-2">
                      <span className="text-[#00adb5] mr-1 shrink-0">Q{q.id}:</span> 
                      <span className="line-clamp-2" title={q.text}>{q.text}</span>
                    </h3>
                    <div className="h-[220px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value, name) => [`${value} jawaban (${((value / totalAnswers) * 100).toFixed(1)}%)`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className="text-xs font-black text-slate-400">Q{q.id}</span>
                      </div>
                    </div>
                    <div className="mt-5 w-full flex flex-col gap-2.5 max-h-[160px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                      {data.map((entry, index) => (
                        <div key={index} className="flex justify-between items-start text-[10px]">
                          <div className="flex items-start gap-2 flex-1 min-w-0 pr-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-[3px]" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-slate-600 font-medium line-clamp-3" title={entry.name}>{entry.name}</span>
                          </div>
                          <span className="font-black text-slate-800 shrink-0">{((entry.value / totalAnswers) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Data Table Section */}
        <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden print-shadow-none print:mt-8">
          <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center print:bg-white print:border-b-2 print:border-slate-800">
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Data Mentah Pre-Test</h2>
              <p className="text-xs text-slate-500 mt-1">Seluruh rincian hasil pre-test individu beserta skor per pertanyaan.</p>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-[#00adb5] w-8 h-8" />
              </div>
            ) : preTestData.length === 0 ? (
              <div className="flex justify-center items-center h-64 text-slate-400 font-bold text-sm">
                Tidak ada data Pre-Test.
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
                  {preTestData.map((item, idx) => {
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
