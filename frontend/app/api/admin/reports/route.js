import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const uri = process.env.MONGODB_URI;
const allowedAdminRoles = ["admin", "superadmin", "school_admin"];

export async function GET() {
  const client = new MongoClient(uri);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !allowedAdminRoles.includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    await client.connect();
    const db = client.db();

    const reports = await db
      .collection("incident_reports")
      .aggregate([
        { $sort: { created_at: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "reporter_id",
            foreignField: "_id",
            as: "reporter",
          },
        },
        { $unwind: { path: "$reporter", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            incident_type: 1,
            location: 1,
            occurrence_time: 1,
            description: 1,
            evidence_url: 1,
            created_at: 1,
            reporter: {
              fullname: "$reporter.fullname",
              role: "$reporter.role",
              email: "$reporter.email",
            },
            status: 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("ADMIN_REPORTS_ERROR:", error);
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !allowedAdminRoles.includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "ID dan status diperlukan" },
        { status: 400 },
      );
    }

    await client.connect();
    const db = client.db();
    await db
      .collection("incident_reports")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updated_at: new Date() } },
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_REPORT_UPDATE_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

export async function DELETE(request) {
  const client = new MongoClient(uri);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !allowedAdminRoles.includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID diperlukan" },
        { status: 400 },
      );
    }

    await client.connect();
    const db = client.db();
    await db
      .collection("incident_reports")
      .deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_REPORT_DELETE_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}