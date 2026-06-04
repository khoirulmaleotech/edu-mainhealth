import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";
import crypto from "crypto";

const uri = process.env.MONGODB_URI;

// Menggunakan transporter SMTP Gmail Resmi Google yang sudah diperbaiki
const mailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME || "edumind.educourse@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "gvxzcntlifpsxxqd",
  },
});

export async function POST(request) {
  const client = new MongoClient(uri);
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email wajib diisi." }, { status: 400 });
    }

    await client.connect();
    const db = client.db();

    // 1. Periksa apakah pengguna dengan email tersebut terdaftar di sistem
    const user = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
    
    // Untuk alasan keamanan (Security Best Practice), kita tetap mengembalikan status sukses 
    // agar kompetitor/hacker tidak bisa melacak email mana saja yang terdaftar di database Anda.
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar, tautan pemulihan akan segera dikirimkan."
      });
    }

    // 2. Generate secure token menggunakan kriptografi bawaan Node.js
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 3600000); // Berlaku selama 1 jam dari sekarang

    // 3. Simpan token ke dalam koleksi 'password_resets' (Gunakan upsert agar data email tidak tumpuk)
    await db.collection("password_resets").updateOne(
      { email: user.email },
      { 
        $set: { 
          email: user.email,
          token: resetToken,
          expiresAt: tokenExpiry,
          createdAt: new Date()
        } 
      },
      { upsert: true }
    );

    // 4. Bangun Tautan Reset Sandi Lengkap
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    // 5. Kirim Email Instruksi Penyetelan Ulang
    await mailTransporter.sendMail({
      from: `"EduMind Security" <${process.env.EMAIL_USERNAME || "edumind.educourse@gmail.com"}>`,
      to: user.email,
      subject: "🔒 Atur Ulang Kata Sandi Akun EduMind Anda",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background-f3f4f6;font-family:Arial,sans-serif;color:#334155;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center" style="padding:24px;">
                  <table width="550" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
                    <tr>
                      <td style="background:#00adb5;padding:30px;color:#ffffff;text-align:center;">
                        <h1 style="margin:0;font-size:24px;">Pemulihan Kata Sandi</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:30px;line-height:1.6;font-size:14px;">
                        <p>Hai <strong>${user.name || "Siswa"}</strong>,</p>
                        <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun EduMind Anda. Silakan klik tombol di bawah ini untuk melanjutkan:</p>
                        <div style="text-align:center;margin:30px 0;">
                          <a href="${resetLink}" style="display:inline-block;padding:14px 30px;background:#0b0e14;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:12px;font-size:14px;">Atur Ulang Sandi Baru</a>
                        </div>
                        <p style="color:#64748b;font-size:12px;">Tautan ini bersifat rahasia, hanya dapat digunakan 1 kali, dan akan kedaluwarsa secara otomatis dalam waktu 1 jam.</p>
                        <p style="margin:20px 0 0;color:#94a3b8;font-size:11px;">Jika Anda tidak merasa meminta tindakan ini, abaikan email ini dengan aman. Kata sandi Anda tidak akan berubah.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f8fafc;padding:20px;text-align:center;color:#94a3b8;font-size:11px;border-t:1px solid #e2e8f0;">
                        © 2026 PT. Maleo Teknologi Indonesia. Seluruh Hak Cipta Dilindungi.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `
    });

    return NextResponse.json({
      success: true,
      message: "Jika email terdaftar, tautan pemulihan akan segera dikirimkan."
    }, { status: 200 });

  } catch (error) {
    console.error("❌ ERROR_FORGOT_PASSWORD_API:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server internal." }, { status: 500 });
  } finally {
    await client.close();
  }
}