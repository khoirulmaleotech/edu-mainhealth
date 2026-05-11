
// ─────────────────────────────────────────────────────────────────────────────
// FILE 3: /api/family/respond/route.js  (sudah ada, ini versi lengkap)
// PATCH — Siswa approve atau reject permintaan koneksi
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const client = new MongoClient(process.env.MONGODB_URI);

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "student") {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    const { link_id, action } = await request.json();

    if (!link_id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });
    }

    await client.connect();
    const db = client.db();

    // Verifikasi link ini benar-benar milik siswa yang login
    const link = await db.collection("family_links").findOne({
      _id: new ObjectId(link_id),
      student_id: new ObjectId(session.user.id),
      status: "pending",
    });

    if (!link) {
      return NextResponse.json(
        { message: "Permintaan tidak ditemukan atau sudah diproses." },
        { status: 404 }
      );
    }

    const newStatus = action === "approve" ? "active" : "rejected";

    await db.collection("family_links").updateOne(
      { _id: link._id },
      {
        $set: {
          status: newStatus,
          responded_at: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Jika approved, bisa trigger notifikasi ke orang tua di sini
    // if (action === "approve") await notifyParent(link.parent_id);

    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? "Orang tua berhasil dihubungkan ke akun Anda."
          : "Permintaan koneksi telah ditolak.",
    });
  } catch (error) {
    console.error("FAMILY_RESPOND_ERROR:", error);
    return NextResponse.json({ message: "Terjadi kesalahan." }, { status: 500 });
  }
}