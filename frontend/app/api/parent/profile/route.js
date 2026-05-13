import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MongoClient, ObjectId } from "mongodb";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI belum tersedia di environment");
}

export async function GET() {
  let client;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    client = new MongoClient(uri);

    await client.connect();

    const db = client.db();

    const parent = await db.collection("users").findOne({
      email: session.user.email,
    });

    if (!parent) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const familyLink = await db.collection("family_links").findOne({
      parent_email: session.user.email,
      status: "active",
    });

    let student = null;

    if (familyLink?.student_id) {
      student = await db.collection("users").findOne({
        _id: new ObjectId(familyLink.student_id),
      });
    }

    let school = null;

    if (student?.school_id) {
      school = await db.collection("schools").findOne({
        _id: new ObjectId(student.school_id),
      });
    }

    return NextResponse.json({
      success: true,

      profile: {
        id: parent._id,
        fullname: parent.fullname || "",
        email: parent.email || "",
        phone: parent.phone || "",
        avatar: parent.avatar || "",

        role: parent.role || "PARENT",

        createdAt: parent.createdAt || null,
      },

      student: student
        ? {
            id: student._id,
            fullname: student.fullname || "",
            class_name: student.class_name || "",
            nisn: student.nisn || "",
            avatar: student.avatar || "",
            school_name: school?.name || "",
          }
        : null,
    });
  } catch (error) {
    console.error("GET PARENT PROFILE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil profile orang tua",
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

/*
|--------------------------------------------------------------------------
| UPDATE PARENT PROFILE
|--------------------------------------------------------------------------
*/
export async function PATCH(request) {
  let client;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      fullname,
      phone,
      avatar,
    } = body;

    // =====================================
    // CONNECT DATABASE
    // =====================================
    client = new MongoClient(uri);

    await client.connect();

    const db = client.db();

    // =====================================
    // FIND PARENT
    // =====================================
    const parent = await db.collection("users").findOne({
      email: session.user.email,
    });

    if (!parent) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =====================================
    // UPDATE PROFILE
    // =====================================
    await db.collection("users").updateOne(
      {
        _id: new ObjectId(parent._id),
      },
      {
        $set: {
          fullname: fullname || parent.fullname,
          phone: phone || parent.phone,
          avatar: avatar || parent.avatar,

          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Profile berhasil diperbarui",
    });
  } catch (error) {
    console.error("UPDATE PARENT PROFILE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui profile",
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