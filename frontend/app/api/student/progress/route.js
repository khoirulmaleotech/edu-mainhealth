import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/authOptions';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = new ObjectId(session.user.id);
    await client.connect();
    const db = client.db();

    // 1. Ambil Ringkasan Statistik (Happiness, Career Readiness, Points)
    const stats = await db.collection('student_stats').findOne({ student_id: userId });

    // 2. Ambil Log Mood 7 Hari Terakhir
    const moodLogs = await db.collection('mood_logs')
      .find({ 
        student_id: userId,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: 1 })
      .toArray();

    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const moodChart = moodLogs.map(log => ({
      day: days[new Date(log.createdAt).getDay()],
      value: log.mood_score || 0,
      label: log.mood_label || "Normal"
    }));

    // --- PERBAIKAN DI SINI: MENGGUNAKAN KOLEKSI student_talents ---
    const talentData = await db.collection('student_talents').findOne({ student_id: userId });

    // Jika data talent ada, gunakan field 'scores' yang kita simpan saat submit assessment
    const cognitive_skills = talentData ? talentData.scores.map(item => ({
      label: item.subject, // Sesuai field 'subject' di API submit
      value: item.value,
      color: item.color || "bg-[#00adb5]"
    })) : [];

    // 4. Ambil Badge
    const badges = await db.collection('achievements')
      .find({ student_id: userId })
      .limit(4)
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        summary: stats || {
          happiness_index: 0,
          career_readiness: 0,
          behavior_points: 100,
          streak_count: 0
        },
        mood_chart: moodChart,
        cognitive_skills: cognitive_skills, // Sekarang berisi data asli dari minat bakat
        badges: badges
      }
    });

  } catch (error) {
    console.error("PROGRES_API_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}