import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { parent_name, child_name, agreement_date, agreements_signed } = body;

    if (!parent_name || !child_name || !agreement_date) {
      return NextResponse.json({ success: false, message: "Data komitmen tidak lengkap" }, { status: 400 });
    }

    const client = await connectDB();
    const db = client.db();

    await db.collection("family_ai_agreements").insertOne({
      parent_name,
      child_name,
      agreement_date,
      agreements_signed,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, message: "Kesepakatan Keluarga Cerdas AI berhasil direkam." }, { status: 201 });

  } catch (error) {
    console.error("ERROR_POST_PARENT_AGREEMENT:", error);
    return NextResponse.json({ success: false, message: error.message || "Gagal memproses penyimpanan kesepakatan" }, { status: 500 });
  }
}