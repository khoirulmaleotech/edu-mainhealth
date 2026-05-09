import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Validasi sesi yang sangat ketat
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Sesi tidak ditemukan" }, { status: 401 });
    }

    const { roomId, text, psychologistId } = await request.json();

    if (!roomId || !text || !psychologistId) {
      return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 });
    }

    await client.connect();
    const db = client.db();

    // Pastikan ID pengirim diambil dengan aman
    // Jika di Psikolog pakai session.user.id, di sini juga harus sama
    const senderId = session.user.id ? String(session.user.id) : null;

    if (!senderId) {
      return NextResponse.json({ success: false, message: "User ID siswa tidak valid" }, { status: 401 });
    }

    const newMessage = {
      room_id: new ObjectId(roomId),
      sender_id: senderId, // Disimpan sebagai string ID siswa
      receiver_id: String(psychologistId),
      text: text,
      timestamp: new Date(),
      createdAt: new Date(),
      status: "sent"
    };

    // Simpan ke MongoDB
    const result = await db.collection('messages').insertOne(newMessage);

    // Update info di chat_rooms
    await db.collection('chat_rooms').updateOne(
      { _id: new ObjectId(roomId) },
      { 
        $set: { 
          lastMsg: text, 
          updatedAt: new Date() 
        },
        $inc: { unread: 1 }
      }
    );

    return NextResponse.json({ success: true, data: result.insertedId });

  } catch (error) {
    console.error("ERROR_POST_STUDENT:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}