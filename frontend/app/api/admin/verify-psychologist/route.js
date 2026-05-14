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

    const matchFilter = {
      role: "psychologist",
      ...(status === "verified"
        ? { is_verified: true }
        : status === "pending"
          ? { is_verified: { $ne: true } }
          : {}),
    };

    if (search) {
      const searchRegex = getEscapedRegex(search);
      matchFilter.$or = [
        { fullname: { $regex: searchRegex, $options: "i" } },
        { email: { $regex: searchRegex, $options: "i" } },
        { institution_name: { $regex: searchRegex, $options: "i" } },
      ];
    }

    const [payload = { data: [], totalData: [] }] = await db
      .collection("users")
      .aggregate([
        { $match: matchFilter },
        {
          $facet: {
            data: [
              { $sort: { is_verified: 1, createdAt: -1, _id: -1 } },
              { $skip: skipData },
              { $limit: pageSize },
              {
                $project: {
                  _id: 1,
                  fullname: 1,
                  email: 1,
                  is_verified: 1,
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
    console.error("ADMIN_VERIFY_PSYCHOLOGIST_ERROR:", error);
    return NextResponse.json({ message: "Gagal mengambil data psikolog" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, action } = await request.json();
    const psychologistId = ObjectId.isValid(id) ? new ObjectId(id) : null;

    if (!psychologistId || !action) {
      return NextResponse.json({ message: "ID dan action diperlukan" }, { status: 400 });
    }

    const db = (await connectDB()).db();

    if (action === "approve") {
      await db.collection("users").updateOne(
        { _id: psychologistId, role: "psychologist" },
        { $set: { is_verified: true, updatedAt: new Date() } },
      );
      return NextResponse.json({ success: true, message: "Akun Psikolog diaktifkan!" });
    }

    if (action === "reject") {
      await db.collection("users").deleteOne({ _id: psychologistId, role: "psychologist" });
      return NextResponse.json({ success: true, message: "Pendaftaran Psikolog dihapus" });
    }

    return NextResponse.json({ message: "Action tidak valid" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal memproses verifikasi" }, { status: 500 });
  }
}
