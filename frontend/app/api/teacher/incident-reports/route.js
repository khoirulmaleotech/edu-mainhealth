import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export async function GET(request) {
  try {
    const session = await requireRole(["teacher"]);

    const client = await connectDB();
    const database = client.db();

    const teacherId = new ObjectId(session.user.id);

    const { searchParams } = new URL(request.url);

    const currentPage = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 10;
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const skipData = (currentPage - 1) * pageSize;

    const incidentMatchFilter = {};

    if (status && status !== "all") {
      incidentMatchFilter.status = status;
    }

    const studentSearchFilter = search.trim()
      ? {
        "reporter.fullname": {
          $regex: search,
          $options: "i",
        },
      }
      : {};

    const basePipeline = [
      {
        $match: incidentMatchFilter,
      },
      {
        $lookup: {
          from: "users",
          localField: "reporter_id",
          foreignField: "_id",
          as: "reporter",
        },
      },
      {
        $unwind: "$reporter",
      },
      {
        $match: {
          "reporter.role": "student",
          "reporter.homeroom_teacher_id": teacherId,
          ...studentSearchFilter,
        },
      },
    ];

    const totalDataResult = await database
      .collection("incident_reports")
      .aggregate([
        ...basePipeline,
        {
          $count: "totalData",
        },
      ])
      .toArray();

    const totalData = totalDataResult[0]?.totalData || 0;

    const statusSummaryResult = await database
      .collection("incident_reports")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "reporter_id",
            foreignField: "_id",
            as: "reporter",
          },
        },
        {
          $unwind: "$reporter",
        },
        {
          $match: {
            "reporter.role": "student",
            "reporter.homeroom_teacher_id": teacherId,
          },
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ])
      .toArray();

    const summary = {
      total: 0,
      pending: 0,
      reviewing: 0,
      resolved: 0,
      rejected: 0,
    };

    statusSummaryResult.forEach((item) => {
      summary.total += item.count;

      if (item._id) {
        summary[item._id] = item.count;
      }
    });

    const incidentReports = await database
      .collection("incident_reports")
      .aggregate([
        ...basePipeline,
        {
          $sort: {
            created_at: -1,
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
            reporter_id: 1,
            incident_type: 1,
            location: 1,
            occurrence_time: 1,
            description: 1,
            evidence_url: 1,
            status: 1,
            created_at: 1,
            updated_at: 1,

            reporter_fullname: "$reporter.fullname",
            reporter_email: "$reporter.email",
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: incidentReports,
      summary,
      pagination: {
        currentPage,
        pageSize,
        totalData,
        totalPages: Math.ceil(totalData / pageSize),
        hasNextPage: currentPage * pageSize < totalData,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("TEACHER_INCIDENT_REPORTS_ERROR:", error);

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
