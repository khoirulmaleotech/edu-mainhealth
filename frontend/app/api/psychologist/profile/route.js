import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// GET: Mengambil data profil psikolog
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'psychologist') {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    await client.connect();
    const db = client.db();

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.user.id) },
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
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// PUT: Memperbarui data profil dan status online
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'psychologist') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    // Destructuring tanpa availability
    const { fullname, work_at, sipp, is_online } = body;

    await client.connect();
    const db = client.db();

    const updateData = {
      updatedAt: new Date()
    };

    // Hanya masukkan field yang dikirim dan relevan
    if (fullname !== undefined) updateData.fullname = fullname;
    if (work_at !== undefined) updateData.work_at = work_at;
    if (sipp !== undefined) updateData.sipp = sipp;
    if (is_online !== undefined) updateData.is_online = is_online;

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        $set: updateData,
        $unset: { availability: "" } // Opsional: Menghapus field availability dari dokumen di DB
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profil diperbarui" });
  } catch (error) {
    return NextResponse.json({ message: "Update failed", error: error.message }, { status: 500 });
  }
}