import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireRole(["teacher"]);

    const client = await connectDB();

    const db = client.db();

    const teacherId = new ObjectId(session.user.id);
    const teacher = await db.collection("users").findOne({ _id: teacherId }, { projection: { school_id: 1 } });

    if (!teacher || !teacher.school_id) {
      return NextResponse.json({ success: true, data: [] });
    }

    const schoolId = teacher.school_id;

    const studentsMood = await db
      .collection("users")
      .aggregate([
        {
          $match: {
            role: "student",
            $or: [{ school_id: schoolId }, { school_id: schoolId.toString() }],
          },
        },
        {
          $lookup: {
            from: "mood_logs",
            let: {
              studentId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      "$student_id",
                      "$$studentId",
                    ],
                  },
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
            ],
            as: "latest_mood",
          },
        },
        {
          $unwind: {
            path: "$latest_mood",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            "latest_mood.mood": {
              $exists: true,
              $ne: null,
            },
            "latest_mood.label": {
              $exists: true,
              $ne: null,
            },
          },
        },
        {
          $project: {
            _id: 1,
            fullname: 1,
            mood: "$latest_mood.mood",
            label: "$latest_mood.label",
            createdAt:
              "$latest_mood.createdAt",
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: studentsMood,
    });
  } catch (error) {
    console.error(
      "TEACHER_STUDENT_MOOD_ERROR:",
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
