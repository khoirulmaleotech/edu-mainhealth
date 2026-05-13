import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MongoClient, ObjectId } from "mongodb";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export const dynamic = 'force-dynamic';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI belum tersedia");
}


export async function GET(request) {
  let client;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    client = new MongoClient(uri);

    await client.connect();

    const db = client.db();

    const url = new URL(request.url);

    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const link = await db.collection("family_links").findOne({
      parent_email: session.user.email,
      status: "active",
    });

    if (!link) {
      return NextResponse.json({
        success: true,
        student: null,
        moodTrend: [],
      });
    }

    const student = await db.collection("users").findOne({
      _id: new ObjectId(link.student_id),
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    let school = null;

    if (student.school_id) {
      school = await db.collection("schools").findOne({
        _id: new ObjectId(student.school_id),
      });
    }

    const talentData = await db
      .collection("student_talents")
      .findOne({
        student_id: new ObjectId(student._id),
      });

    let dominantTalent = "-";
    let talentScore = 0;

    if (talentData && Array.isArray(talentData.scores)) {
      const top = talentData.scores.reduce((prev, curr) =>
        curr.value > prev.value ? curr : prev
      );

      dominantTalent = top.subject;
      talentScore = top.value;
    }

    const filter = {
      student_id: student._id,
    };

    if (startDate || endDate) {
      filter.createdAt = {};

      // START DATE
      if (startDate) {
        const start = new Date(startDate);

        if (!isNaN(start.getTime())) {
          start.setHours(0, 0, 0, 0);

          filter.createdAt.$gte = start;
        }
      }

      // END DATE
      if (endDate) {
        const end = new Date(endDate);

        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);

          filter.createdAt.$lte = end;
        }
      }

      // HAPUS JIKA KOSONG
      if (Object.keys(filter.createdAt).length === 0) {
        delete filter.createdAt;
      }
    }

    const moodLogs = await db
      .collection("mood_logs")
      .find(filter)
      .sort({ createdAt: 1 })
      .toArray();

    const moodMap = {
      "😢": 20,
      "😕": 40,
      "😐": 60,
      "🙂": 80,
      "🤩": 100,
    };

    const moodTrend = moodLogs.map((item) => ({
      day: new Date(item.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      }),

      mood: item.mood,
      label: item.label,
      value: Number(moodMap[item.mood] || 50),
      createdAt: item.createdAt,
    }));

    const values = moodTrend.map((m) => Number(m.value || 0));

    let totalDiff = 0;

    for (let i = 1; i < values.length; i++) {
      totalDiff += Math.abs(values[i] - values[i - 1]);
    }

    const avgDiff =
      values.length > 1
        ? totalDiff / (values.length - 1)
        : 0;

    const emotionalStability = Math.max(
      0,
      Math.round(100 - avgDiff)
    );


    let emotionalTrend = "Stabil";

    if (emotionalStability >= 85) {
      emotionalTrend = "Sangat Stabil";
    } else if (emotionalStability >= 70) {
      emotionalTrend = "Meningkat";
    } else if (emotionalStability >= 50) {
      emotionalTrend = "Cukup Stabil";
    } else {
      emotionalTrend = "Tidak Stabil";
    }

    const uniqueDays = new Set(
      moodLogs.map((item) =>
        new Date(item.createdAt).toDateString()
      )
    );

    const totalDays = 7;

    const consistencyScore = Math.min(
      100,
      Math.round((uniqueDays.size / totalDays) * 100)
    );

    let consistencyTrend = "Kurang Aktif";

    if (consistencyScore >= 85) {
      consistencyTrend = "Sangat Konsisten";
    } else if (consistencyScore >= 60) {
      consistencyTrend = "Konsisten";
    } else if (consistencyScore >= 40) {
      consistencyTrend = "Cukup";
    }

    
    return NextResponse.json({
      success: true,

      student: {
        id: student._id,
        fullname: student.fullname || "Student",
        class_name: student.class_name || "0",
        school_name: school?.name || "Sekolah",
        avatar: student.avatar || null,
      },

      stats: {
        emotional_stability: {
          value: emotionalStability,
          trend: emotionalTrend,
        },

        checkin_consistency: {
          value: consistencyScore,
          trend: consistencyTrend,
        },

        dominant_talent: {
          value: dominantTalent,
          trend: `${talentScore}% Potensi`,
        },
      },

      moodTrend,
    });

  } catch (error) {
    console.error("PARENT DASHBOARD API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}