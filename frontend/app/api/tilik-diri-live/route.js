import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolFilter = searchParams.get("school") || "";

    const client = await connectDB();
    const db = client.db("edumind");

    const matchSchoolStage = schoolFilter ? [{ $match: { "school_data.name": schoolFilter } }] : [];

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "_id",
          as: "student_data",
        },
      },
      { $unwind: { path: "$student_data", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "schools",
          localField: "student_data.school_id",
          foreignField: "_id",
          as: "school_data",
        },
      },
      { $unwind: { path: "$school_data", preserveNullAndEmptyArrays: false } },
      {
        $facet: {
          totalCount: [
            ...matchSchoolStage,
            { $count: "count" }
          ],
          severityDistribution: [
            ...matchSchoolStage,
            { $group: { _id: "$severity.level", count: { $sum: 1 } } }
          ],
          recentFeelings: [
            ...matchSchoolStage,
            { $match: { "openEnded.feelings": { $exists: true, $ne: "" }, "openEnded.feelings": { $ne: null } } },
            { $sort: { completedAt: -1 } },
            { $limit: 30 },
            { $project: { _id: 1, feeling: "$openEnded.feelings" } }
          ],
          schoolDistribution: [
            {
              $group: {
                _id: "$school_data.name",
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ]
        }
      }
    ];

    const results = await db.collection("student_tilik_diri").aggregate(pipeline).toArray();

    const data = results[0];
    const totalCount = data.totalCount.length > 0 ? data.totalCount[0].count : 0;
    
    // Format severity distribution
    const severityMap = {
      "Tidak Terdeteksi": 0,
      "Depresi Ringan": 0,
      "Depresi Sedang": 0,
      "Depresi Berat": 0,
      "Depresi Berat / Sangat Berat": 0
    };

    data.severityDistribution.forEach(item => {
      const level = item._id || "Tidak Diketahui";
      // normalize level text if needed
      let normalized = level;
      if (level.toLowerCase() === "depresi ringan") normalized = "Depresi Ringan";
      else if (level.toLowerCase() === "depresi sedang") normalized = "Depresi Sedang";
      else if (level.toLowerCase() === "depresi berat") normalized = "Depresi Berat";
      else if (level.toLowerCase() === "depresi berat / sangat berat") normalized = "Depresi Berat / Sangat Berat";
      else if (level.toLowerCase() === "tidak terdeteksi") normalized = "Tidak Terdeteksi";

      if (severityMap[normalized] !== undefined) {
        severityMap[normalized] += item.count;
      } else {
        severityMap[normalized] = item.count;
      }
    });

    const formattedSeverity = Object.keys(severityMap)
      .map(k => ({ name: k, value: severityMap[k] }))
      .filter(item => item.value > 0);

    return NextResponse.json({
      success: true,
      data: {
        totalRespondents: totalCount,
        severityChart: formattedSeverity,
        recentFeelings: data.recentFeelings,
        schoolDistribution: data.schoolDistribution.map(item => ({ name: item._id || "Unknown", count: item.count }))
      }
    });
  } catch (error) {
    console.error("GET Tilik Diri Live Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem" },
      { status: 500 }
    );
  }
}
