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

    const teacherId = new ObjectId(
      session.user.id
    );

    const result = await db
      .collection("users")
      .aggregate([
        {
          $match: {
            role: "student",
            homeroom_teacher_id: teacherId,
          },
        },
        {
          $lookup: {
            from: "critical_chat_logs",
            localField: "_id",
            foreignField: "student_id",
            as: "critical_logs",
          },
        },
        {
          $unwind: "$critical_logs",
        },
        {
          $match: {
            "critical_logs.is_critical": true,
          },
        },
        {
          $count: "totalCritical",
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      totalCritical:
        result[0]?.totalCritical || 0,
    });
  } catch (error) {
    console.error(
      "TOTAL_CRITICAL_ERROR:",
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
