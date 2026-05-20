import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongodb";

function buildTeacherRoomMatch(teacherId) {
  const match = {
    type: "teacher",
    $or: [
      { teacher_id: teacherId },
      { participants: { $in: [teacherId] } },
    ],
  };

  if (ObjectId.isValid(teacherId)) {
    match.$or.push({ teacher_id: new ObjectId(teacherId) });
    match.$or.push({ participants: { $in: [new ObjectId(teacherId)] } });
  }

  return match;
}

export async function GET(_request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 }
      );
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: "Room ID tidak valid" },
        { status: 400 }
      );
    }

    const db = (await connectDB()).db();

    const [room] = await db
      .collection("chat_rooms")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(params.id),
            ...buildTeacherRoomMatch(session.user.id),
          },
        },
        {
          $addFields: {
            studentObjectId: {
              $convert: {
                input: "$student_id",
                to: "objectId",
                onError: null,
                onNull: null,
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "studentObjectId",
            foreignField: "_id",
            as: "student",
          },
        },
        { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id: "$_id",
            roomId: "$_id",
            studentId: "$studentObjectId",
            name: { $ifNull: ["$student.fullname", "Siswa Anonim"] },
            email: { $ifNull: ["$student.email", "-"] },
            lastMsg: { $ifNull: ["$lastMsg", "Belum ada pesan"] },
            time: { $ifNull: ["$updatedAt", "$createdAt"] },
            unread: { $ifNull: ["$unread", 0] },
          },
        },
      ])
      .toArray();

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: room });
  } catch (error) {
    console.error("TEACHER_ROOM_DETAIL_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat detail chat" },
      { status: 500 }
    );
  }
}