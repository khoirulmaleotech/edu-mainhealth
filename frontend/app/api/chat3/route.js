import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Pesan kosong" }, { status: 400 });
    }

    // 1. Logika Deteksi Kata Kunci Kritis (Bypass)
    const criticalKeywords = ["bunuh diri", "ingin mati", "menyakiti diri", "akhiri hidup", "self harm"];
    const isCritical = criticalKeywords.some(word => message.toLowerCase().includes(word));

    if (isCritical) {
      return NextResponse.json({ 
        reply: "Aku sangat peduli padamu, tapi sepertinya kamu butuh bantuan yang lebih ahli sekarang. Aku sangat menyarankanmu untuk berbicara dengan psikolog kami. Maukah kamu mencobanya?",
        forceHandover: true 
      });
    }

    // 2. Meminta AI untuk menganalisis urgensi dalam system prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Kamu adalah Al Mood Buddy, asisten psikologi anak yang sangat empatik. 
          Gunakan Bahasa Indonesia yang hangat. 
          PENTING: Jika pesan user menunjukkan depresi berat, trauma mendalam, atau tanda-tanda bahaya, akhiri responsmu dengan kode unik [URGENT].` 
        },
        { role: "user", content: message },
      ],
    });

    let reply = response.choices[0].message.content;
    let shouldHandover = false;

    // 3. Cek apakah AI memberikan sinyal urgensi
    if (reply.includes("[URGENT]")) {
      reply = reply.replace("[URGENT]", "");
      shouldHandover = true;
    }

    return NextResponse.json({ 
      reply, 
      forceHandover: shouldHandover 
    });

  } catch (error) {
    console.error("OPENAI ERROR:", error);
    return NextResponse.json(
      { reply: "Maaf, aku sedang tidak enak badan. Bisa hubungi aku lagi nanti?" },
      { status: 500 }
    );
  }
}