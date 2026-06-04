import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Amankan koneksi database menggunakan pooling terpusat dari global cache Anda
    const client = await connectDB();
    const db = client.db();

    // 2. Tarik data seluruh respons dari koleksi 'wellbeing_camp_responses'
    const allResponses = await db
      .collection("wellbeing_camp_responses")
      .find({})
      .sort({ timestamp: -1 }) // Urutkan murni berdasarkan data isian paling baru (Descending)
      .toArray();

    // 3. Kembalikan response payload sukses berstandar internal EduMind
    return NextResponse.json(
      {
        success: true,
        data: allResponses
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      }
    );

  } catch (error) {
    console.error("❌ ERROR_GET_QUESTIONNAIRE_RESPONSES:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memuat seluruh data respons kuesioner",
        data: []
      },
      { status: 500 }
    );
  }
}