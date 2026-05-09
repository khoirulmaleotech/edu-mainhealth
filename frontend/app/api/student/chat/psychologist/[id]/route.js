import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request, { params }) {
  const psychologistId = params.id;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, message: "Login diperlukan" }, { status: 401 });
  }

  const studentId = session.user.id; // Ambil ID siswa dari session

  try {
    await client.connect();
    const db = client.db();
    
    // 1. Cari atau buat Room yang berisi Siswa & Psikolog ini
    let room = await db.collection('chat_rooms').findOne({
      participants: { $all: [studentId, psychologistId] }
    });

    // Jika belum ada room (chat pertama kali), buat secara otomatis
    if (!room) {
      const newRoom = {
        participants: [studentId, psychologistId],
        patient_id: new ObjectId(studentId),
        psychologist_id: new ObjectId(psychologistId),
        lastMsg: "Memulai percakapan baru...",
        risk: "Medium",
        unread: 0,
        updatedAt: new Date(),
        createdAt: new Date()
      };
      const result = await db.collection('chat_rooms').insertOne(newRoom);
      room = { _id: result.insertedId, ...newRoom };
    }

    // 2. Ambil data pesan berdasarkan room_id tersebut
    const messages = await db.collection('messages')
      .find({ room_id: room._id })
      .sort({ timestamp: 1 })
      .toArray();

    // 3. Ambil profil Psikolog untuk header
    const psychologist = await db.collection('users').findOne(
      { _id: new ObjectId(psychologistId) },
      { projection: { fullname: 1, isOnline: 1 } }
    );

    return NextResponse.json({ 
      success: true, 
      data: { 
        messages, 
        psychologist,
        roomId: room._id 
      } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}