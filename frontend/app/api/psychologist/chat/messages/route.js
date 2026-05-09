import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId || roomId === 'undefined') {
      return NextResponse.json({ success: false, message: "Room ID missing" }, { status: 400 });
    }

    await client.connect();
    const db = client.db();
    
    const messages = await db.collection('messages')
      .find({ room_id: new ObjectId(roomId) })
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { roomId, text } = await request.json();
    
    await client.connect();
    const db = client.db();

    const room = await db.collection('chat_rooms').findOne({ _id: new ObjectId(roomId) });
    if (!room) {
      return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });
    }

    // --- PERBAIKAN DI SINI ---
    // Gunakan field patient_id secara eksplisit karena participants mungkin mengandung null
    const studentId = room.patient_id instanceof ObjectId ? room.patient_id.toString() : room.patient_id;

    const senderId = session.user.id ? String(session.user.id) : null;

    if (!senderId) {
      return NextResponse.json({ success: false, message: "User ID siswa tidak valid" }, { status: 401 });
    }
    
    const newMessage = {
      room_id: new ObjectId(roomId),
      sender_id: senderId, // Pastikan ini string ID psikolog
      receiver_id: studentId,
      text: text,
      timestamp: new Date(),
      createdAt: new Date(),
      status: "sent"
    };

    await db.collection('messages').insertOne(newMessage);

    await db.collection('chat_rooms').updateOne(
      { _id: new ObjectId(roomId) },
      { 
        $set: { 
          lastMsg: text, 
          updatedAt: new Date() 
        } 
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST_MESSAGES_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}