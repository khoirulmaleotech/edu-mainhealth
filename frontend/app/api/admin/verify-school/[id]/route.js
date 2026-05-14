import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";

export async function GET(_request, { params }) {
  try {
    const schoolId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : null;

    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: "ID sekolah tidak valid" },
        { status: 400 },
      );
    }

    const db = (await connectDB()).db();
    const [school] = await db
      .collection("schools")
      .aggregate([
        { $match: { _id: schoolId } },
        { $limit: 1 },
        {
          $lookup: {
            from: "users",
            localField: "admin_id",
            foreignField: "_id",
            pipeline: [{ $project: { _id: 0, fullname: 1, email: 1 } }],
            as: "admin_info",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            address: 1,
            phone: 1,
            website: 1,
            is_verified: 1,
            createdAt: 1,
            admin_name: { $arrayElemAt: ["$admin_info.fullname", 0] },
            admin_email: { $arrayElemAt: ["$admin_info.email", 0] },
          },
        },
      ], { allowDiskUse: false })
      .toArray();

    if (!school) {
      return NextResponse.json(
        { success: false, message: "Sekolah tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: school });
  } catch (error) {
    console.error("ADMIN_SCHOOL_DETAIL_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
