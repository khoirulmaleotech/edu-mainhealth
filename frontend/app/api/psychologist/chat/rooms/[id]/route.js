import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongodb";

function buildPsychologistRoomMatch(psychologistId) {
  const match = {
    $or: [
      { psychologist_id: psychologistId },
      { participants: { $in: [psychologistId] } },
    ],
  };

  if (ObjectId.isValid(psychologistId)) {
    match.$or.push({ psychologist_id: new ObjectId(psychologistId) });
    match.$or.push({ participants: { $in: [new ObjectId(psychologistId)] } });
  }

  return match;
}

export async function GET(_request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "psychologist") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: "Room ID tidak valid" },
        { status: 400 },
      );
    }

    const db = (await connectDB()).db();
    const [room] = await db
      .collection("chat_rooms")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(params.id),
            ...buildPsychologistRoomMatch(session.user.id),
          },
        },
        {
          $addFields: {
            patientObjectId: {
              $convert: {
                input: "$patient_id",
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
            localField: "patientObjectId",
            foreignField: "_id",
            as: "patient",
          },
        },
        { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id: "$_id",
            roomId: "$_id",
            studentId: "$patientObjectId",
            name: { $ifNull: ["$patient.fullname", "Pasien Anonim"] },
            email: { $ifNull: ["$patient.email", "-"] },
            lastMsg: { $ifNull: ["$lastMsg", "Belum ada pesan"] },
            time: { $ifNull: ["$updatedAt", "$createdAt"] },
            risk: { $ifNull: ["$risk", "Medium"] },
            unread: { $ifNull: ["$unread", 0] },
          },
        },
      ])
      .toArray();

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: room });
  } catch (error) {
    console.error("PSYCHOLOGIST_ROOM_DETAIL_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat detail chat" },
      { status: 500 },
    );
  }
}
