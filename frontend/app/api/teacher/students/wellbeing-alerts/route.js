import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await requireRole(["teacher"]);

    const client = await connectDB();
    const database = client.db();

    const teacherId = new ObjectId(session.user.id);
    console.log(teacherId)

    const { searchParams } = new URL(request.url);

    const currentPage = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 10;
    const status = searchParams.get("status") || "";
    const severity = searchParams.get("severity") || "";
    const search = searchParams.get("search") || "";

    const skipData = (currentPage - 1) * pageSize;

    const matchFilter = {};

    if (status && status !== "all") {
      matchFilter.status = status;
    }

    if (severity && severity !== "all") {
      matchFilter.severity = severity;
    }

    const searchFilter = search.trim()
      ? {
        "student.fullname": {
          $regex: search,
          $options: "i",
        },
      }
      : {};

    const basePipeline = [
      {
        $match: matchFilter,
      },
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $match: {
          "student.role": "student",
          "student.homeroom_teacher_id": teacherId,
          ...searchFilter,
        },
      },
    ];

    const result = await database
      .collection("critical_chat_logs")
      .aggregate([
        ...basePipeline,
        {
          $facet: {
            data: [
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $skip: skipData,
              },
              {
                $limit: pageSize,
              },
              {
                $project: {
                  _id: 1,
                  student_id: 1,
                  conversation: 1,
                  critical_message: 1,
                  ai_reply: 1,

                  is_critical: 1,
                  severity: 1,
                  risk_types: 1,
                  risk_reason: 1,
                  detected_language: 1,

                  source: 1,
                  status: 1,
                  reviewed_by: 1,
                  reviewed_at: 1,
                  teacher_note: 1,
                  createdAt: 1,

                  student_fullname: "$student.fullname",
                  student_email: "$student.email",
                  class_id: "$student.class_id",
                  class_name: "$student.class_name",
                },
              },
            ],

            totalData: [
              {
                $count: "count",
              },
            ],

            statusSummary: [
              {
                $group: {
                  _id: "$status",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],

            severitySummary: [
              {
                $group: {
                  _id: "$severity",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
          },
        },
        {
          $project: {
            data: 1,

            totalData: {
              $ifNull: [
                {
                  $arrayElemAt: ["$totalData.count", 0],
                },
                0,
              ],
            },

            statusSummary: 1,
            severitySummary: 1,
          },
        },
      ])
      .toArray();

    const payload = result[0] || {
      data: [],
      totalData: 0,
      statusSummary: [],
      severitySummary: [],
    };

    return NextResponse.json({
      success: true,
      data: payload.data,
      summary: {
        total: payload.totalData,
        status: payload.statusSummary,
        severity: payload.severitySummary,
      },
      pagination: {
        currentPage,
        pageSize,
        totalData: payload.totalData,
        totalPages: Math.ceil(payload.totalData / pageSize),
        hasNextPage: currentPage * pageSize < payload.totalData,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("TEACHER_CRITICAL_CHAT_LOGS_ERROR:", error);

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
