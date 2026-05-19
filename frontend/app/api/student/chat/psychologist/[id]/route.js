import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/authOptions";
// Impor fungsi connectDB yang dipertahankan di folder lib Bapak
import { connectDB } from "@/lib/mongodb"; 

export async function GET(request, { params }) {
  // Pastikan parameter id dari URL terbaca dengan benar
  const { id: psychologistId } = params;
  const session = await getServerSession(authOptions);

  // 1. Validasi Autentikasi Session User
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Login diperlukan" }, 
      { status: 401 }
    );
  }

  const studentId = session.user.id; // Ambil ID siswa dari session

  try {
    // 2. Gunakan koneksi database terpusat yang hemat pool size
    const client = await connectDB();
    // Jika nama DB tidak dispesifikasikan di uri, Atlas otomatis menggunakan default dari env/string koneksi
    const db = client.db(); 
    
    // 3. Cari atau buat Room yang berisi Siswa & Psikolog ini
    let room = await db.collection('chat_rooms').findOne({
      participants: { $all: [studentId, psychologistId] }
    });

    // Jika belum ada room (chat pertama kali), buat secara otomatis
    if (!room) {
      const newRoom = {
        participants: [studentId, psychologistId],
        // Ambil penanganan ObjectId secara aman dari string ID session/params
        patient_id: ObjectId.isValid(studentId) ? new ObjectId(studentId) : studentId,
        psychologist_id: ObjectId.isValid(psychologistId) ? new ObjectId(psychologistId) : psychologistId,
        lastMsg: "Memulai percakapan baru...",
        risk: "Medium",
        unread: 0,
        updatedAt: new Date(),
        createdAt: new Date()
      };
      
      const result = await db.collection('chat_rooms').insertOne(newRoom);
      room = { _id: result.insertedId, ...newRoom };
    }

    // 4. Ambil data pesan berdasarkan room_id tersebut
    const messages = await db.collection('messages')
      .find({ room_id: room._id })
      .sort({ timestamp: 1 })
      .toArray();

    // 5. Ambil profil Psikolog untuk komponen header chat di frontend
    let psychologist = null;
    if (ObjectId.isValid(psychologistId)) {
      psychologist = await db.collection('users').findOne(
        { _id: new ObjectId(psychologistId) },
        { projection: { fullname: 1, isOnline: 1 } }
      );
    }

    // Jika id psikolog di database bukan bentuk ObjectId melainkan string biasa
    if (!psychologist) {
      psychologist = await db.collection('users').findOne(
        { _id: psychologistId },
        { projection: { fullname: 1, isOnline: 1 } }
      );
    }

    // 6. Kembalikan response payload sukses
    return NextResponse.json({ 
      success: true, 
      data: { 
        messages, 
        psychologist,
        roomId: room._id 
      } 
    });

  } catch (error) {
    console.error("❌ Error at Get Chat API:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses data chat" }, 
      { status: 500 }
    );
  }
}