import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export const dynamic = 'force-dynamic';

const uri = process.env.MONGODB_URI;

export async function GET() {
  const client = new MongoClient(uri);
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "school_admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    await client.connect();
    const db = client.db();

    // Lookup sekolah berdasarkan admin_id (school_id tidak disimpan di session)
    const school = await db.collection("schools").findOne(
      { admin_id: new ObjectId(session.user.id) },
      {
        projection: {
          _id: 1,
          name: 1,
          is_verified: 1,
          // Tidak perlu field berat seperti address, phone, dll.
        },
      },
    );

    if (!school) {
      return NextResponse.json(
        { success: false, message: "Sekolah tidak ditemukan untuk akun ini" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      school: {
        id: school._id.toString(),
        name: school.name,
        is_verified: school.is_verified ?? false,
      },
    });
  } catch (error) {
    console.error("SCHOOL_INFO_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}