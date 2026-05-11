
// ─────────────────────────────────────────────────────────────────────────────
// FILE 2: /api/family/active/route.js
// GET — Ambil semua orang tua yang AKTIF terhubung ke siswa login
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const client = new MongoClient(process.env.MONGODB_URI);

export async function GET_ACTIVE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "student") {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    await client.connect();
    const db = client.db();

    const activeParents = await db
      .collection("family_links")
      .aggregate([
        {
          $match: {
            student_id: new ObjectId(session.user.id),
            status: "active",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "parent_id",
            foreignField: "_id",
            as: "parent_info",
          },
        },
        { $unwind: { path: "$parent_info", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: { $toString: "$_id" },
            parent_id: { $toString: "$parent_id" },
            parent_email: 1,
            parent_name: "$parent_info.fullname",
            responded_at: 1,
          },
        },
        { $sort: { responded_at: -1 } },
      ])
      .toArray();

    return NextResponse.json({ success: true, parents: activeParents });
  } catch (error) {
    console.error("FAMILY_ACTIVE_ERROR:", error);
    return NextResponse.json({ message: "Terjadi kesalahan." }, { status: 500 });
  }
}

