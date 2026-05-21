import React from 'react';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongodb";
import { ArrowLeft, Award, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Kamus data konten statis analisis fungsionalitas belahan otak sesuai teks website lama Bapak
const BRAIN_PROFILE_CONTENT = {
  "OTAK KIRI (ANALITIS-LOGIS)": {
    title: "Otak Kiri (Linear & Analitis)",
    style: "text-blue-600 bg-blue-50 border-blue-100",
    bannerColor: "from-blue-900 to-slate-900",
    accentColor: "#2563eb",
    desc: "Anda cenderung memproses informasi secara linear, mengidentifikasi rincian penting secara mendalam, analitis, menyelesaikan pekerjaan secara berurutan, sistematis, matematis, penuh perhitungan, dan menggunakan logika kuat untuk memecahkan masalah harian.",
    characteristics: [
      "Berpikir logis, terstruktur, faktual, dan objektif",
      "Sangat menyukai keteraturan angka, hitungan, dan analisis statistik data",
      "Unggul dalam merencanakan langkah sekuensial kronologis atau algoritma komputer",
      "Lebih menyukai komunikasi verbal tertulis eksplisit yang bebas dari bias opini"
    ]
  },
  "OTAK KANAN (KREATIF-INTUITIF)": {
    title: "Otak Kanan (Holistik & Kreatif)",
    style: "text-purple-600 bg-purple-50 border-purple-100",
    bannerColor: "from-purple-900 to-slate-900",
    accentColor: "#9333ea",
    desc: "Anda memproses informasi secara holistik (menyeluruh), melihat hasil akhir dari sebuah rencana dengan kejelasan visi, kreatif, imajinatif, inovatif, menyelesaikan pekerjaan secara acak fleksibel, konseptual, serta mengandalkan intuisi tajam untuk menyelesaikan masalah.",
    characteristics: [
      "Berpikir divergen, kreatif, spasial, dan imajinatif tinggi",
      "Mudah menangkap ekspresi emosi, bahasa tubuh, seni rupa, dan melodi musik",
      "Unggul dalam menciptakan ide orisinil out-of-the-box atau konseptualisasi makro",
      "Menyukai kebebasan berekspresi tanpa sekat hambatan aturan birokrasi yang kaku"
    ]
  },
  "KESEIMBANGAN (SINKRONISASI)": {
    title: "Sinkronisasi Bilateral Hemisfer (Keseimbangan Kiri-Kanan)",
    style: "text-emerald-600 bg-emerald-50 border-emerald-100",
    bannerColor: "from-emerald-900 to-slate-900",
    accentColor: "#059669",
    desc: "Anda memiliki tingkat koordinasi bilateral belahan otak yang sangat berimbang. Anda mampu mengombinasikan ketajaman logika berpikir analitis-sistematis berurutan dengan fleksibilitas daya kreativitas-imajinatif intuitif di waktu yang bersamaan secara adaptif.",
    characteristics: [
      "Mampu menganalisis detail data teknis sekaligus merancang visi kreatif masa depan produk",
      "Sangat adaptif dalam menyeimbangkan kepribadian emosional (EQ) dan rasional intelektual (IQ)",
      "Mampu menyelesaikan masalah kompleks secara logis namun diimplementasikan lewat cara inovatif",
      "Nyaman bekerja di dalam lingkungan teratur ketat maupun lingkungan dinamis yang acak"
    ]
  }
};

async function getBrainDominanceResult(id) {
  try {
    if (!ObjectId.isValid(id)) return null;
    const client = await connectDB();
    const db = client.db();
    return await db.collection('student_brain_dominance').findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("❌ GAGAL_FETCH_RESULT_BRAIN_SERVER:", error);
    return null;
  }
}

export default async function BrainResultDetailPage({ params }) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div className="text-center py-12 text-sm font-semibold text-slate-400">Silakan login kembali.</div>;
  }

  const resultData = await getBrainDominanceResult(id);

  if (!resultData) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-6 space-y-4">
        <ShieldAlert className="text-red-500 mx-auto" size={48} />
        <h2 className="text-xl font-bold text-slate-800">Token Analisis Kedaluwarsa</h2>
        <p className="text-xs font-medium text-slate-400 leading-relaxed">Data riwayat dominasi belahan otak Anda tidak ditemukan atau salah rute pengetikan URL.</p>
        <a href="/dashboard/student/talent" className="inline-block px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm">Kembali</a>
      </div>
    );
  }

  const kiriData = resultData.scores?.find(s => s.category === "Otak Kiri") || { percentage: 50, value: 0 };
  const kananData = resultData.scores?.find(s => s.category === "Otak Kanan") || { percentage: 50, value: 0 };
  
  const currentDominasiKey = resultData.dominasi || "KESEIMBANGAN (SINKRONISASI)";
  const profile = BRAIN_PROFILE_CONTENT[currentDominasiKey] || BRAIN_PROFILE_CONTENT["KESEIMBANGAN (SINKRONISASI)"];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10 text-left">
      
      {/* ── SEKTOR BANNER UTAMA HASIL ANALISIS ── */}
      <div className={`bg-gradient-to-br ${profile.bannerColor} text-white p-8 md:p-12 rounded-[36px] shadow-md relative overflow-hidden`}>
        <div className="absolute right-0 bottom-0 opacity-5 translate-x-8 translate-y-8 pointer-events-none">
          <Activity size={260} />
        </div>
        <div className="space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 size={13} className="text-[#00adb5]" /> Brain Dominance Map
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
            Kecenderungan Anda: <br />
            <span className="text-[#00adb5]">{profile.title}</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
            {profile.desc}
          </p>
        </div>
      </div>

      {/* ── SEKTOR VISUALISASI RASIO PERSENTASE KESEIMBANGAN ── */}
      <div className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Award className="text-purple-500" size={18} />
            Rasio Keseimbangan Hemisfer Kiri & Kanan
          </h3>
          <p className="text-xs text-slate-400 font-medium">Grafik distribusi persentase aktivitas respon pemecahan masalah.</p>
        </div>

        {/* Bar Persentase Komparatif Dua Belahan */}
        <div className="space-y-3 pt-2">
          <div className="w-full h-8 bg-slate-100 rounded-full overflow-hidden flex font-bold text-xs text-white">
            <div 
              className="h-full bg-blue-600 flex items-center justify-start pl-4 transition-all duration-500"
              style={{ width: `${kiriData.percentage}%` }}
            >
              {kiriData.percentage >= 15 && `Otak Kiri ${kiriData.percentage}%`}
            </div>
            <div 
              className="h-full bg-purple-600 flex items-center justify-end pr-4 transition-all duration-500 ml-auto"
              style={{ width: `${kananData.percentage}%` }}
            >
              {kananData.percentage >= 15 && `Otak Kanan ${kananData.percentage}%`}
            </div>
          </div>
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
            <span>Rasional & Linier</span>
            <span>Intuitif & Kreatif</span>
          </div>
        </div>
      </div>

      {/* ── SEKTOR JABARAN KARAKTERISTIK GAYA KERJA SISWA ── */}
      <div className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Karakteristik Utama Profil Anda</h3>
          <p className="text-xs text-slate-400 font-medium">Manifestasi kebiasaan harian Anda dalam lingkungan belajar dan kerja kelompok:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile.characteristics.map((trait, index) => (
            <div key={index} className="p-5 border border-slate-50 bg-slate-50/50 rounded-2xl flex items-start gap-3 hover:border-slate-100 transition-colors">
              <div className="w-6 h-6 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                {trait}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── EKSLUSIF: TOMBOL BACK TO EDUTALENT DI BAGIAN PALING BAWAH ── */}
      <div className="text-center pt-4 border-t border-slate-100">
        <a 
          href="/dashboard/student/talent" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-slate-950 text-white rounded-2xl font-bold text-sm shadow-lg shadow-slate-950/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft size={16} /> Kembali ke Halaman Self Explorer
        </a>
      </div>

    </div>
  );
}