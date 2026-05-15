import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongodb";

function buildPsychologistRoomMatch(psychologistId) {
  const match = {
    $or: [
      { psychologist_id: psychologistId },
      { participants: { $in: [psychologistId] } },
    ],
  };

  if (ObjectId.isValid(psychologistId)) {
    match.$or.push({ psychologist_id: new ObjectId(psychologistId) });
    match.$or.push({ participants: { $in: [new ObjectId(psychologistId)] } });
  }

  return match;
}

function getPositiveInteger(value, fallback, max) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, max);
}

function getExactCaseInsensitiveRegex(value) {
  return new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "psychologist") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    if (!ObjectId.isValid(params.studentId)) {
      return NextResponse.json(
        { success: false, message: "Student ID tidak valid" },
        { status: 400 },
      );
    }

    const db = (await connectDB()).db();
    const { searchParams } = new URL(request.url);
    const studentObjectId = new ObjectId(params.studentId);
    const studentId = params.studentId;
    const currentPage = getPositiveInteger(searchParams.get("page"), 1, 100000);
    const pageSize = 1;
    const skipData = (currentPage - 1) * pageSize;
    const severity = searchParams.get("severity") || "all";
    const status = searchParams.get("status") || "all";

    const room = await db.collection("chat_rooms").findOne(
      {
        $and: [
          buildPsychologistRoomMatch(session.user.id),
          {
            $or: [
              { patient_id: studentObjectId },
              { patient_id: studentId },
              { participants: { $in: [studentObjectId, studentId] } },
            ],
          },
        ],
      },
      { projection: { _id: 1 } },
    );

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Pasien tidak terhubung dengan psikolog ini" },
        { status: 404 },
      );
    }

    const logFilter = { student_id: studentObjectId };

    if (severity !== "all") {
      logFilter.severity = getExactCaseInsensitiveRegex(severity);
    }

    if (status !== "all") {
      logFilter.status = getExactCaseInsensitiveRegex(status);
    }

    const [student, logPayloadResult] = await Promise.all([
      db.collection("users").findOne(
        { _id: studentObjectId },
        { projection: { _id: 1, fullname: 1, email: 1 } },
      ),
      db
        .collection("critical_chat_logs")
        .aggregate([
          { $match: logFilter },
          {
            $facet: {
              data: [
                { $sort: { createdAt: -1, _id: -1 } },
                { $skip: skipData },
                { $limit: pageSize },
                {
                  $project: {
                    _id: 1,
                    conversation: 1,
                    critical_message: 1,
                    is_critical: 1,
                    severity: 1,
                    risk_types: 1,
                    risk_reason: 1,
                    detected_language: 1,
                    source: 1,
                    status: 1,
                    reviewed_at: 1,
                    teacher_note: 1,
                    createdAt: 1,
                    updatedAt: 1,
                  },
                },
              ],
              totalData: [{ $count: "count" }],
            },
          },
        ])
        .toArray(),
    ]);

    const payload = logPayloadResult?.[0] || { data: [], totalData: [] };
    const totalData = payload.totalData?.[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: {
        student: {
          _id: student?._id || studentObjectId,
          fullname: student?.fullname || "Pasien Anonim",
          email: student?.email || "-",
        },
        sessions: payload.data || [],
        filters: {
          severity,
          status,
        },
        pagination: {
          currentPage,
          pageSize,
          totalData,
          totalPages: Math.ceil(totalData / pageSize),
          hasNextPage: totalData > currentPage * pageSize,
          hasPreviousPage: currentPage > 1,
        },
      },
    });
  } catch (error) {
    console.error("PSYCHOLOGIST_PATIENT_CRITICAL_LOGS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat riwayat percakapan AI" },
      { status: 500 },
    );
  }
}
