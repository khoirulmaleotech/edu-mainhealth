import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI missing");
}

export async function GET() {
  let client;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();

    const link = await db.collection("family_links").findOne({
      parent_email: session.user.email,
      status: "active",
    });

    if (!link) {
      return NextResponse.json({
        success: true,
        student: null,
        talents: [],
      });
    }

    const studentObjectId = new ObjectId(link.student_id);

    // =========================
    // STUDENT
    // =========================
    const student = await db.collection("users").findOne({
      _id: studentObjectId,
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const talentDoc = await db.collection("student_talents").findOne({
      student_id: studentObjectId,
    });

    const talents = (talentDoc?.scores || []).map((item) => ({
      label: item.subject,
      value: Number(item.value || 0),
      color: item.color || "bg-primary",
      description: "Hasil asesmen AI",
    }));

    return NextResponse.json({
      success: true,
      student: {
        id: student._id.toString(),
        fullname: student.fullname,
        class_name: student.class_name,
        avatar: student.avatar || null,
      },
      talents,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        debug: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}