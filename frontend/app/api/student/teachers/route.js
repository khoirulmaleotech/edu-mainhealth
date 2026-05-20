import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Login diperlukan" },
      { status: 401 }
    );
  }

  const studentId = session.user.id;

  try {
    const client = await connectDB();
    const db = client.db();

    // 1. Ambil school_id dari data siswa
    let student = null;
    if (ObjectId.isValid(studentId)) {
      student = await db.collection('users').findOne(
        { _id: new ObjectId(studentId) },
        { projection: { school_id: 1 } }
      );
    }
    if (!student) {
      student = await db.collection('users').findOne(
        { _id: studentId },
        { projection: { school_id: 1 } }
      );
    }

    if (!student?.school_id) {
      return NextResponse.json(
        { success: false, message: "Data sekolah siswa tidak ditemukan" },
        { status: 404 }
      );
    }

    const schoolId = student.school_id;

    // 2. Ambil semua guru yang satu sekolah dengan siswa
    const teachers = await db.collection('users')
      .find({
        role: "teacher",
        $or: [
          { school_id: schoolId },
          { school_id: schoolId.toString() },
          ...(ObjectId.isValid(schoolId)
            ? [{ school_id: new ObjectId(schoolId) }]
            : []),
        ],
      })
      .project({
        fullname: 1,
        subject: 1,
        work_at: 1,
        is_online: 1,
        is_verified: 1,
      })
      .sort({ fullname: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: teachers.map((t) => ({
        _id: t._id.toString(),
        fullname: t.fullname,
        subject: t.subject || null,
        work_at: t.work_at || null,
        is_online: t.is_online ?? false,
        is_verified: t.is_verified ?? false,
      })),
    });

  } catch (error) {
    console.error("❌ Error at GET /api/student/teachers:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data guru" },
      { status: 500 }
    );
  }
}