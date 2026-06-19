import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["admin", "superadmin"]);

    const client = await connectDB();
    const database = client.db();

    const activeSchools = await database.collection("schools").countDocuments({
      is_verified: true,
      is_hide: "false",
    });

    return NextResponse.json({
      success: true,
      activeSchools,
    });
  } catch (error) {
    console.error("ADMIN_ACTIVE_SCHOOLS_ERROR:", error);

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
