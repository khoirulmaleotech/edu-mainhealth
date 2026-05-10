import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const formData = await request.formData();
    const userMessage = formData.get('message'); 
    const audioFile = formData.get('file'); 

    let finalInput = userMessage;

    // 1. Jika ada file audio, ubah jadi teks (Whisper)
    if (audioFile && audioFile.size > 0) {
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const transcription = await openai.audio.transcriptions.create({
        file: await OpenAI.toFile(buffer, 'recording.ogg'),
        model: "whisper-1",
        language: "id",
      });
      finalInput = transcription.text;
    }

    if (!finalInput) {
      return NextResponse.json({ success: false, message: "Pesan kosong" }, { status: 400 });
    }

    // 2. Kirim ke GPT-4o dengan System Prompt Kritis
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Anda adalah Al Mood Buddy, asisten pendukung kesehatan mental siswa. 
          Gunakan bahasa yang sangat empati, hangat, dan tidak menghakimi.
          
          INSTRUKSI KRITIS:
          Evaluasi apakah pesan pengguna mengandung:
          - Depresi berat atau keputusasaan total.
          - Trauma mendalam atau kekerasan (fisik/seksual/bullying parah).
          - Tanda-tanda bahaya diri (self-harm atau niatan mengakhiri hidup).
          
          Jika YA, Anda WAJIB menyisipkan kode [CRITICAL_CASE] di akhir jawaban Anda.` 
        },
        { role: "user", content: finalInput }
      ],
      temperature: 0.6,
    });

    const aiReply = response.choices[0].message.content;
    
    // Deteksi keberadaan tag
    const isCritical = aiReply.includes("[CRITICAL_CASE]");
    
    // Bersihkan tag agar tidak terlihat oleh siswa
    const cleanReply = aiReply.replace("[CRITICAL_CASE]", "").trim();

    return NextResponse.json({ 
      reply: cleanReply,
      isCritical: isCritical // Mengirim boolean true/false
    });

  } catch (error) {
    console.error("CHAT_API_ERROR:", error);
    return NextResponse.json({ success: false, message: "Gagal memproses pesan" }, { status: 500 });
  }
}