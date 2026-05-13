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

    // =====================================
    // FAMILY LINK
    // =====================================
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

    // =====================================
    // STUDENT
    // =====================================
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

    // =====================================
    // SCHOOL
    // =====================================
    let school = null;

    if (student.school_id) {
      school = await db.collection("schools").findOne({
        _id: new ObjectId(student.school_id),
      });
    }

    // =====================================
    // FILTER
    // =====================================
    const filter = {
      student_id: student._id,
    };

    // =====================================
    // DATE FILTER
    // =====================================
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


    // =====================================
    // MOOD LOGS
    // =====================================
    const moodLogs = await db
      .collection("mood_logs")
      .find(filter)
      .sort({ createdAt: 1 })
      .toArray();

    // =====================================
    // MOOD MAP
    // =====================================
    const moodMap = {
      "😢": 20,
      "😕": 40,
      "😐": 60,
      "🙂": 80,
      "🤩": 100,
    };

    // =====================================
    // FORMAT TREND
    // =====================================
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

    return NextResponse.json({
      success: true,

      student: {
        id: student._id,
        fullname: student.fullname || "Student",
        class_name: student.class_name || "12A",
        school_name: school?.name || "Sekolah",
        avatar: student.avatar || null,
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