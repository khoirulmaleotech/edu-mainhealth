import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { connectDB } from "@/lib/mongodb";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Sesi tidak ditemukan" }, { status: 401 });
    }

    const { roomId, text, psychologistId, teacherId } = await request.json();

    // ✅ receiverId bisa dari psychologistId (chat psikolog) atau teacherId (chat guru)
    const receiverId = psychologistId || teacherId || null;

    if (!roomId || !text || !receiverId) {
      return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 });
    }

    const client = await connectDB();
    const db = client.db();

    const senderId = session.user.id ? String(session.user.id) : null;
    if (!senderId) {
      return NextResponse.json({ success: false, message: "User ID siswa tidak valid" }, { status: 401 });
    }

    const queryRoomId = ObjectId.isValid(roomId) ? new ObjectId(roomId) : roomId;

    const newMessage = {
      room_id: queryRoomId,
      sender_id: senderId,
      receiver_id: String(receiverId),
      text: text,
      timestamp: new Date(),
      createdAt: new Date(),
      status: "sent"
    };

    const result = await db.collection('messages').insertOne(newMessage);

    await db.collection('chat_rooms').updateOne(
      { _id: queryRoomId },
      { 
        $set: { lastMsg: text, updatedAt: new Date() },
        $inc: { unread: 1 }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Pesan berhasil terkirim.",
      data: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error("❌ ERROR_POST_STUDENT_MESSAGE:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Gagal mengirimkan pesan" 
    }, { status: 500 });
  }
}