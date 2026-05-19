import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
// Impor fungsi connectDB terpusat yang dipertahaman di folder lib Bapak
import { connectDB } from "@/lib/mongodb";

export async function POST(request) {
  try {
    // 1. Validasi Autentikasi Session User Siswa
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Sesi tidak valid atau kedaluwarsa" }, { status: 401 });
    }

    const { answers } = await request.json();
    const studentIdStr = session.user.id;
    
    // Validasi format ObjectId dari string session secara aman
    const userId = ObjectId.isValid(studentIdStr) ? new ObjectId(studentIdStr) : studentIdStr;

    // 2. Logika Hitung Skor Per Kategori Minat Bakat (Sederhana)
    const results = {
      "Logika & Riset": 0,
      "Seni & Kreatif": 0,
      "Sosial & Empati": 0,
      "Kepemimpinan": 0,
      "Teknis & Praktis": 0
    };

    if (Array.isArray(answers)) {
      answers.forEach(ans => {
        if (ans && ans.category && results[ans.category] !== undefined) {
          results[ans.category] += (ans.score || 0);
        }
      });
    }

    // 3. Format data untuk skema penyimpanan di MongoDB
    const talentData = {
      student_id: userId,
      scores: Object.keys(results).map(key => ({
        subject: key,
        value: Math.min(results[key] * 10, 100), // Normalisasi skor ke skala nilai 0-100
        color: key === "Sosial & Empati" ? "bg-[#00adb5]" : "bg-indigo-500"
      })),
      completedAt: new Date()
    };

    // 4. Gunakan koneksi pooling terpusat dari global cache
    const client = await connectDB();
    const db = client.db();
    
    // 5. Simpan atau perbarui (upsert) hasil analisis bakat siswa
    await db.collection('student_talents').updateOne(
      { student_id: userId },
      { $set: talentData },
      { upsert: true }
    );

    // 6. Perbarui nilai kesiapan karir (career readiness) pada statistik utama siswa
    await db.collection('student_stats').updateOne(
      { student_id: userId },
      { $set: { career_readiness: 85, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: "Hasil minat bakat berhasil disimpan" });
  } catch (error) {
    console.error("❌ ERROR AT POST STUDENT TALENT:", error);
    return NextResponse.json({ success: false, message: error.message || "Gagal menyimpan hasil penilaian" }, { status: 500 });
  }
}