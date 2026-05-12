import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const uri = process.env.MONGODB_URI;

async function getSchoolAdminSchool(db) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "school_admin") {
    return { error: "Akses ditolak", status: 403 };
  }

  const school = await db.collection("schools").findOne({
    admin_id: new ObjectId(session.user.id),
  });

  if (!school) {
    return { error: "Sekolah tidak ditemukan", status: 404 };
  }

  return { school };
}

export async function GET() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    const { error, status, school } = await getSchoolAdminSchool(db);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    return NextResponse.json({
      success: true,
      school: {
        ...school,
        _id: school._id.toString(),
        admin_id: school.admin_id?.toString(),
        createdAt: school.createdAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("SCHOOL_ADMIN_PROFILE_GET_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

export async function PATCH(request) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    const { error, status, school } = await getSchoolAdminSchool(db);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const body = await request.json();
    const { name, address, phone, website } = body;

    const updateData = { updatedAt: new Date() };

    if (typeof name === "string") updateData.name = name.trim();
    if (typeof address === "string") updateData.address = address.trim();
    if (typeof phone === "string") updateData.phone = phone.trim();
    if (typeof website === "string") updateData.website = website.trim();

    await db
      .collection("schools")
      .updateOne({ _id: new ObjectId(school._id) }, { $set: updateData });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SCHOOL_ADMIN_PROFILE_PATCH_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
