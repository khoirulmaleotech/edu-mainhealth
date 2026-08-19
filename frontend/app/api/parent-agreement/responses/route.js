import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await connectDB();
    const db = client.db();

    const allAgreements = await db
      .collection("family_ai_agreements")
      .find({})
      .sort({ createdAt: -1 }) // Tampilkan berkas kiriman paling baru di atas
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: allAgreements
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      }
    );

  } catch (error) {
    console.error("❌ ERROR_GET_PARENT_RESPONSES:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses data respons", data: [] },
      { status: 500 }
    );
  }
}