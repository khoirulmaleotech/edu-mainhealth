import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = (await connectDB()).db();
    const [summary = {}] = await db
      .collection("articles")
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$count" },
            published: {
              $sum: {
                $cond: [{ $eq: ["$_id", "Published"] }, "$count", 0],
              },
            },
            drafts: {
              $sum: {
                $cond: [{ $eq: ["$_id", "Draft"] }, "$count", 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            published: 1,
            drafts: 1,
          },
        },
      ], { allowDiskUse: false })
      .toArray();

    return NextResponse.json({
      success: true,
      summary: {
        total: summary.total || 0,
        published: summary.published || 0,
        drafts: summary.drafts || 0,
      },
    });
  } catch (error) {
    console.error("GET_ARTICLES_SUMMARY_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
