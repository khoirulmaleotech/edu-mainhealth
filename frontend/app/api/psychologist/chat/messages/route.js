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

async function getAuthorizedRoom(db, roomId, psychologistId) {
  if (!ObjectId.isValid(roomId)) return null;

  return db.collection("chat_rooms").findOne({
    _id: new ObjectId(roomId),
    ...buildPsychologistRoomMatch(psychologistId),
  });
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "psychologist") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId || roomId === "undefined") {
      return NextResponse.json(
        { success: false, message: "Room ID diperlukan" },
        { status: 400 },
      );
    }

    const db = (await connectDB()).db();
    const room = await getAuthorizedRoom(db, roomId, session.user.id);

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room tidak ditemukan" },
        { status: 404 },
      );
    }

    const messages = await db
      .collection("messages")
      .find(
        { room_id: new ObjectId(roomId) },
        {
          projection: {
            _id: 1,
            sender_id: 1,
            receiver_id: 1,
            text: 1,
            timestamp: 1,
            createdAt: 1,
            status: 1,
          },
        },
      )
      .sort({ timestamp: 1, createdAt: 1 })
      .toArray();

    await db.collection("chat_rooms").updateOne(
      { _id: new ObjectId(roomId) },
      { $set: { unread: 0, updatedAt: room.updatedAt || room.createdAt || new Date() } },
    );

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("PSYCHOLOGIST_MESSAGES_GET_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat pesan" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "psychologist") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const { roomId, text } = await request.json();
    const trimmedText = (text || "").trim();

    if (!roomId || !trimmedText) {
      return NextResponse.json(
        { success: false, message: "Room ID dan pesan diperlukan" },
        { status: 400 },
      );
    }

    const db = (await connectDB()).db();
    const room = await getAuthorizedRoom(db, roomId, session.user.id);

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room tidak ditemukan" },
        { status: 404 },
      );
    }

    const studentId = room.patient_id instanceof ObjectId
      ? room.patient_id.toString()
      : String(room.patient_id || "");

    const newMessage = {
      room_id: new ObjectId(roomId),
      sender_id: String(session.user.id),
      receiver_id: studentId,
      text: trimmedText,
      timestamp: new Date(),
      createdAt: new Date(),
      status: "sent",
    };

    const result = await db.collection("messages").insertOne(newMessage);

    await db.collection("chat_rooms").updateOne(
      { _id: new ObjectId(roomId) },
      {
        $set: {
          lastMsg: trimmedText,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...newMessage },
    });
  } catch (error) {
    console.error("PSYCHOLOGIST_MESSAGES_POST_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengirim pesan" },
      { status: 500 },
    );
  }
}
