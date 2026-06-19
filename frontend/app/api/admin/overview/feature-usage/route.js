import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["admin", "superadmin"]);
    const client = await connectDB();
    const database = client.db();

    const tilikDiri = await database.collection("student_tilik_diri").countDocuments();
    const learningStyle = await database.collection("student_learning_style").countDocuments();
    const riasec = await database.collection("student_riasec").countDocuments();
    const brainDominance = await database.collection("student_brain_dominance").countDocuments();
    const talentMapping = await database.collection("student_talents").countDocuments();

    return NextResponse.json(
      {
        success: true,
        data: {
          tilikDiri,
          learningStyle,
          riasec,
          brainDominance,
          talentMapping
        }
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      }
    );
  } catch (error) {
    console.error("ADMIN_FEATURE_USAGE_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
