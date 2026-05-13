
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export const dynamic = 'force-dynamic';

const client = new MongoClient(process.env.MONGODB_URI);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "student") {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    await client.connect();
    const db = client.db();

    // Ambil semua link pending untuk siswa ini, di-join dengan data user orang tua
    const pendingLinks = await db
      .collection("family_links")
      .aggregate([
        {
          $match: {
            student_id: new ObjectId(session.user.id),
            status: "pending",
          },
        },
        {
          // Join ke users untuk ambil nama & email orang tua
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
            requested_at: 1,
          },
        },
        { $sort: { requested_at: -1 } },
      ])
      .toArray();

    return NextResponse.json({ success: true, requests: pendingLinks });
  } catch (error) {
    console.error("FAMILY_PENDING_ERROR:", error);
    return NextResponse.json({ message: "Terjadi kesalahan." }, { status: 500 });
  }
}

