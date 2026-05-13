import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/authOptions';

export const dynamic = 'force-dynamic';

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

    // 1. Ambil Streak (Untuk Sidebar)
    const stats = await db.collection('student_stats').findOne({ student_id: userId });

    // 2. Ambil Riwayat Mood (7 Terakhir)
    const moodHistory = await db.collection('mood_logs')
      .find({ student_id: userId })
      .sort({ createdAt: -1 })
      .limit(7)
      .toArray();

    // 3. Ambil Data Talent Mapping
    const talentData = await db.collection('student_talents').findOne({ student_id: userId });
    const cognitive_skills = talentData ? talentData.scores.map(item => ({
      label: item.subject, 
      value: item.value,
      color: item.color || "bg-[#00adb5]"
    })) : [];

    return NextResponse.json({
      success: true,
      data: {
        streak_count: stats?.streak_count || 0,
        mood_history: moodHistory,
        cognitive_skills: cognitive_skills
      }
    });

  } catch (error) {
    console.error("PROGRES_API_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}