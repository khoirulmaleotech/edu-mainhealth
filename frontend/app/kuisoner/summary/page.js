"use client";

import React, { useState, useEffect } from "react";
import { fetchInstance } from "@/lib/fetchInstance";
import { Loader2, ArrowLeft, Download, FileSpreadsheet, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function KuisonerSummaryPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState([]);

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
          processSummary(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const processSummary = (rawData) => {
    const grouped = {};
    rawData.forEach(item => {
      const email = item.metadata?.email?.trim().toLowerCase();
      if (!email) return;

      if (!grouped[email]) {
        grouped[email] = {
          email,
          school: item.metadata?.school_name || "-",
          pre_test: null,
          post_test: null
        };
      }

      if (item.assessment_type === "pre_test") {
        grouped[email].pre_test = item;
      } else if (item.assessment_type === "post_test") {
        grouped[email].post_test = item;
      }
    });

    const summary = Object.values(grouped).map(user => {
      const getMetrics = (testData) => {
        const metrics = testData?.part_A?.scaled_metrics || {};
        let total = 0;
        const qScores = {};
        for(let i=1; i<=15; i++) {
          const val = parseInt(metrics[i]) || 0;
          qScores[`Q${i}`] = val;
          total += val;
        }
        return { qScores, total };
      };

      const pre = getMetrics(user.pre_test);
      const post = getMetrics(user.post_test);

      const deltas = {};
      for(let i=1; i<=15; i++) {
         deltas[`Q${i}`] = post.qScores[`Q${i}`] - pre.qScores[`Q${i}`];
      }
      const totalDelta = post.total - pre.total;

      const hasBoth = !!(user.pre_test && user.post_test);

      return {
        ...user,
        pre,
        post,
        deltas,
        totalDelta,
        hasBoth
      };
    });

    summary.sort((a, b) => {
      if (a.hasBoth === b.hasBoth) {
        return a.email.localeCompare(b.email);
      }
      return a.hasBoth ? -1 : 1;
    });

    setSummaryData(summary);
  };

  const exportExcel = () => {
    const dataToExport = summaryData.map((user, idx) => {
      const row = {
        "No": idx + 1,
        "Email": user.email,
        "Sekolah": user.school,
        "Status": user.hasBoth ? "Lengkap (Pre & Post)" : (user.pre_test ? "Hanya Pre" : "Hanya Post"),
        "Total Pre-Test": user.pre.total,
        "Total Post-Test": user.post.total,
        "Selisih Total (Delta)": user.totalDelta,
      };

      for(let i=1; i<=15; i++) {
        row[`Pre Q${i}`] = user.pre.qScores[`Q${i}`];
        row[`Post Q${i}`] = user.post.qScores[`Q${i}`];
        row[`Delta Q${i}`] = user.deltas[`Q${i}`];
      }
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Summary Delta");
    XLSX.writeFile(workbook, `Summary_Delta_Kuisoner_${new Date().getTime()}.xlsx`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans selection:bg-[#00adb5] selection:text-white">
        <div className="bg-white p-8 md:p-10 rounded-[35px] max-w-md w-full shadow-2xl text-center border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#00adb5]"></div>
          
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200">
            <Lock size={28} />
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Summary Dashboard</h2>
          <p className="text-slate-400 font-medium text-xs mt-3 leading-relaxed">
            Silakan masukkan kata sandi otorisasi sistem untuk mengakses dan meninjau berkas summary delta kuesioner.
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700 pb-16 selection:bg-[#00adb5] selection:text-white">
      <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-40 border-b border-slate-100 px-4 md:px-8 py-4 flex justify-between items-center h-16 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/kuisoner/responden" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-black text-[#00adb5] leading-none tracking-tighter uppercase">Summary Delta</span>
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Pre-Test vs Post-Test</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => { setIsAuthenticated(false); setPasswordInput(""); }} className="h-10 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-500 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all border border-slate-200">
              Kunci Kembali
            </button>
            <button onClick={exportExcel} className="h-10 px-4 bg-[#00adb5] hover:bg-[#009299] text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2">
              <Download size={14} />
              Export Excel
            </button>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto pt-24 px-4 md:px-8">
        <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="text-[#00adb5]" size={20} />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Perbandingan Nilai Kuantitatif (Q1 - Q15)</h2>
          </div>

          {!loading && summaryData.length > 0 && (() => {
            const usersWithBoth = summaryData.filter(u => u.hasBoth);
            const totalPreTest = summaryData.filter(u => u.pre_test).length;
            const totalPostTest = summaryData.filter(u => u.post_test).length;
            const totalPos = usersWithBoth.filter(u => u.totalDelta > 0).length;
            const totalNeg = usersWithBoth.filter(u => u.totalDelta < 0).length;
            const totalZero = usersWithBoth.filter(u => u.totalDelta === 0).length;

            return (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-5 bg-white border-b border-slate-100">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Lengkap</span>
                  <span className="text-2xl font-black text-slate-800 mt-1">{usersWithBoth.length} <span className="text-xs text-slate-400 font-medium">Orang</span></span>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[10px] font-black uppercase text-blue-600/70 tracking-wider">Sudah Pre-Test</span>
                  <span className="text-2xl font-black text-blue-500 mt-1">{totalPreTest} <span className="text-xs text-blue-600/50 font-medium">Orang</span></span>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[10px] font-black uppercase text-purple-600/70 tracking-wider">Sudah Post-Test</span>
                  <span className="text-2xl font-black text-purple-500 mt-1">{totalPostTest} <span className="text-xs text-purple-600/50 font-medium">Orang</span></span>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[10px] font-black uppercase text-emerald-600/70 tracking-wider">Naik (+)</span>
                  <span className="text-2xl font-black text-emerald-500 mt-1">{totalPos} <span className="text-xs text-emerald-600/50 font-medium">Orang</span></span>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[10px] font-black uppercase text-rose-600/70 tracking-wider">Turun (-)</span>
                  <span className="text-2xl font-black text-rose-500 mt-1">{totalNeg} <span className="text-xs text-rose-600/50 font-medium">Orang</span></span>
                </div>
                <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Tetap (0)</span>
                  <span className="text-2xl font-black text-slate-600 mt-1">{totalZero} <span className="text-xs text-slate-400 font-medium">Orang</span></span>
                </div>
              </div>
            );
          })()}
          
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-[#00adb5] w-8 h-8" />
              </div>
            ) : summaryData.length === 0 ? (
              <div className="flex justify-center items-center h-64 text-slate-400 font-bold text-sm">
                Tidak ada data.
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-100/50 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="p-4 border-b border-r border-slate-200 min-w-[200px] sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Peserta</th>
                    <th className="p-4 border-b border-r border-slate-200 text-center">Status</th>
                    <th className="p-4 border-b border-r border-slate-200 text-center bg-slate-100">Total Pre</th>
                    <th className="p-4 border-b border-r border-slate-200 text-center bg-[#00adb5]/10 text-[#00adb5]">Total Post</th>
                    <th className="p-4 border-b border-r border-slate-200 text-center bg-rose-50 text-rose-500">Delta Total</th>
                    {[...Array(15)].map((_, i) => (
                      <th key={i} className="p-4 border-b border-slate-200 text-center min-w-[140px]">Q{i+1} (Pre|Post|Δ)</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {summaryData.map((user, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 border-r border-slate-100 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <span className="block font-black text-slate-800">{user.email}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold">{user.school}</span>
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center">
                        {user.hasBoth ? (
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase">Lengkap</span>
                        ) : user.pre_test ? (
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase">Pre Saja</span>
                        ) : (
                          <span className="px-2 py-1 bg-sky-50 text-sky-500 rounded text-[9px] font-black uppercase">Post Saja</span>
                        )}
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center font-black bg-slate-50/50">{user.pre.total}</td>
                      <td className="p-4 border-r border-slate-100 text-center font-black text-[#00adb5] bg-[#00adb5]/5">{user.post.total}</td>
                      <td className={`p-4 border-r border-slate-100 text-center font-black ${user.totalDelta > 0 ? 'text-emerald-500' : user.totalDelta < 0 ? 'text-rose-500' : 'text-slate-400'} bg-rose-50/30`}>
                        {user.totalDelta > 0 ? `+${user.totalDelta}` : user.totalDelta}
                      </td>
                      {[...Array(15)].map((_, i) => {
                        const pre = user.pre.qScores[`Q${i+1}`];
                        const post = user.post.qScores[`Q${i+1}`];
                        const delta = user.deltas[`Q${i+1}`];
                        return (
                          <td key={i} className="p-4 border-r border-slate-100 text-center whitespace-nowrap">
                            <span className="inline-block w-6 text-slate-400">{pre}</span>
                            <span className="mx-1 text-slate-300">|</span>
                            <span className="inline-block w-6 text-[#00adb5] font-bold">{post}</span>
                            <span className="mx-1 text-slate-300">|</span>
                            <span className={`inline-block w-6 font-black ${delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                              {delta > 0 ? `+${delta}` : delta}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
