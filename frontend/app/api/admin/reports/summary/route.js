import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import { requireAdminSession } from "../_utils";

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const db = (await connectDB()).db();
    const [summary = {}] = await db
      .collection("incident_reports")
      .aggregate([
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  {
                    case: { $in: ["$status", ["pending", "Pending"]] },
                    then: "pending",
                  },
                  {
                    case: { $in: ["$status", ["reviewing", "In Progress"]] },
                    then: "reviewing",
                  },
                  {
                    case: { $in: ["$status", ["resolved", "Resolved"]] },
                    then: "resolved",
                  },
                  {
                    case: { $eq: ["$status", "rejected"] },
                    then: "rejected",
                  },
                ],
                default: "other",
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$count" },
            pending: {
              $sum: {
                $cond: [{ $eq: ["$_id", "pending"] }, "$count", 0],
              },
            },
            reviewing: {
              $sum: {
                $cond: [{ $eq: ["$_id", "reviewing"] }, "$count", 0],
              },
            },
            resolved: {
              $sum: {
                $cond: [{ $eq: ["$_id", "resolved"] }, "$count", 0],
              },
            },
            rejected: {
              $sum: {
                $cond: [{ $eq: ["$_id", "rejected"] }, "$count", 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            pending: 1,
            reviewing: 1,
            resolved: 1,
            rejected: 1,
          },
        },
      ], { allowDiskUse: false })
      .toArray();

    return NextResponse.json({
      success: true,
      summary: {
        total: summary.total || 0,
        pending: summary.pending || 0,
        reviewing: summary.reviewing || 0,
        resolved: summary.resolved || 0,
        rejected: summary.rejected || 0,
      },
    });
  } catch (error) {
    console.error("ADMIN_REPORTS_SUMMARY_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
