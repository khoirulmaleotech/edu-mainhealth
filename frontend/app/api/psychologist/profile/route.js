import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { ObjectId } from 'mongodb';
// Impor fungsi connectDB terpusat yang dipertahankan di folder lib Bapak
import { connectDB } from "@/lib/mongodb"; 

// GET: Mengambil data profil psikolog
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 1. Validasi Autentikasi & Role Akses
    if (!session || session.user.role !== 'psychologist') {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    // 2. Gunakan koneksi pooling terpusat dari global cache
    const client = await connectDB();
    const db = client.db();

    // Validasi format ObjectId sebelum query ke database
    const userId = session.user.id;
    const queryId = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;

    // 3. Ambil data profil tanpa password dan ketersediaan waktu lama
    const user = await db.collection('users').findOne(
      { _id: queryId },
      { 
        projection: { 
          password: 0,
          availability: 0
        } 
      }
    );

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ Error at GET Psychologist Profile:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// PUT: Memperbarui data profil dan status online
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Validasi Autentikasi & Role Akses
    if (!session || session.user.role !== 'psychologist') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    // Destructuring parameter dari payload frontend
    const { fullname, work_at, sipp, is_online } = body;

    // 2. Gunakan koneksi pooling terpusat dari global cache
    const client = await connectDB();
    const db = client.db();

    const updateData = {
      updatedAt: new Date()
    };

    // Hanya masukkan field yang dikirim dan relevan untuk mencegah overwriting data kosong
    if (fullname !== undefined) updateData.fullname = fullname;
    if (work_at !== undefined) updateData.work_at = work_at;
    if (sipp !== undefined) updateData.sipp = sipp;
    if (is_online !== undefined) updateData.is_online = is_online;

    // Validasi format ObjectId sebelum melakukan update data
    const userId = session.user.id;
    const queryId = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;

    // 3. Eksekusi pembaruan dokumen user psikolog
    const result = await db.collection('users').updateOne(
      { _id: queryId },
      { 
        $set: updateData,
        $unset: { availability: "" } // Opsional: Menghapus field ketersediaan lama jika ada di DB
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profil diperbarui" });
  } catch (error) {
    console.error("❌ Error at PUT Psychologist Profile:", error);
    return NextResponse.json({ message: "Update failed", error: error.message }, { status: 500 });
  }
}