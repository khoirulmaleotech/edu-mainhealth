import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const uri = process.env.MONGODB_URI;

export async function POST(request) {
  const client = new MongoClient(uri);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ success: false }, { status: 401 });

    const { mood, label } = await request.json();
    const userId = new ObjectId(session.user.id);

    await client.connect();
    const db = client.db();

    // 1. SIMPAN MOOD LOG (Seperti biasa)
    const newLog = {
      student_id: userId,
      mood,
      label,
      createdAt: new Date(),
    };
    await db.collection("mood_logs").insertOne(newLog);

    // 2. LOGIKA OTOMATISASI STREAK (KONSISTENSI)
    // Update streak_count di koleksi student_stats (Upsert: buat jika belum ada)
    await db.collection("student_stats").updateOne(
      { student_id: userId },
      {
        $inc: { streak_count: 1 }, // Tambah 1 setiap check-in
        $set: { last_activity: new Date() },
      },
      { upsert: true },
    );

    // 3. LOGIKA OTOMATISASI ACHIEVEMENT (BADGE)
    // Cek apakah ini pertama kalinya siswa check-in mood
    const totalLogs = await db
      .collection("mood_logs")
      .countDocuments({ student_id: userId });

    if (totalLogs === 1) {
      // Jika pertama kali, beri Badge "Langkah Awal"
      await db.collection("achievements").updateOne(
        { student_id: userId, label: "Langkah Awal" },
        {
          $set: {
            icon: "🌱",
            color: "bg-emerald-50",
            awardedAt: new Date(),
          },
        },
        { upsert: true },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mood & Stats updated!",
    });
  } catch (error) {
    console.error("MOOD_AUTO_UPDATE_ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function GET(request) {
  const client = new MongoClient(uri);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ success: false }, { status: 401 });

    const userId = new ObjectId(session.user.id);
    await client.connect();
    const db = client.db();

    const logs = await db
      .collection("mood_logs")
      .find({ student_id: userId })
      .sort({ createdAt: -1 })
      .toArray();

    const summary = {
      latestMood: logs[0] || null,
      totalLogs: logs.length,
    };

    return NextResponse.json({ success: true, logs, summary });
  } catch (error) {
    console.error("MOOD_GET_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}