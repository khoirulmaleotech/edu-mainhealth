import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs"; // Pastikan seirama dengan skema signup/login Anda

const uri = process.env.MONGODB_URI;

export async function POST(request) {
  const client = new MongoClient(uri);
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, message: "Data token dan password baru wajib dilampirkan." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Kata sandi minimal berisi 6 karakter." }, { status: 400 });
    }

    await client.connect();
    const db = client.db();

    // 1. Cari record data reset berdasarkan token token pengesahan
    const resetRecord = await db.collection("password_resets").findOne({ token: token });

    if (!resetRecord) {
      return NextResponse.json({ success: false, message: "Tautan tidak valid atau sudah pernah digunakan sebelumnya." }, { status: 400 });
    }

    // 2. Validasi batas waktu kedaluwarsa (Expiry Check)
    if (new Date() > new Date(resetRecord.expiresAt)) {
      // Hapus data token usang dari koleksi agar database tetap bersih harian
      await db.collection("password_resets").deleteOne({ token: token });
      return NextResponse.json({ success: false, message: "Tautan keamanan telah kedaluwarsa. Silakan ajukan kembali." }, { status: 400 });
    }

    // 3. Lakukan Hashing Pengaman pada Kata Sandi Baru Siswa
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Update password murni ke koleksi data users utama
    const updateResult = await db.collection("users").updateOne(
      { email: resetRecord.email },
      { 
        $set: { 
          password: hashedPassword, 
          updatedAt: new Date() 
        } 
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Akun pengguna tidak ditemukan di sistem database." }, { status: 404 });
    }

    // 5. KUNCI KEAMANAN: Hapus token dari database setelah berhasil agar tautan mati (Single Use Only)
    await db.collection("password_resets").deleteOne({ token: token });

    return NextResponse.json({
      success: true,
      message: "Kata sandi baru Anda berhasil diperbarui. Silakan login kembali."
    }, { status: 200 });

  } catch (error) {
    console.error("❌ ERROR_RESET_PASSWORD_CONFIRM_API:", error);
    return NextResponse.json({ success: false, message: "Gagal memproses penggantian kata sandi." }, { status: 500 });
  } finally {
    await client.close();
  }
}