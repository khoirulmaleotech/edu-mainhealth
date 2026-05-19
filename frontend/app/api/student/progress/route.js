import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/authOptions';
// Impor fungsi connectDB terpusat yang dipertahankan di folder lib Bapak
import { connectDB } from "@/lib/mongodb"; 

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Validasi Autentikasi Sesi User Siswa
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const studentIdStr = session.user.id;
    // Validasi format ObjectId dari string session secara aman
    const userId = ObjectId.isValid(studentIdStr) ? new ObjectId(studentIdStr) : studentIdStr;

    // 2. Gunakan koneksi pooling terpusat dari global cache (Aman dari Connection Full)
    const client = await connectDB();
    const db = client.db();

    // 3. Ambil Streak (Untuk Sidebar / Widget Konten)
    const stats = await db.collection('student_stats').findOne({ student_id: userId });

    // 4. Ambil Riwayat Mood (7 Entri Terakhir)
    const moodHistory = await db.collection('mood_logs')
      .find({ student_id: userId })
      .sort({ createdAt: -1 })
      .limit(7)
      .toArray();

    // 5. Ambil Data Talent Mapping (Minat Bakat)
    const talentData = await db.collection('student_talents').findOne({ student_id: userId });
    
    const cognitive_skills = talentData && Array.isArray(talentData.scores) 
      ? talentData.scores.map(item => ({
          label: item.subject, 
          value: item.value,
          color: item.color || "bg-[#00adb5]"
        })) 
      : [];

    // 6. Kembalikan payload data teragregasi ke frontend
    return NextResponse.json({
      success: true,
      data: {
        streak_count: stats?.streak_count || 0,
        mood_history: moodHistory,
        cognitive_skills: cognitive_skills
      }
    });

  } catch (error) {
    console.error("❌ PROGRES_API_ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Gagal memproses data progres siswa" 
    }, { status: 500 });
  }
}