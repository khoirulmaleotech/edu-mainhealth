import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// Impor fungsi connectDB terpusat yang dipertahankan di folder lib Bapak
import { connectDB } from "@/lib/mongodb"; 

// Konfigurasi DigitalOcean Spaces Singleton di luar handler
const s3Client = new S3Client({
  endpoint: "https://sgp1.digitaloceanspaces.com", // Endpoint wilayah Singapura
  forcePathStyle: false,
  region: "us-east-1", // Diperlukan sebagai konfigurasi internal SDK AWS untuk Spaces
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET
  }
});

// GET: Mengambil data detail profil user/siswa
export async function GET() {
  try {
    // 1. Validasi Autentikasi Session User
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Sesi tidak valid atau kedaluwarsa" }, { status: 401 });
    }

    // 2. Gunakan koneksi pooling terpusat dari global cache (Hemat port Atlas)
    const client = await connectDB();
    const db = client.db();

    const userIdStr = session.user.id;
    // Validasi format ObjectId sebelum query dilakukan
    const queryId = ObjectId.isValid(userIdStr) ? new ObjectId(userIdStr) : userIdStr;

    // 3. Ambil data dokumen tanpa menyertakan password demi keamanan data
    const user = await db.collection('users').findOne(
      { _id: queryId },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("❌ PROFILE_GET_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH: Memperbarui data informasi umum dan foto avatar user/siswa
export async function PATCH(request) {
  try {
    // 1. Validasi Autentikasi Session User
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parsing Payload berbasis Form Data (Mendukung file binary avatar)
    const data = await request.formData();
    const fullname = data.get('fullname');
    const phone = data.get('phone');
    const email = data.get('email');
    const file = data.get('file'); // Berupa objek File/Blob dari input frontend

    const updateData = { 
      updated_at: new Date() 
    };

    // Hanya petakan field yang dikirim dari form agar tidak menimpa data yang sudah ada dengan null
    if (fullname !== null && fullname !== undefined) updateData.fullname = fullname;
    if (phone !== null && phone !== undefined) updateData.phone = phone;
    if (email !== null && email !== undefined) updateData.email = email;

    // 3. Logika Upload ke DigitalOcean Spaces jika ada berkas file foto baru
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Nama file unik (menggunakan ID user dan timestamp) untuk menghindari tumpang tindih berkas cache
      const fileName = `avatars/${session.user.id}-${Date.now()}.png`;
      const bucketName = process.env.DO_SPACES_BUCKET;

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ACL: "public-read", // Membuka akses publik agar dapat dibaca via tautan URL di img src frontend
        ContentType: file.type,
      }));

      // Simpan tautan URL absolut gambar ke field 'image' di database MongoDB
      updateData.image = `https://${bucketName}.sgp1.digitaloceanspaces.com/${fileName}`;
    }

    // 4. Gunakan koneksi pooling terpusat dari global cache (Aman dari Connection Full)
    const client = await connectDB();
    const db = client.db();

    const userIdStr = session.user.id;
    // Validasi format ObjectId sebelum mengeksekusi update
    const queryId = ObjectId.isValid(userIdStr) ? new ObjectId(userIdStr) : userIdStr;

    // 5. Eksekusi pembaruan data ke koleksi users
    const result = await db.collection('users').updateOne(
      { _id: queryId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("❌ PROFILE_PATCH_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}