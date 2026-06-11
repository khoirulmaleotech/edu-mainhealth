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
      return NextResponse.json({ success: true, totalStudents: 0 });
    }

    const schoolId = teacher.school_id;

    const totalStudents = await db
      .collection("users")
      .countDocuments({
        role: "student",
        $or: [{ school_id: schoolId }, { school_id: schoolId.toString() }]
      });

    return NextResponse.json({
      success: true,
      totalStudents,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
