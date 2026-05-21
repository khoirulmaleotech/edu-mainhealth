import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
// Impor fungsi connectDB terpusat dari global cache Bapak
import { connectDB } from "@/lib/mongodb"; 

export async function POST(request) {
  try {
    // 1. Validasi Autentikasi Sesi User Siswa
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Sesi kedaluwarsa." }, { status: 401 });
    }

    // 2. Parsing Payload Jawaban dari Frontend
    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, message: "Payload tidak valid." }, { status: 400 });
    }

    const studentIdStr = session.user.id;
    const userId = ObjectId.isValid(studentIdStr) ? new ObjectId(studentIdStr) : studentIdStr;

    // 3. Logika Akumulasi Nilai 6 Rumpun RIASEC
    const scoresAccumulator = { 
      REALISTIK: 0, 
      INVESTIGATIF: 0, 
      ARTISTIK: 0, 
      SOSIAL: 0, 
      ENTERPRISING: 0, 
      KONVENSIONAL: 0 
    };

    answers.forEach(ans => {
      if (ans && ans.category) {
        const categoryKey = ans.category.toUpperCase();
        if (scoresAccumulator[categoryKey] !== undefined) {
          scoresAccumulator[categoryKey] += (ans.score || 0);
        }
      }
    });

    // Transformasi ke format array objek untuk visualisasi grafik/chart harian di frontend
    const riasecScoresArray = Object.keys(scoresAccumulator).map(key => ({
      category: key,
      value: scoresAccumulator[key]
    }));

    // Urutkan skor dari tertinggi ke terendah untuk mencari Peringkat 1 & Peringkat 2
    const sortedScores = [...riasecScoresArray].sort((a, b) => b.value - a.value);
    
    // 4. Strukturisasi Skema Payload Baru (Setiap test akan melahirkan dokumen baru)
    const riasecReportData = {
      student_id: userId,
      scores: riasecScoresArray,
      peringkat1: { category: sortedScores[0]?.category || null, score: sortedScores[0]?.value || 0 },
      peringkat2: { category: sortedScores[1]?.category || null, score: sortedScores[1]?.value || 0 },
      completedAt: new Date(),
      createdAt: new Date(), // Menandakan kapan baris data riwayat ini dibuat
      updatedAt: new Date()
    };

    // 5. Eksekusi ke Database dengan Pooling Global Terpusat (Bebas dari Connection Full)
    const client = await connectDB();
    const db = client.db();

    // UBAH LOGIKA: Gunakan insertOne untuk membuat data baru setiap kali test selesai
    const result = await db.collection('student_riasec').insertOne(riasecReportData);

    // Ambil string ID murni secara aman dari result.insertedId driver MongoDB
    const extractedIdStr = result.insertedId.toString();

    // 6. Sinkronisasi status pengerjaan siswa ke student_stats (Tetap gunakan updateOne agar statistik user tunggal)
    await db.collection('student_stats').updateOne(
      { student_id: userId },
      { 
        $set: { 
          riasec_completed: true, 
          last_riasec_id: result.insertedId, // Menyimpan referensi ID test terakhir siswa jika dibutuhkan
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Hasil sukses dikalkulasi dan disimpan sebagai riwayat baru.",
      resultId: extractedIdStr // String ID murni terjamin masuk ke frontend tanpa query ulang
    }, { status: 201 });

  } catch (error) {
    console.error("❌ ERROR_RIASEC_SUBMIT_API:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}