import React from 'react';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongodb";
import RiasecResultView from "@/components/student/RiasecResultView"; // Sesuaikan alias path komponen Anda
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getRiasecResult(id) {
  try {
    if (!ObjectId.isValid(id)) return null;

    const client = await connectDB();
    const db = client.db();

    // Ambil dokumen hasil tes berdasarkan ID dokumen student_riasec
    const resultDoc = await db.collection('student_riasec').findOne({
      _id: new ObjectId(id)
    });

    return resultDoc;
  } catch (error) {
    console.error("❌ GAGAL_FETCH_RESULT_RIASEC_SERVER:", error);
    return null;
  }
}

export default async function RiasecResultDetailPage({ params }) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  // 1. Gate Autentikasi Keamanan Sesi Siswa
  if (!session) {
    return (
      <div className="text-center py-12 font-medium text-slate-500">
        Silakan login terlebih dahulu untuk melihat hasil analisis.
      </div>
    );
  }

  // 2. Ambil data secara aman dari database terpusat pooling global
  const resultData = await getRiasecResult(id);

  if (!resultData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Hasil Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400 font-medium">
          Data evaluasi asesmen RIASEC dengan token ID tersebut tidak terdaftar di sistem.
        </p>
        <a 
          href="/dashboard/student/talent"
          className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors"
        >
          Kembali ke EduTalent
        </a>
      </div>
    );
  }

  const isCompleted = resultData.scores && resultData.scores.length > 0;

  return (
    <div className="space-y-8 py-8 px-4">
      
      {/* Render Utama Client Component Hasil Bawaan Anda */}
      <RiasecResultView 
        isCompleted={isCompleted}
        peringkat1={resultData.peringkat1}
        peringkat2={resultData.peringkat2}
        rekomendasi={resultData.rekomendasi || null}
        keyword={`${resultData.peringkat1?.category} - ${resultData.peringkat2?.category}`}
      />

      {/* UPDATE: Tombol Navigasi Kembali Dipindahkan ke Bagian Paling Bawah */}
      <div className="max-w-4xl mx-auto text-center pt-6 border-t border-slate-100">
        <a 
          href="/dashboard/student/talent" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-slate-950 text-white rounded-2xl font-bold text-sm shadow-lg shadow-slate-950/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft size={16} /> Kembali ke Halaman Self Explore
        </a>
      </div>

    </div>
  );
}