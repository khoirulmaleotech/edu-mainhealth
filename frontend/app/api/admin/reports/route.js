import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import {
  getEscapedRegex,
  getStatusMatch,
  reporterLookupStage,
  reporterNameStage,
  requireAdminSession,
  toObjectId,
} from "./_utils";

const pageProjection = {
  _id: 1,
  reporter_id: 1,
  incident_type: 1,
  location: 1,
  created_at: 1,
  status: 1,
};

function getPositiveInteger(value, fallback, max) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, max);
}

function buildListPipeline({ currentPage, pageSize, search, status }) {
  const skipData = (currentPage - 1) * pageSize;
  const statusMatch = getStatusMatch(status);
  const normalizedSearch = search.trim();

  if (!normalizedSearch) {
    return [
      { $match: statusMatch },
      {
        $facet: {
          data: [
            { $sort: { created_at: -1, _id: -1 } },
            { $skip: skipData },
            { $limit: pageSize },
            { $project: pageProjection },
            reporterLookupStage,
            reporterNameStage,
            {
              $project: {
                _id: 1,
                incident_type: 1,
                location: 1,
                created_at: 1,
                status: 1,
                reporter_fullname: 1,
              },
            },
          ],
          totalData: [{ $count: "count" }],
        },
      },
    ];
  }

  const searchRegex = getEscapedRegex(normalizedSearch);

  return [
    { $match: statusMatch },
    {
      $project: {
        ...pageProjection,
        description: 1,
      },
    },
    reporterLookupStage,
    reporterNameStage,
    {
      $match: {
        $or: [
          { incident_type: { $regex: searchRegex, $options: "i" } },
          { description: { $regex: searchRegex, $options: "i" } },
          { location: { $regex: searchRegex, $options: "i" } },
          { reporter_fullname: { $regex: searchRegex, $options: "i" } },
        ],
      },
    },
    {
      $facet: {
        data: [
          { $sort: { created_at: -1, _id: -1 } },
          { $skip: skipData },
          { $limit: pageSize },
          {
            $project: {
              _id: 1,
              incident_type: 1,
              location: 1,
              created_at: 1,
              status: 1,
              reporter_fullname: 1,
            },
          },
        ],
        totalData: [{ $count: "count" }],
      },
    },
  ];
}

export async function GET(request) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const db = (await connectDB()).db();
    const { searchParams } = new URL(request.url);
    const currentPage = getPositiveInteger(searchParams.get("page"), 1, 100000);
    const requestedPageSize = searchParams.get("pageSize") || searchParams.get("limit");
    const pageSize = getPositiveInteger(requestedPageSize, 10, 100);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const [payload = { data: [], totalData: [] }] = await db
      .collection("incident_reports")
      .aggregate(buildListPipeline({ currentPage, pageSize, search, status }), {
        allowDiskUse: false,
      })
      .toArray();

    const totalData = payload.totalData?.[0]?.count || 0;
    const totalPages = Math.ceil(totalData / pageSize);

    return NextResponse.json({
      success: true,
      data: payload.data || [],
      pagination: {
        currentPage,
        pageSize,
        totalData,
        totalPages,
        hasNextPage: totalData > currentPage * pageSize,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("ADMIN_REPORTS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const { id, status } = await request.json();
    const reportId = toObjectId(id);

    if (!reportId || !status) {
      return NextResponse.json(
        { success: false, message: "ID dan status diperlukan" },
        { status: 400 },
      );
    }

    const db = (await connectDB()).db();
    await db
      .collection("incident_reports")
      .updateOne(
        { _id: reportId },
        { $set: { status, updated_at: new Date() } },
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_REPORT_UPDATE_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const reportId = toObjectId(searchParams.get("id"));

    if (!reportId) {
      return NextResponse.json(
        { success: false, message: "ID diperlukan" },
        { status: 400 },
      );
    }

    const db = (await connectDB()).db();
    await db
      .collection("incident_reports")
      .deleteOne({ _id: reportId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_REPORT_DELETE_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
