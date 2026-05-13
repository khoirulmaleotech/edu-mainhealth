import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const uri = process.env.MONGODB_URI;
const allowedAdminRoles = ["admin", "superadmin", "school_admin"];
const statusAlias = {
  pending: ["pending", "Pending"],
  reviewing: ["reviewing", "In Progress"],
  resolved: ["resolved", "Resolved"],
  rejected: ["rejected"],
};

export async function GET(request) {
  const client = new MongoClient(uri);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !allowedAdminRoles.includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    await client.connect();
    const db = client.db();
    const { searchParams } = new URL(request.url);
    const currentPage = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const skipData = (currentPage - 1) * pageSize;

    const statusMatch =
      status && status !== "all"
        ? {
            status: {
              $in: statusAlias[status] || [status],
            },
          }
        : {};

    const searchMatch = search
      ? {
          $or: [
            { incident_type: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { "reporter.fullname": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const result = await db
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
        { $unwind: { path: "$reporter", preserveNullAndEmptyArrays: true } },
        {
          $facet: {
            data: [
              { $match: { ...statusMatch, ...searchMatch } },
              { $sort: { created_at: -1 } },
              { $skip: skipData },
              { $limit: pageSize },
              {
                $project: {
                  incident_type: 1,
                  location: 1,
                  occurrence_time: 1,
                  description: 1,
                  evidence_url: 1,
                  created_at: 1,
                  reporter: {
                    fullname: "$reporter.fullname",
                    role: "$reporter.role",
                    email: "$reporter.email",
                  },
                  reporter_fullname: "$reporter.fullname",
                  reporter_email: "$reporter.email",
                  status: 1,
                },
              },
            ],
            totalData: [
              { $match: { ...statusMatch, ...searchMatch } },
              { $count: "count" },
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
          }
        },
        {
          $project: {
            data: 1,
            statusSummary: 1,
            totalData: { $ifNull: [{ $arrayElemAt: ["$totalData.count", 0] }, 0] },
            totalPages: {
              $ceil: {
                $divide: [{ $ifNull: [{ $arrayElemAt: ["$totalData.count", 0] }, 0] }, pageSize],
              },
            },
            hasNextPage: {
              $gt: [{ $ifNull: [{ $arrayElemAt: ["$totalData.count", 0] }, 0] }, currentPage * pageSize],
            },
            hasPreviousPage: { $gt: [currentPage, 1] },
          }
        },
      ])
      .toArray();

    const payload = result[0] || { data: [], totalData: 0 };

    return NextResponse.json({
      success: true,
      data: payload.data,
      reports: payload.data,
      summary: {
        status: payload.statusSummary || [],
      },
      pagination: {
        currentPage,
        pageSize,
        totalData: payload.totalData,
        totalPages: payload.totalPages,
        hasNextPage: payload.hasNextPage,
        hasPreviousPage: payload.hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("ADMIN_REPORTS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

export async function PATCH(request) {
  const client = new MongoClient(uri);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !allowedAdminRoles.includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "ID dan status diperlukan" },
        { status: 400 },
      );
    }

    await client.connect();
    const db = client.db();
    await db
      .collection("incident_reports")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updated_at: new Date() } },
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_REPORT_UPDATE_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

export async function DELETE(request) {
  const client = new MongoClient(uri);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !allowedAdminRoles.includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID diperlukan" },
        { status: 400 },
      );
    }

    await client.connect();
    const db = client.db();
    await db
      .collection("incident_reports")
      .deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_REPORT_DELETE_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
