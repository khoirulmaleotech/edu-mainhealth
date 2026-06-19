import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["admin", "superadmin"]);

    const client = await connectDB();
    const database = client.db();

    const activeSchools = await database.collection("schools").find({ is_hide: "false" }).project({ _id: 1 }).toArray();
    const activeSchoolIds = activeSchools.map(s => s._id);

    const totalStudents = await database.collection("users").countDocuments({
      role: "student",
      school_id: { $in: activeSchoolIds }
    });

    const totalTeachers = await database.collection("users").countDocuments({
      role: "teacher",
      school_id: { $in: activeSchoolIds }
    });

    return NextResponse.json({
      success: true,
      totalStudents,
      totalTeachers,
    });
  } catch (error) {
    console.error("ADMIN_TOTAL_STUDENTS_ERROR:", error);

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
