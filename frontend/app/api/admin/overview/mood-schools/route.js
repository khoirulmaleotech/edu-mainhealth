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
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "schools",
          localField: "user.school_id",
          foreignField: "_id",
          as: "school"
        }
      },
      { $unwind: "$school" },
      {
        $match: {
          "school.is_hide": "false"
        }
      },
      {
        $addFields: {
          score: {
            $switch: {
              branches: [
                { case: { $eq: ["$label", "Hebat"] }, then: 5 },
                { case: { $eq: ["$label", "Senang"] }, then: 4 },
                { case: { $eq: ["$label", "Biasa"] }, then: 3 },
                { case: { $eq: ["$label", "Bingung"] }, then: 2 },
                { case: { $eq: ["$label", "Sedih"] }, then: 1 }
              ],
              default: 3
            }
          }
        }
      },
      {
        $group: {
          _id: "$school.name",
          averageMood: { $avg: "$score" },
          totalLogs: { $sum: 1 }
        }
      },
      { $sort: { averageMood: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          schoolName: "$_id",
          averageMood: { $round: ["$averageMood", 1] },
          totalLogs: 1
        }
      }
    ];

    const results = await database.collection("mood_logs").aggregate(pipeline).toArray();

    return NextResponse.json(
      { success: true, data: results },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("ADMIN_MOOD_SCHOOLS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
