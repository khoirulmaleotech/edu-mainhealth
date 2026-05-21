import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongodb"; 

export async function POST(request) {
  try {
    // 1. Validasi Autentikasi Keamanan Sesi Siswa
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Sesi tidak valid atau kedaluwarsa." }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, message: "Payload data tidak valid atau tidak lengkap." }, { status: 400 });
    }

    const studentIdStr = session.user.id;
    const userId = ObjectId.isValid(studentIdStr) ? new ObjectId(studentIdStr) : studentIdStr;

    // 2. Akumulasi Poin Skor Belahan Otak
    let scoreOtakKiri = 0;
    let scoreOtakKanan = 0;

    answers.forEach(ans => {
      if (ans && ans.category) {
        if (ans.category === "Otak Kiri") {
          scoreOtakKiri += (ans.score || 0);
        } else if (ans.category === "Otak Kanan") {
          scoreOtakKanan += (ans.score || 0);
        }
      }
    });

    const totalSkorKombinasi = scoreOtakKiri + scoreOtakKanan;
    
    // Perhitungan persentase rasio seimbang
    const persentaseKiri = totalSkorKombinasi > 0 ? Math.round((scoreOtakKiri / totalSkorKombinasi) * 100) : 50;
    const persentaseKanan = totalSkorKombinasi > 0 ? Math.round((scoreOtakKanan / totalSkorKombinasi) * 100) : 50;

    // Penentuan Kategori Dominan Tertinggi
    let dominasiHasil = "KESEIMBANGAN (SINKRONISASI)";
    if (persentaseKiri > persentaseKanan + 4) {
      dominasiHasil = "OTAK KIRI (ANALITIS-LOGIS)";
    } else if (persentaseKanan > persentaseKiri + 4) {
      dominasiHasil = "OTAK KANAN (KREATIF-INTUITIF)";
    }

    // 3. Strukturisasi Payload Penyimpanan Dokumen Baru
    const brainReportPayload = {
      student_id: userId,
      scores: [
        { category: "Otak Kiri", value: scoreOtakKiri, percentage: persentaseKiri },
        { category: "Otak Kanan", value: scoreOtakKanan, percentage: persentaseKanan }
      ],
      dominasi: dominasiHasil,
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 4. Eksekusi ke MongoDB Menggunakan Pooling Global Terpusat (Aman dari Connection Full)
    const client = await connectDB();
    const db = client.db();

    // Gunakan insertOne murni sesuai instruksi untuk mencatat data riwayat baru
    const result = await db.collection('student_brain_dominance').insertOne(brainReportPayload);
    const murniIdStr = result.insertedId.toString();

    // Sinkronisasi status flag pengerjaan siswa ke student_stats utama
    await db.collection('student_stats').updateOne(
      { student_id: userId },
      { 
        $set: { 
          brain_test_completed: true,
          last_brain_id: result.insertedId,
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Hasil dominasi belahan otak berhasil dipetakan.",
      resultId: murniIdStr
    }, { status: 201 });

  } catch (error) {
    console.error("❌ ERROR_BRAIN_TEST_SUBMIT_API:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}