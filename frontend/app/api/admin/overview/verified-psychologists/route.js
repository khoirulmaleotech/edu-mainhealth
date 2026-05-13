import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["admin", "superadmin"]);

    const client = await connectDB();
    const database = client.db();

    const result = await database
      .collection("users")
      .aggregate([
        {
          $match: {
            role: "psychologist",
          },
        },
        {
          $group: {
            _id: null,
            verifiedPsychologists: {
              $sum: {
                $cond: [{ $eq: ["$is_verified", true] }, 1, 0],
              },
            },
            pendingPsychologists: {
              $sum: {
                $cond: [{ $ne: ["$is_verified", true] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            verifiedPsychologists: 1,
            pendingPsychologists: 1,
          },
        },
      ])
      .next();

    return NextResponse.json({
      success: true,
      verifiedPsychologists: result?.verifiedPsychologists || 0,
      pendingPsychologists: result?.pendingPsychologists || 0,
    });
  } catch (error) {
    console.error("ADMIN_VERIFIED_PSYCHOLOGISTS_ERROR:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          message: "Login diperlukan",
        },
        {
          status: 401,
        }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
