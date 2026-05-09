import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// GET: Mengambil daftar sekolah (Dukungan untuk Dropdown User & Antrean Admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isVerifiedQuery = searchParams.get('verified');

    await client.connect();
    const db = client.db();
    
    // Filter berdasarkan status verifikasi
    let matchQuery = { is_verified: true };
    if (isVerifiedQuery === 'false') {
      matchQuery = { is_verified: false };
    }

    /**
     * MENGGUNAKAN AGGREGATION UNTUK MENGAMBIL EMAIL DARI KOLEKSI USERS
     */
    const schools = await db.collection('schools').aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",           // Koleksi tujuan
          localField: "admin_id",  // Field di koleksi schools
          foreignField: "_id",     // Field di koleksi users
          as: "admin_data"         // Nama array penampung hasil join
        }
      },
      {
        $unwind: {
          path: "$admin_data",
          preserveNullAndEmptyArrays: true // Tetap tampilkan sekolah meski user adminnya tidak ketemu
        }
      },
      {
        $project: {
          name: 1,
          address: 1,
          phone: 1,
          createdAt: 1,
          is_verified: 1,
          // Mengambil email dan fullname dari data join tadi
          admin_email: "$admin_data.email", 
          admin_name: "$admin_data.fullname"
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    return NextResponse.json({ success: true, data: schools });
  } catch (error) {
    console.error("ERR_FETCH_SCHOOLS:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil daftar sekolah" }, { status: 500 });
  }
}

// POST: Registrasi mandiri sekolah baru
export async function POST(request) {
  let dbSession = null;
  try {
    const body = await request.json();
    const { schoolName, schoolAddress, schoolPhone, schoolWebsite, adminName, adminEmail, adminPassword } = body;

    if (!schoolName || !adminEmail || !adminPassword) {
      return NextResponse.json({ message: "Data tidak lengkap." }, { status: 400 });
    }

    await client.connect();
    const db = client.db();
    
    const existingUser = await db.collection('users').findOne({ email: adminEmail });
    if (existingUser) return NextResponse.json({ message: "Email sudah terdaftar." }, { status: 400 });

    const affiliationCode = `EM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const hashedPassword = await hash(adminPassword, 12);

    dbSession = client.startSession();
    let resultData = null;

    await dbSession.withTransaction(async () => {
      // 1. Insert User sebagai Admin Sekolah
      const userInsert = await db.collection('users').insertOne({
        fullname: adminName, 
        email: adminEmail, 
        password: hashedPassword, 
        role: 'school_admin', 
        is_verified: false, // Admin sekolah juga nunggu verifikasi sekolahnya
        createdAt: new Date()
      }, { session: dbSession });

      // 2. Insert Data Sekolah
      const schoolInsert = await db.collection('schools').insertOne({
        name: schoolName, 
        address: schoolAddress, 
        phone: schoolPhone, 
        website: schoolWebsite || "",
        admin_email: adminEmail, // Kita simpan email admin di sini agar mudah di-fetch Superadmin
        affiliation_code: affiliationCode, 
        admin_id: userInsert.insertedId, 
        is_verified: false,
        bucket_name: process.env.DO_SPACES_BUCKET, 
        createdAt: new Date()
      }, { session: dbSession });

      resultData = { school_id: schoolInsert.insertedId, affiliation_code: affiliationCode };
    });

    return NextResponse.json({ success: true, data: resultData }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal pendaftaran.", error: error.message }, { status: 500 });
  } finally {
    if (dbSession) await dbSession.endSession();
  }
}