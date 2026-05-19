import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

function getPositiveInteger(value, fallback, max) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, max);
}

function getEscapedRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

function buildPatientsPipeline({ psychologistId, currentPage, pageSize, search }) {
  const skipData = (currentPage - 1) * pageSize;
  const normalizedSearch = search.trim();
  const pipeline = [
    { $match: buildPsychologistRoomMatch(psychologistId) },
    {
      $addFields: {
        patientObjectId: {
          $convert: {
            input: "$patient_id",
            to: "objectId",
            onError: null,
            onNull: null,
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "patientObjectId",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
  ];

  if (normalizedSearch) {
    const searchRegex = getEscapedRegex(normalizedSearch);
    pipeline.push({
      $match: {
        $or: [
          { "patient.fullname": { $regex: searchRegex, $options: "i" } },
          { "patient.email": { $regex: searchRegex, $options: "i" } },
          { lastMsg: { $regex: searchRegex, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({
    $facet: {
      data: [
        { $sort: { updatedAt: -1, createdAt: -1, _id: -1 } },
        { $skip: skipData },
        { $limit: pageSize },
        {
          $lookup: {
            from: "critical_chat_logs",
            let: { studentId: "$patientObjectId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$student_id", "$$studentId"] } } },
              { $sort: { createdAt: -1, _id: -1 } },
              {
                $project: {
                  _id: 1,
                  severity: 1,
                  status: 1,
                  is_critical: 1,
                  createdAt: 1,
                },
              },
              { $limit: 1 },
            ],
            as: "criticalHistory",
          },
        },
        {
          $project: {
            _id: 1,
            roomId: "$_id",
            studentId: "$patientObjectId",
            fullname: { $ifNull: ["$patient.fullname", "Pasien Anonim"] },
            email: { $ifNull: ["$patient.email", "-"] },
            lastMsg: { $ifNull: ["$lastMsg", "Belum ada pesan"] },
            updatedAt: { $ifNull: ["$updatedAt", "$createdAt"] },
            risk: { $ifNull: ["$risk", "Medium"] },
            unread: { $ifNull: ["$unread", 0] },
            hasCriticalHistory: { $gt: [{ $size: "$criticalHistory" }, 0] },
            criticalSeverity: {
              $ifNull: [{ $arrayElemAt: ["$criticalHistory.severity", 0] }, null],
            },
            criticalStatus: {
              $ifNull: [{ $arrayElemAt: ["$criticalHistory.status", 0] }, null],
            },
          },
        },
      ],
      totalData: [{ $count: "count" }],
    },
  });

  return pipeline;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "psychologist") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const db = (await connectDB()).db();
    const { searchParams } = new URL(request.url);
    const currentPage = getPositiveInteger(searchParams.get("page"), 1, 100000);
    const pageSize = getPositiveInteger(searchParams.get("pageSize"), 10, 100);
    const search = searchParams.get("search") || "";

    const [payload = { data: [], totalData: [] }] = await db
      .collection("chat_rooms")
      .aggregate(
        buildPatientsPipeline({
          psychologistId: session.user.id,
          currentPage,
          pageSize,
          search,
        }),
        { allowDiskUse: false },
      )
      .toArray();

    const totalData = payload.totalData?.[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: payload.data || [],
      pagination: {
        currentPage,
        pageSize,
        totalData,
        totalPages: Math.ceil(totalData / pageSize),
        hasNextPage: totalData > currentPage * pageSize,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("PSYCHOLOGIST_PATIENTS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat daftar pasien" },
      { status: 500 },
    );
  }
}
