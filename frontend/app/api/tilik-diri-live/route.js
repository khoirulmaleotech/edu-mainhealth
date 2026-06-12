import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const client = await connectDB();
    const db = client.db("edumind");

    const pipeline = [
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          severityDistribution: [
            { $group: { _id: "$severity.level", count: { $sum: 1 } } }
          ],
          recentFeelings: [
            { $match: { "openEnded.feelings": { $exists: true, $ne: "" }, "openEnded.feelings": { $ne: null } } },
            { $sort: { completedAt: -1 } },
            { $limit: 30 },
            { $project: { _id: 1, feeling: "$openEnded.feelings" } }
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
        recentFeelings: data.recentFeelings
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
