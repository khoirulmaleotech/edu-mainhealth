import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["admin", "superadmin"]);

    const client = await connectDB();
    const database = client.db();

    const pipeline = [
      {
        $match: { is_hide: "false" }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "school_id",
          as: "users"
        }
      },
      {
        $project: {
          city: { $ifNull: ["$city", "Tidak Diketahui"] },
          totalStudents: {
            $size: {
              $filter: {
                input: "$users",
                as: "user",
                cond: { $eq: ["$$user.role", "student"] }
              }
            }
          },
          totalTeachers: {
            $size: {
              $filter: {
                input: "$users",
                as: "user",
                cond: { $eq: ["$$user.role", "teacher"] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$city",
          activeSchools: { $sum: 1 },
          totalStudents: { $sum: "$totalStudents" },
          totalTeachers: { $sum: "$totalTeachers" }
        }
      },
      {
        $project: {
          _id: 0,
          city: "$_id",
          activeSchools: 1,
          totalStudents: 1,
          totalTeachers: 1
        }
      },
      {
        $sort: { activeSchools: -1, city: 1 }
      }
    ];

    const citiesData = await database.collection("schools").aggregate(pipeline).toArray();

    return NextResponse.json({
      success: true,
      data: citiesData,
    });
  } catch (error) {
    console.error("ADMIN_CITIES_STATS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
