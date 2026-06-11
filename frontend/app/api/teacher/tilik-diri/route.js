import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const search = searchParams.get("search") || "";
    const isExport = searchParams.get("export") === "true";

    const client = await connectDB();
    const db = client.db("edumind");

    // Dapatkan data guru untuk mengetahui school_id-nya
    const teacherId = new ObjectId(session.user.id);
    const teacherUser = await db.collection("users").findOne({ _id: teacherId });
    if (!teacherUser || !teacherUser.school_id) {
      return NextResponse.json({ success: false, message: "Guru tidak terdaftar di sekolah manapun" }, { status: 400 });
    }

    const schoolId = teacherUser.school_id;

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "_id",
          as: "student_data",
        },
      },
      {
        $unwind: { path: "$student_data", preserveNullAndEmptyArrays: false }
      },
      {
        $match: {
          "student_data.school_id": schoolId
        }
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
          student_class: "$student_data.kelas",
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
            { student_class: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    const totalPipeline = [...pipeline, { $count: "count" }];
    const totalResult = await db.collection("student_tilik_diri").aggregate(totalPipeline).toArray();
    const totalData = totalResult.length > 0 ? totalResult[0].count : 0;

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
      pagination: {
        currentPage: page,
        pageSize,
        totalData,
        totalPages: Math.ceil(totalData / pageSize),
      },
    });
  } catch (error) {
    console.error("GET Teacher Tilik Diri Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem" },
      { status: 500 }
    );
  }
}
