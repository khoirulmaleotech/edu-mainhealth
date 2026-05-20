import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 }
      );
    }

    const db = (await connectDB()).db();

    const [summary = { unread: 0 }] = await db
      .collection("chat_rooms")
      .aggregate([
        { $match: buildTeacherRoomMatch(session.user.id) },
        {
          $group: {
            _id: null,
            unread: { $sum: { $ifNull: ["$unread", 0] } },
          },
        },
        { $project: { _id: 0, unread: 1 } },
      ])
      .toArray();

    return NextResponse.json({ success: true, unread: summary.unread || 0 });
  } catch (error) {
    console.error("TEACHER_UNREAD_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat indikator chat" },
      { status: 500 }
    );
  }
}