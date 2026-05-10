import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });

    const { answers } = await request.json();
    const userId = new ObjectId(session.user.id);

    // Logika Hitung Skor Per Kategori (Sederhana)
    const results = {
      "Logika & Riset": 0,
      "Seni & Kreatif": 0,
      "Sosial & Empati": 0,
      "Kepemimpinan": 0,
      "Teknis & Praktis": 0
    };

    answers.forEach(ans => {
      results[ans.category] += ans.score;
    });

    // Format data untuk disimpan
    const talentData = {
      student_id: userId,
      scores: Object.keys(results).map(key => ({
        subject: key,
        value: Math.min(results[key] * 10, 100), // Normalisasi ke 0-100
        color: key === "Sosial & Empati" ? "bg-[#00adb5]" : "bg-indigo-500"
      })),
      completedAt: new Date()
    };

    await client.connect();
    const db = client.db();
    
    // Simpan hasil talent
    await db.collection('student_talents').updateOne(
      { student_id: userId },
      { $set: talentData },
      { upsert: true }
    );

    // Update readiness di stats utama
    await db.collection('student_stats').updateOne(
      { student_id: userId },
      { $set: { career_readiness: 85 } } // Contoh kenaikan status
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}