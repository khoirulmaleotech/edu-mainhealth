import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["admin", "superadmin"]);

    const client = await connectDB();
    const database = client.db();

    const [
      totalStudents,
      activeSchools,
      verifiedPsychologists,
      pendingSchools,
      pendingPsychologists,
      pendingSchoolQueue,
      pendingPsychologistQueue,
    ] = await Promise.all([
      database.collection("users").countDocuments({ role: "student" }),
      database.collection("schools").countDocuments({ is_verified: true }),
      database.collection("users").countDocuments({
        role: "psychologist",
        is_verified: true,
      }),
      database.collection("schools").countDocuments({ is_verified: { $ne: true } }),
      database.collection("users").countDocuments({
        role: "psychologist",
        is_verified: { $ne: true },
      }),
      database
        .collection("schools")
        .aggregate([
          {
            $match: {
              is_verified: {
                $ne: true,
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "admin_id",
              foreignField: "_id",
              as: "admin",
            },
          },
          {
            $unwind: {
              path: "$admin",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              name: 1,
              sub: {
                $ifNull: ["$address", "$admin.email"],
              },
              type: {
                $literal: "Sekolah",
              },
              createdAt: 1,
              href: {
                $literal: "/dashboard/admin/verify-schools",
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 8,
          },
        ])
        .toArray(),
      database
        .collection("users")
        .find(
          {
            role: "psychologist",
            is_verified: {
              $ne: true,
            },
          },
          {
            projection: {
              fullname: 1,
              email: 1,
              institution_name: 1,
              createdAt: 1,
            },
          }
        )
        .sort({
          createdAt: -1,
        })
        .limit(8)
        .toArray(),
    ]);

    const psychologistQueue = pendingPsychologistQueue.map((psychologist) => ({
      _id: psychologist._id,
      name: psychologist.fullname || psychologist.email || "Psikolog",
      sub: psychologist.institution_name || psychologist.email || "-",
      type: "Psikolog",
      createdAt: psychologist.createdAt,
      href: "/dashboard/admin/verify-psychologist",
    }));

    const verificationQueue = [...pendingSchoolQueue, ...psychologistQueue]
      .sort(
        (firstItem, secondItem) =>
          new Date(secondItem.createdAt || 0) - new Date(firstItem.createdAt || 0)
      )
      .slice(0, 8);

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          totalStudents,
          activeSchools,
          verifiedPsychologists,
          pendingVerifications: pendingSchools + pendingPsychologists,
          pendingSchools,
          pendingPsychologists,
        },
        verificationQueue,
      },
    });
  } catch (error) {
    console.error("ADMIN_OVERVIEW_ERROR:", error);

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
