import { NextResponse } from "next/server";
import OpenAI from "openai";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const uri = process.env.MONGODB_URI;

let client;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

const clientPromise = global._mongoClientPromise;

const CHAT_SYSTEM_PROMPT = `
Anda adalah Al Mood Buddy, asisten pendukung kesehatan mental siswa.

Gunakan bahasa yang sama dengan pengguna.
Jika pengguna memakai English, jawab English.
Jika pengguna memakai Bahasa Indonesia, jawab Bahasa Indonesia.
Jika pengguna memakai campuran/slang, ikuti secara natural.

Gaya respons:
- sangat empati
- hangat
- tidak menghakimi
- tidak mendiagnosis
- tidak menyebut bahwa pengguna "sakit mental"

BATASAN TOPIK:
Anda hanya boleh merespons topik terkait:
- kesehatan mental
- stres, cemas, sedih, depresi, kesepian
- curhat, emosi, pengalaman pribadi
- trauma, bullying, hubungan sosial
- keluarga, pertemanan, percintaan
- kepercayaan diri, motivasi, identitas diri
- masalah sekolah yang berdampak ke emosi

Jika pesan di luar topik, jawab hangat bahwa Anda hanya bisa membantu seputar wellbeing emosional siswa.
`;

const RISK_CLASSIFIER_PROMPT = `
You are a multilingual student wellbeing risk classifier.

Your job is NOT to reply to the student.
Your job is to classify the latest user message and conversation context.

You must understand:
- Indonesian
- English
- mixed Indonesian-English slang
- informal language
- typo-heavy writing
- indirect emotional expressions

Return ONLY valid JSON.

Risk levels:

LOW:
Normal sadness, stress, disappointment, mild anxiety, school pressure.

MEDIUM:
Persistent sadness, loneliness, emotional exhaustion, relationship distress,
low self-worth, mild bullying, social exclusion, "I feel like I don't belong".

HIGH:
Strong emotional distress, hopelessness, severe isolation, repeated despair,
toxic relationship trauma, bullying with strong emotional impact,
phrases like:
- "I'm tired of this"
- "Aku capek semuanya"
- "No one listens to me"
- "I don't belong anywhere"
- "Everything feels pointless"
but WITHOUT explicit self-harm or suicide intent.

CRITICAL:
Immediate safety concern, including:
- self-harm intent
- suicidal ideation
- wanting to die
- wanting to disappear forever
- plans or methods for suicide/self-harm
- sexual abuse
- physical abuse
- severe violence threat
- severe bullying with danger
- user may be in immediate danger

Classification rules:
- If unsure between LOW and MEDIUM, choose MEDIUM.
- If unsure between MEDIUM and HIGH, choose HIGH.
- If there is any self-harm or suicide signal, choose CRITICAL.
- Do not over-classify ordinary sadness as CRITICAL.
- Use HIGH for serious distress needing teacher/counselor review.
- Use CRITICAL only for urgent safety cases.

Return JSON with this exact shape:

{
  "risk_level": "low" | "medium" | "high" | "critical",
  "risk_types": string[],
  "reason": string,
  "should_store": boolean,
  "should_notify_teacher": boolean,
  "detected_language": "id" | "en" | "mixed"
}
`;

function safeParseConversation(conversationRaw) {
  if (!conversationRaw) return [];

  try {
    const parsed = JSON.parse(conversationRaw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item?.role && item?.content)
      .map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: String(item.content),
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      }));
  } catch {
    return [];
  }
}

function safeParseRisk(raw) {
  try {
    const parsed = JSON.parse(raw);

    const allowedLevels = ["low", "medium", "high", "critical"];
    const allowedLanguages = ["id", "en", "mixed"];

    return {
      risk_level: allowedLevels.includes(parsed.risk_level)
        ? parsed.risk_level
        : "medium",

      risk_types: Array.isArray(parsed.risk_types)
        ? parsed.risk_types
        : [],

      reason: parsed.reason || "",

      should_store: Boolean(parsed.should_store),

      should_notify_teacher: Boolean(parsed.should_notify_teacher),

      detected_language: allowedLanguages.includes(parsed.detected_language)
        ? parsed.detected_language
        : "id",
    };
  } catch {
    return {
      risk_level: "medium",
      risk_types: ["unknown"],
      reason: "Failed to parse risk classifier response.",
      should_store: false,
      should_notify_teacher: false,
      detected_language: "id",
    };
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const userMessage = formData.get("message");
    const audioFile = formData.get("file");
    const conversationRaw = formData.get("conversation");

    const previousConversation = safeParseConversation(conversationRaw);

    let finalInput = userMessage;

    if (audioFile && audioFile.size > 0) {
      const buffer = Buffer.from(await audioFile.arrayBuffer());

      const transcription = await openai.audio.transcriptions.create({
        file: await OpenAI.toFile(buffer, "recording.ogg"),
        model: "whisper-1",
      });

      finalInput = transcription.text;
    }

    if (!finalInput) {
      return NextResponse.json(
        { success: false, message: "Pesan kosong" },
        { status: 400 }
      );
    }

    const conversationForAI = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      ...previousConversation.map((item) => ({
        role: item.role,
        content: item.content,
      })),
      {
        role: "user",
        content: String(finalInput),
      },
    ];

    const [chatResponse, riskResponse] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: conversationForAI,
        temperature: 0.6,
      }),

      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: RISK_CLASSIFIER_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              latest_message: String(finalInput),
              conversation: previousConversation.slice(-20),
            }),
          },
        ],
        temperature: 0,
        response_format: { type: "json_object" },
      }),
    ]);

    const cleanReply = chatResponse.choices[0].message.content || "";

    const riskRaw = riskResponse.choices[0].message.content || "{}";
    const risk = safeParseRisk(riskRaw);

    const isCritical = risk.risk_level === "critical";
    const shouldStore =
      risk.risk_level === "high" || risk.risk_level === "critical";

    const assistantMessage = {
      role: "assistant",
      content: cleanReply,
      createdAt: new Date(),
    };

    if (shouldStore) {
      const dbClient = await clientPromise;
      const db = dbClient.db();

      const fullConversation = [
        ...previousConversation,
        assistantMessage,
      ];

      await db.collection("critical_chat_logs").insertOne({
        student_id: new ObjectId(session.user.id),

        conversation: fullConversation.slice(-30),
        critical_message: String(finalInput),

        is_critical: isCritical,
        severity: risk.risk_level,
        risk_types: risk.risk_types,
        risk_reason: risk.reason,
        detected_language: risk.detected_language,

        source: "student_chat",
        status: "pending_review",

        reviewed_by: null,
        reviewed_at: null,
        teacher_note: null,

        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      reply: cleanReply,

      riskLevel: risk.risk_level,
      detectedLanguage: risk.detected_language,
      isCritical,
      shouldStore,
    });
  } catch (error) {
    console.error("CHAT_API_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Gagal memproses pesan" },
      { status: 500 }
    );
  }
}
