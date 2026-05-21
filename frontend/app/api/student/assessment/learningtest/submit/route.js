import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
// Impor fungsi connectDB terpusat dari global cache library Anda
import { connectDB } from "@/lib/mongodb"; 

export async function POST(request) {
  try {
    // 1. Validasi Autentikasi Sesi User Siswa
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid atau kedaluwarsa. Silakan login kembali." }, 
        { status: 401 }
      );
    }

    // 2. Ambil payload kumpulan jawaban dari frontend
    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, message: "Payload jawaban tidak valid atau tidak lengkap." }, 
        { status: 400 }
      );
    }

    const studentIdStr = session.user.id;
    const userId = ObjectId.isValid(studentIdStr) ? new ObjectId(studentIdStr) : studentIdStr;

    // 3. Logika Akumulasi Nilai 3 Modalitas Gaya Belajar (VAK)
    const scoresAccumulator = {
      VISUAL: 0,
      AUDITORY: 0,
      KINESTHETIC: 0
    };

    // Lakukan mapping penjumlahan skor berdasarkan pilihan jawaban dari frontend
    answers.forEach(ans => {
      if (ans && ans.category) {
        const categoryKey = ans.category.toUpperCase();
        if (scoresAccumulator[categoryKey] !== undefined) {
          // Tambahkan skor (default +5 dari logika frontend page)
          scoresAccumulator[categoryKey] += (ans.score || 0);
        }
      }
    });

    // Transformasi ke format array objek untuk visualisasi chart/grafik batang di frontend
    const learningScoresArray = Object.keys(scoresAccumulator).map(key => ({
      category: key,
      value: scoresAccumulator[key]
    }));

    // Urutkan nilai skor dari yang tertinggi untuk mendapatkan dominasi gaya belajar utama siswa
    const sortedScores = [...learningScoresArray].sort((a, b) => b.value - a.value);
    const dominanStyle = sortedScores[0]; // Gaya belajar dengan total poin tertinggi

    // 4. Strukturisasi Skema Payload Baru (Setiap test melahirkan dokumen riwayat baru)
    const learningReportData = {
      student_id: userId,
      scores: learningScoresArray,
      hasil_dominan: {
        category: dominanStyle?.category || null,
        score: dominanStyle?.value || 0
      },
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 5. Eksekusi Penyimpanan ke Database Menggunakan Pooling Terpusat (Bebas Kebocoran Port Atlas)
    const client = await connectDB();
    const db = client.db();

    // Gunakan insertOne agar setiap kali test selesai terhitung sebagai data rekam baru
    const result = await db.collection('student_learning_style').insertOne(learningReportData);

    // Ambil string ID murni heksadesimal dari result.insertedId bawaan driver MongoDB
    const extractedIdStr = result.insertedId.toString();

    // 6. Sinkronisasi status pengerjaan siswa ke student_stats (Gunakan updateOne agar user statistik tetap tunggal)
    await db.collection('student_stats').updateOne(
      { student_id: userId },
      { 
        $set: { 
          learning_test_completed: true,
          last_learning_id: result.insertedId, // Menyimpan referensi ID dokumen test gaya belajar terakhir siswa
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Hasil asesmen gaya belajar (VAK) berhasil dikalkulasi dan disimpan sebagai riwayat baru.",
      resultId: extractedIdStr // String ID murni terjamin masuk ke frontend tanpa tumpang tindih [object Object]
    }, { status: 201 });

  } catch (error) {
    console.error("❌ ERROR_LEARNING_TEST_SUBMIT_API:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal pada server.", error: error.message }, 
      { status: 500 }
    );
  }
}