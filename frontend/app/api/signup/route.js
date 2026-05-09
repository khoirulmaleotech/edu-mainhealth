import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

/**
 * ENDPOINT: POST /api/signup
 * DESKRIPSI: Registrasi User Umum (Siswa, Ortu, Guru, Psikolog)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      fullname, 
      email, 
      password, 
      role, 
      institution_id,   // Untuk Siswa/Guru/Ortu (ID dari DB)
      institution_name, // Untuk Psikolog (Teks Manual)
      sipp_number      // Khusus Psikolog
    } = body;

    // 1. Validasi Dasar
    if (!fullname || !email || !password || !role) {
      return NextResponse.json({ message: "Data wajib diisi semua." }, { status: 400 });
    }

    // 2. Koneksi ke Database
    await client.connect();
    const db = client.db();
    
    // 3. Cek apakah email sudah terdaftar
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar di sistem." }, { status: 400 });
    }

    // 4. Hashing Password
    const hashedPassword = await hash(password, 12);

    // 5. Persiapan Objek User
    const newUser = {
      fullname,
      email: email.toLowerCase(),
      password: hashedPassword,
      role, // student, parent, teacher, psychologist
      is_verified: role === 'psychologist' ? false : true, // Psikolog butuh verifikasi manual admin Maleotech
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 6. Logika Relasi Institusi/Sekolah
    if (role === 'psychologist') {
      // Psikolog menggunakan nama lembaga manual
      newUser.work_at = institution_name;
      newUser.sipp = sipp_number;
    } else {
      // Siswa/Guru/Ortu menggunakan ID Sekolah yang valid
      if (!institution_id) {
        return NextResponse.json({ message: "Asal sekolah wajib dipilih." }, { status: 400 });
      }
      newUser.school_id = new ObjectId(institution_id);
    }

    // 7. Simpan ke Koleksi Users
    const result = await db.collection('users').insertOne(newUser);

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil.",
      userId: result.insertedId
    }, { status: 201 });

  } catch (error) {
    console.error("❌ SIGNUP_ERROR:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server.", error: error.message },
      { status: 500 }
    );
  }
}