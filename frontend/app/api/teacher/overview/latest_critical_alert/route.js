import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireRole([
      "teacher",
    ]);

    const client = await connectDB();

    const db = client.db();

    const teacherId = new ObjectId(session.user.id);
    const teacher = await db.collection("users").findOne({ _id: teacherId }, { projection: { school_id: 1 } });

    if (!teacher || !teacher.school_id) {
      return NextResponse.json({ success: true, data: null });
    }

    const schoolId = teacher.school_id;

    const latestCriticalAlert = await db
      .collection("critical_chat_logs")
      .aggregate([
        {
          $match: {
            is_critical: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "student_id",
            foreignField: "_id",
            as: "student",
          },
        },
        {
          $unwind: "$student",
        },
        {
          $match: {
            "student.role": "student",
            $or: [{ "student.school_id": schoolId }, { "student.school_id": schoolId.toString() }],
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },

        {
          $limit: 1,
        },

        {
          $project: {
            _id: 1,
            createdAt: 1,
            category: 1,
            message: 1,
            student_fullname:
              "$student.fullname",
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: latestCriticalAlert[0] || null,
    });
  } catch (error) {
    console.error(
      "LATEST_CRITICAL_ALERT_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
