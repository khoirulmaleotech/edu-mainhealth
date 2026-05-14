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
    const status = searchParams.get("status") || "all";
    const skipData = (currentPage - 1) * pageSize;

    const statusMatch =
      status === "verified"
        ? { is_verified: true }
        : status === "pending"
          ? { is_verified: { $ne: true } }
          : {};

    const pipeline = [{ $match: statusMatch }];

    if (search) {
      const searchRegex = getEscapedRegex(search);
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "admin_id",
            foreignField: "_id",
            pipeline: [{ $project: { _id: 0, email: 1, fullname: 1 } }],
            as: "admin_info",
          },
        },
        {
          $set: {
            admin_email: { $arrayElemAt: ["$admin_info.email", 0] },
            admin_name: { $arrayElemAt: ["$admin_info.fullname", 0] },
          },
        },
        {
          $match: {
            $or: [
              { name: { $regex: searchRegex, $options: "i" } },
              { address: { $regex: searchRegex, $options: "i" } },
              { admin_email: { $regex: searchRegex, $options: "i" } },
              { admin_name: { $regex: searchRegex, $options: "i" } },
            ],
          },
        },
      );
    }

    pipeline.push({
      $facet: {
        data: [
          { $sort: { createdAt: -1, _id: -1 } },
          { $skip: skipData },
          { $limit: pageSize },
          {
            $lookup: {
              from: "users",
              localField: "admin_id",
              foreignField: "_id",
              pipeline: [{ $project: { _id: 0, email: 1 } }],
              as: "admin_info",
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              address_preview: { $substrCP: [{ $ifNull: ["$address", ""] }, 0, 45] },
              is_verified: 1,
              admin_email: { $arrayElemAt: ["$admin_info.email", 0] },
            },
          },
        ],
        totalData: [{ $count: "count" }],
      },
    });

    const [payload = { data: [], totalData: [] }] = await db
      .collection("schools")
      .aggregate(pipeline, { allowDiskUse: false })
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
    console.error("ADMIN_SCHOOLS_ERROR:", error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, action } = await request.json();
    const schoolId = ObjectId.isValid(id) ? new ObjectId(id) : null;

    if (!schoolId || !action) {
      return NextResponse.json({ message: "ID dan Action wajib diisi" }, { status: 400 });
    }

    const db = (await connectDB()).db();

    if (action === "approve") {
      await db.collection("schools").updateOne(
        { _id: schoolId },
        { $set: { is_verified: true, updatedAt: new Date() } },
      );

      const school = await db.collection("schools").findOne(
        { _id: schoolId },
        { projection: { admin_id: 1 } },
      );

      if (school?.admin_id) {
        const adminId = ObjectId.isValid(school.admin_id)
          ? new ObjectId(school.admin_id)
          : school.admin_id;

        await db.collection("users").updateOne(
          { _id: adminId },
          { $set: { is_verified: true } },
        );
      }

      return NextResponse.json({ success: true, message: "Sekolah & Admin berhasil diaktifkan" });
    }

    if (action === "reject") {
      const school = await db.collection("schools").findOne(
        { _id: schoolId },
        { projection: { admin_id: 1 } },
      );

      if (school?.admin_id) {
        const adminId = ObjectId.isValid(school.admin_id)
          ? new ObjectId(school.admin_id)
          : school.admin_id;

        await db.collection("users").deleteOne({ _id: adminId });
      }

      await db.collection("schools").deleteOne({ _id: schoolId });

      return NextResponse.json({ success: true, message: "Pendaftaran dihapus permanen" });
    }

    return NextResponse.json({ message: "Action tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("PATCH_SCHOOL_ERR:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
