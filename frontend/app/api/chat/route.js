import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { message } = await request.json();

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
        { role: "user", content: message }
      ],
      temperature: 0.6,
    });

    const aiReply = response.choices[0].message.content;
    const isCritical = aiReply.includes("[CRITICAL_CASE]");
    
    // Hilangkan tag sistem agar tidak terlihat oleh siswa
    const cleanReply = aiReply.replace("[CRITICAL_CASE]", "").trim();

    return NextResponse.json({ 
      reply: cleanReply,
      isCritical: isCritical 
    });
  } catch (error) {
    return NextResponse.json({ message: "Gagal memproses pesan" }, { status: 500 });
  }
}