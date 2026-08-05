import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const search = searchParams.get("search") || "";
    const schoolFilter = searchParams.get("school") || "";
    const severityFilter = searchParams.get("severity") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const isExport = searchParams.get("export") === "true";
    const wilayah = searchParams.get("wilayah") || "";

    const client = await connectDB();
    const db = client.db("edumind");

    const matchStage = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.completedAt = { $gte: start, $lte: end };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "_id",
          as: "student_data",
        },
      },
      {
        $unwind: { path: "$student_data", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "schools",
          localField: "student_data.school_id",
          foreignField: "_id",
          as: "school_data",
        },
      },
      {
        $unwind: { path: "$school_data", preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          totalScore: 1,
          severity: 1,
          completedAt: 1,
          breakdown: 1,
          openEnded: 1,
          student_name: "$student_data.fullname",
          student_email: "$student_data.email",
          school_name: "$school_data.name",
        },
      },
      { $sort: { completedAt: -1 } },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { student_name: { $regex: search, $options: "i" } },
            { student_email: { $regex: search, $options: "i" } },
            { school_name: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    if (schoolFilter) {
      pipeline.push({
        $match: {
          school_name: schoolFilter,
        },
      });
    }

    if (severityFilter) {
      pipeline.push({
        $match: {
          "severity.level": severityFilter,
        },
      });
    }

    if (wilayah) {
      pipeline.push({
        $match: {
          school_name: { $regex: wilayah, $options: "i" },
        },
      });
    }

    const statsPipeline = [
      ...pipeline,
      {
        $facet: {
          total: [{ $count: "count" }],
          makassar: [
            { $match: { school_name: { $regex: "makassar", $options: "i" } } },
            { $count: "count" }
          ],
          bukittinggi: [
            { $match: { school_name: { $regex: "bukittinggi", $options: "i" } } },
            { $count: "count" }
          ]
        }
      }
    ];
    
    const statsResult = await db.collection("student_tilik_diri").aggregate(statsPipeline).toArray();
    const totalData = statsResult[0]?.total[0]?.count || 0;
    const countMakassar = statsResult[0]?.makassar[0]?.count || 0;
    const countBukittinggi = statsResult[0]?.bukittinggi[0]?.count || 0;

    let data = [];
    if (isExport) {
      data = await db.collection("student_tilik_diri").aggregate(pipeline).toArray();
    } else {
      data = await db
        .collection("student_tilik_diri")
        .aggregate([
          ...pipeline,
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize },
        ])
        .toArray();
    }

    return NextResponse.json({
      success: true,
      data,
      counts: {
        makassar: countMakassar,
        bukittinggi: countBukittinggi,
      },
      pagination: {
        currentPage: page,
        pageSize,
        totalData,
        totalPages: Math.ceil(totalData / pageSize),
      },
    });
  } catch (error) {
    console.error("GET Admin Tilik Diri Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem" },
      { status: 500 }
    );
  }
}
