import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongodb";

export async function GET(request, { params }) {
  const { id: teacherId } = params;
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

    // 1. Ambil school_id siswa untuk validasi satu sekolah
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
        { status: 403 }
      );
    }

    const schoolId = student.school_id;

    // 2. Validasi guru — harus role "teacher" dan satu sekolah dengan siswa
    let teacher = null;
    const schoolFilter = {
      $or: [
        { school_id: schoolId },
        { school_id: schoolId.toString() },
      ],
    };

    if (ObjectId.isValid(teacherId)) {
      teacher = await db.collection('users').findOne(
        { _id: new ObjectId(teacherId), role: "teacher", ...schoolFilter },
        { projection: { fullname: 1, is_online: 1, subject: 1, work_at: 1 } }
      );
    }
    if (!teacher) {
      teacher = await db.collection('users').findOne(
        { _id: teacherId, role: "teacher", ...schoolFilter },
        { projection: { fullname: 1, is_online: 1, subject: 1, work_at: 1 } }
      );
    }

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Guru tidak ditemukan atau tidak satu sekolah" },
        { status: 404 }
      );
    }

    // 3. Cari atau buat chat room
    // Gunakan type:"teacher" agar terpisah dari room psikolog
    let room = await db.collection('chat_rooms').findOne({
      type: "teacher",
      participants: { $all: [studentId, teacherId] },
    });

    if (!room) {
      const newRoom = {
        type: "teacher",
        participants: [studentId, teacherId],
        student_id: ObjectId.isValid(studentId) ? new ObjectId(studentId) : studentId,
        teacher_id: ObjectId.isValid(teacherId) ? new ObjectId(teacherId) : teacherId,
        lastMsg: "Memulai percakapan baru...",
        unread: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      const result = await db.collection('chat_rooms').insertOne(newRoom);
      room = { _id: result.insertedId, ...newRoom };
    }

    // 4. Ambil semua pesan dalam room ini
    const messages = await db.collection('messages')
      .find({ room_id: room._id })
      .sort({ timestamp: 1 })
      .toArray();

    // 5. Kembalikan payload
    return NextResponse.json({
      success: true,
      data: {
        messages: messages.map((m) => ({
          ...m,
          _id: m._id.toString(),
          room_id: m.room_id.toString(),
        })),
        teacher: {
          _id: teacher._id.toString(),
          fullname: teacher.fullname,
          is_online: teacher.is_online ?? false,
          subject: teacher.subject || null,
          work_at: teacher.work_at || null,
        },
        roomId: room._id.toString(),
      },
    });

  } catch (error) {
    console.error("❌ Error at GET /api/student/chat/teacher/[id]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses data chat" },
      { status: 500 }
    );
  }
}