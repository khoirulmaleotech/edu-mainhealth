import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import {
  reporterDetailLookupStage,
  reporterNameStage,
  requireAdminSession,
  toObjectId,
} from "../../_utils";

export async function GET(_request, { params }) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const reportId = toObjectId(params.id);
    if (!reportId) {
      return NextResponse.json(
        { success: false, message: "ID laporan tidak valid" },
        { status: 400 },
      );
    }

    const db = (await connectDB()).db();
    const [report] = await db
      .collection("incident_reports")
      .aggregate([
        { $match: { _id: reportId } },
        { $limit: 1 },
        {
          $project: {
            _id: 1,
            reporter_id: 1,
            incident_type: 1,
            location: 1,
            occurrence_time: 1,
            description: 1,
            evidence_url: 1,
            created_at: 1,
            status: 1,
          },
        },
        reporterDetailLookupStage,
        reporterNameStage,
        {
          $project: {
            _id: 1,
            incident_type: 1,
            location: 1,
            occurrence_time: 1,
            description: 1,
            evidence_url: 1,
            created_at: 1,
            status: 1,
            reporter_fullname: 1,
            reporter_email: 1,
            reporter_role: 1,
          },
        },
      ], { allowDiskUse: false })
      .toArray();

    if (!report) {
      return NextResponse.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("ADMIN_REPORT_DETAIL_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
