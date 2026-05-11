import { NextResponse } from "next/server";
import OpenAI from "openai";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const SYSTEM_PROMPT = `Anda adalah Al Mood Buddy, asisten pendukung kesehatan mental siswa.
Gunakan bahasa yang sangat empati, hangat, dan tidak menghakimi. dukung bahasa lain juga.

=== BATASAN TOPIK (WAJIB DIPATUHI) ===
Anda HANYA boleh merespons pesan yang berkaitan dengan:
- Kesehatan mental (stres, kecemasan, depresi, kesepian, dll.)
- Curhat, perasaan, atau emosi pribadi
- Pengalaman hidup, trauma, atau kejadian yang memengaruhi psikologis
- Hubungan sosial (pertemanan, keluarga, percintaan, bullying)
- Kepribadian, motivasi, kepercayaan diri, identitas diri
- Masalah akademik yang berdampak pada kondisi mental/emosional siswa

Jika pesan pengguna TIDAK berkaitan dengan topik di atas (contoh: soal matematika,
coding, resep masakan, berita, pertanyaan umum yang tidak ada hubungannya dengan
psikologi/perasaan/pengalaman pribadi), Anda WAJIB:
1. Tidak menjawab pertanyaan tersebut.
2. Sampaikan dengan hangat bahwa Anda hanya bisa membantu seputar kesehatan mental
   dan kesejahteraan emosional siswa, lalu ajak mereka untuk berbagi perasaan atau
   hal yang sedang mereka alami.

=== DETEKSI KASUS KRITIS ===
Evaluasi apakah pesan pengguna mengandung:
- Depresi berat atau keputusasaan total.
- Trauma mendalam atau kekerasan (fisik/seksual/bullying parah).
- Tanda-tanda bahaya diri (self-harm atau niatan mengakhiri hidup).

Jika YA, Anda WAJIB menyisipkan kode [CRITICAL_CASE] di akhir jawaban Anda.

Catatan: kode [CRITICAL_CASE]) tidak akan ditampilkan
ke pengguna dan hanya digunakan sistem secara internal.`;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const userMessage = formData.get("message");
    const audioFile = formData.get("file");

    let finalInput = userMessage;

    // 1. Jika ada file audio, ubah jadi teks (Whisper)
    if (audioFile && audioFile.size > 0) {
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const transcription = await openai.audio.transcriptions.create({
        file: await OpenAI.toFile(buffer, "recording.ogg"),
        model: "whisper-1",
        language: "id",
      });
      finalInput = transcription.text;
    }

    if (!finalInput) {
      return NextResponse.json(
        { success: false, message: "Pesan kosong" },
        { status: 400 },
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: finalInput },
      ],
      temperature: 0.6,
    });

    const aiReply = response.choices[0].message.content;

    // 2. Deteksi flag dari model
    const isCritical = aiReply.includes("[CRITICAL_CASE]");

    // 3. Bersihkan semua flag sebelum dikirim ke user
    const cleanReply = aiReply.replace("[CRITICAL_CASE]", "").trim();

    // 4. Simpan log jika kasus kritis
    if (isCritical) {
      await client.connect();
      const db = client.db();

      await db.collection("critical_chat_logs").insertOne({
        student_id: new ObjectId(session.user.id),
        is_critical: true,
        createdAt: new Date(),
        source: "student_chat",
        status: "pending_review",
      });
    }

    return NextResponse.json({
      reply: cleanReply,
      isCritical,
    });
  } catch (error) {
    console.error("CHAT_API_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses pesan" },
      { status: 500 },
    );
  }
}
