import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";

function getPositiveInteger(value, fallback, max) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, max);
}

function getEscapedRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  try {
    const db = (await connectDB()).db();
    const { searchParams } = new URL(request.url);
    const currentPage = getPositiveInteger(searchParams.get("page"), 1, 100000);
    const pageSize = getPositiveInteger(searchParams.get("pageSize"), 20, 100);
    const search = (searchParams.get("search") || "").trim();
    const role = searchParams.get("role") || "all";
    const school = searchParams.get("school") || "all";
    const skipData = (currentPage - 1) * pageSize;
    const matchFilter = {
      role: role && role !== "all" ? role : { $ne: "admin" },
    };

    if (school && school !== "all") {
      const schoolObjId = ObjectId.isValid(school) ? new ObjectId(school) : school;
      matchFilter.$or = [
        { school_id: schoolObjId },
        { school_id: school },
        { institution_id: schoolObjId },
        { institution_id: school }
      ];
    }

    if (search) {
      const searchRegex = getEscapedRegex(search);
      const searchOr = [
        { fullname: { $regex: searchRegex, $options: "i" } },
        { email: { $regex: searchRegex, $options: "i" } },
        { role: { $regex: searchRegex, $options: "i" } },
      ];
      
      if (matchFilter.$or) {
        matchFilter.$and = [{ $or: matchFilter.$or }, { $or: searchOr }];
        delete matchFilter.$or;
      } else {
        matchFilter.$or = searchOr;
      }
    }

    const [payload = { data: [], totalData: [] }] = await db
      .collection("users")
      .aggregate([
        { $match: matchFilter },
        {
          $facet: {
            data: [
              { $sort: { createdAt: -1, _id: -1 } },
              { $skip: skipData },
              { $limit: pageSize },
              {
                $addFields: {
                  converted_school_id: {
                    $convert: {
                      input: { $ifNull: ["$school_id", "$institution_id"] },
                      to: "objectId",
                      onError: null,
                      onNull: null
                    }
                  }
                }
              },
              {
                $lookup: {
                  from: "schools",
                  localField: "converted_school_id",
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
                  school_name: { 
                    $ifNull: [
                      { $arrayElemAt: ["$school_data.name", 0] }, 
                      { $ifNull: ["$school_name", "$institution_name"] }
                    ] 
                  },
                },
              },
            ],
            totalData: [{ $count: "count" }],
          },
        },
      ], { allowDiskUse: false })
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
    console.error("ADMIN_USERS_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, action } = await request.json();
    const userId = ObjectId.isValid(id) ? new ObjectId(id) : null;

    if (!userId || !action) {
      return NextResponse.json({ message: "ID dan action diperlukan" }, { status: 400 });
    }

    const db = (await connectDB()).db();

    if (action === "delete") {
      await db.collection("users").deleteOne({ _id: userId });
      return NextResponse.json({ success: true, message: "User berhasil dihapus" });
    }

    if (action === "toggle_status") {
      await db.collection("users").updateOne(
        { _id: userId },
        [
          {
            $set: {
              is_active: { $not: ["$is_active"] },
              updatedAt: "$$NOW",
            },
          },
        ],
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "Action tidak valid" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal memproses perubahan" }, { status: 500 });
  }
}
