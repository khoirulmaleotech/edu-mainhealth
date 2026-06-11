import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export const dynamic = 'force-dynamic';

const uri = process.env.MONGODB_URI;

export async function GET(request) {
  const client = new MongoClient(uri);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    await client.connect();
    const db = client.db();

    const teacherId = session.user.id;
    const teacher = await db.collection("users").findOne({ _id: new ObjectId(teacherId) }, { projection: { school_id: 1 } });
    if (!teacher || !teacher.school_id) {
       return NextResponse.json({ success: true, students: [], logs: [] });
    }
    const schoolId = teacher.school_id;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    const students = await db
      .collection("users")
     //  .find({ role: "student"})
      .find({ role: "student", $or: [{ school_id: schoolId }, { school_id: schoolId.toString() }] })
      .project({ fullname: 1, class_name: 1 })
      .toArray();

    const studentIds = students.map((student) => new ObjectId(student._id));
    const query = { student_id: { $in: studentIds } };

    if (studentId) {
      if (!studentIds.some((id) => id.toString() === studentId)) {
        return NextResponse.json(
          { success: false, message: "Akses tidak diizinkan untuk siswa ini" },
          { status: 403 },
        );
      }
      query.student_id = new ObjectId(studentId);
    }

    const logs = await db
      .collection("mood_logs")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, students, logs });
  } catch (error) {
    console.error("TEACHER_MOOD_LOGS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}