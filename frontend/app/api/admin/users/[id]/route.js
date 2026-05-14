import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";

export async function GET(_request, { params }) {
  try {
    const userId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : null;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ID user tidak valid" },
        { status: 400 },
      );
    }

    const db = (await connectDB()).db();
    const [user] = await db
      .collection("users")
      .aggregate([
        { $match: { _id: userId } },
        { $limit: 1 },
        {
          $addFields: {
            converted_institution_id: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ["$institution_id", ""] },
                    { $ne: ["$institution_id", null] },
                    { $eq: [{ $strLenCP: { $ifNull: ["$institution_id", ""] } }, 24] },
                  ],
                },
                then: { $toObjectId: "$institution_id" },
                else: null,
              },
            },
          },
        },
        {
          $lookup: {
            from: "schools",
            localField: "converted_institution_id",
            foreignField: "_id",
            pipeline: [{ $project: { _id: 0, name: 1 } }],
            as: "school_data",
          },
        },
        {
          $project: {
            _id: 1,
            fullname: 1,
            role: 1,
            email: 1,
            is_verified: 1,
            createdAt: 1,
            institution_name: 1,
            school_name: { $arrayElemAt: ["$school_data.name", 0] },
          },
        },
      ], { allowDiskUse: false })
      .toArray();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("ADMIN_USER_DETAIL_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
