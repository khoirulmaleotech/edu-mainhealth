import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
// Impor fungsi connectDB terpusat yang dipertahankan di folder lib Bapak
import { connectDB } from "@/lib/mongodb";

export async function POST(request) {
  try {
    // 1. Sesi validasi yang sangat ketat
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Sesi tidak ditemukan" }, { status: 401 });
    }

    // 2. Destructuring payload data dari frontend
    const { roomId, text, psychologistId } = await request.json();

    if (!roomId || !text || !psychologistId) {
      return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 });
    }

    // 3. Gunakan koneksi pooling terpusat dari global cache (Aman dari Connection Full)
    const client = await connectDB();
    const db = client.db();

    // Pastikan ID pengirim diambil dengan aman dari session
    const senderId = session.user.id ? String(session.user.id) : null;

    if (!senderId) {
      return NextResponse.json({ success: false, message: "User ID siswa tidak valid" }, { status: 401 });
    }

    // Validasi format roomId sebelum diubah menjadi ObjectId untuk mencegah crash internal BSON
    const queryRoomId = ObjectId.isValid(roomId) ? new ObjectId(roomId) : roomId;

    // 4. Strukturisasi skema payload data pesan baru
    const newMessage = {
      room_id: queryRoomId,
      sender_id: senderId, // Disimpan sebagai string ID siswa demi keselarasan data
      receiver_id: String(psychologistId),
      text: text,
      timestamp: new Date(),
      createdAt: new Date(),
      status: "sent"
    };

    // 5. Simpan pesan baru ke collection 'messages'
    const result = await db.collection('messages').insertOne(newMessage);

    // 6. Perbarui ringkasan (metadata) pada collection 'chat_rooms'
    await db.collection('chat_rooms').updateOne(
      { _id: queryRoomId },
      { 
        $set: { 
          lastMsg: text, 
          updatedAt: new Date() 
        },
        $inc: { unread: 1 } // Menambahkan counter pesan yang belum dibaca oleh psikolog
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