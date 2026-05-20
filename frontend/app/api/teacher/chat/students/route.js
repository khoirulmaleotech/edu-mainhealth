import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function getPositiveInteger(value, fallback, max) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function getEscapedRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTeacherRoomMatch(teacherId) {
  const match = {
    type: "teacher",
    $or: [
      { teacher_id: teacherId },
      { participants: { $in: [teacherId] } },
    ],
  };

  if (ObjectId.isValid(teacherId)) {
    match.$or.push({ teacher_id: new ObjectId(teacherId) });
    match.$or.push({ participants: { $in: [new ObjectId(teacherId)] } });
  }

  return match;
}

function buildStudentsPipeline({ teacherId, currentPage, pageSize, search }) {
  const skipData = (currentPage - 1) * pageSize;
  const normalizedSearch = search.trim();

  const pipeline = [
    { $match: buildTeacherRoomMatch(teacherId) },
    {
      $addFields: {
        studentObjectId: {
          $convert: {
            input: "$student_id",
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
        localField: "studentObjectId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
  ];

  if (normalizedSearch) {
    const searchRegex = getEscapedRegex(normalizedSearch);
    pipeline.push({
      $match: {
        $or: [
          { "student.fullname": { $regex: searchRegex, $options: "i" } },
          { "student.email": { $regex: searchRegex, $options: "i" } },
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
            from: "classes",
            let: { classId: "$student.class_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$_id", { $toObjectId: { $ifNull: ["$$classId", "000000000000000000000000"] } }] },
                      { $eq: [{ $toString: "$_id" }, "$$classId"] },
                    ],
                  },
                },
              },
              { $project: { name: 1 } },
              { $limit: 1 },
            ],
            as: "classInfo",
          },
        },
        {
          $project: {
            _id: 1,
            roomId: "$_id",
            studentId: "$studentObjectId",
            fullname: { $ifNull: ["$student.fullname", "Siswa Anonim"] },
            email: { $ifNull: ["$student.email", "-"] },
            className: { $ifNull: [{ $arrayElemAt: ["$classInfo.name", 0] }, "-"] },
            lastMsg: { $ifNull: ["$lastMsg", "Belum ada pesan"] },
            updatedAt: { $ifNull: ["$updatedAt", "$createdAt"] },
            unread: { $ifNull: ["$unread", 0] },
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

    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 }
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
        buildStudentsPipeline({
          teacherId: session.user.id,
          currentPage,
          pageSize,
          search,
        }),
        { allowDiskUse: false }
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
    console.error("TEACHER_STUDENTS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat daftar siswa" },
      { status: 500 }
    );
  }
}