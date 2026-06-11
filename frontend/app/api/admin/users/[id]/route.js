import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";

export async function GET(_request, { params }) {
  try {
    const userId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : null;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ID user tidak valid" },
        { status: 400 },
      );
    }

    const db = (await connectDB()).db();
    const [user] = await db
      .collection("users")
      .aggregate([
        { $match: { _id: userId } },
        { $limit: 1 },
        {
          $addFields: {
            converted_institution_id: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ["$institution_id", ""] },
                    { $ne: ["$institution_id", null] },
                    { $eq: [{ $strLenCP: { $ifNull: ["$institution_id", ""] } }, 24] },
                  ],
                },
                then: { $toObjectId: "$institution_id" },
                else: null,
              },
            },
          },
        },
        {
          $lookup: {
            from: "schools",
            localField: "converted_institution_id",
            foreignField: "_id",
            pipeline: [{ $project: { _id: 0, name: 1 } }],
            as: "school_data",
          },
        },
        {
          $project: {
            _id: 1,
            fullname: 1,
            role: 1,
            email: 1,
            is_verified: 1,
            createdAt: 1,
            school_id: 1,
            institution_id: 1,
            institution_name: 1,
            school_name: { $arrayElemAt: ["$school_data.name", 0] },
          },
        },
      ], { allowDiskUse: false })
      .toArray();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("ADMIN_USER_DETAIL_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { hash } from "bcryptjs";

export async function PATCH(request, { params }) {
  try {
    const userId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : null;
    if (!userId) {
      return NextResponse.json({ success: false, message: "ID user tidak valid" }, { status: 400 });
    }

    const { action, school_id, password, email, fullname, role } = await request.json();
    const db = (await connectDB()).db();

    if (action === "update_fullname") {
      if (!fullname) return NextResponse.json({ success: false, message: "Nama diperlukan" }, { status: 400 });
      await db.collection("users").updateOne({ _id: userId }, { $set: { fullname } });
      return NextResponse.json({ success: true, message: "Nama berhasil diperbarui" });
    }

    if (action === "update_role") {
      if (!role) return NextResponse.json({ success: false, message: "Role diperlukan" }, { status: 400 });
      await db.collection("users").updateOne({ _id: userId }, { $set: { role } });
      return NextResponse.json({ success: true, message: "Role berhasil diperbarui" });
    }

    if (action === "update_email") {
      if (!email) {
        return NextResponse.json({ success: false, message: "Email diperlukan" }, { status: 400 });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ success: false, message: "Format email tidak valid" }, { status: 400 });
      }

      await db.collection("users").updateOne(
        { _id: userId },
        { $set: { email } }
      );
      
      return NextResponse.json({ success: true, message: "Email berhasil diperbarui" });
    }

    if (action === "update_school") {
      if (!school_id) {
        return NextResponse.json({ success: false, message: "School ID diperlukan" }, { status: 400 });
      }
      
      const schoolObjectId = ObjectId.isValid(school_id) ? new ObjectId(school_id) : school_id;
      
      await db.collection("users").updateOne(
        { _id: userId },
        { $set: { school_id: schoolObjectId, institution_id: school_id } }
      );
      
      return NextResponse.json({ success: true, message: "Sekolah berhasil diperbarui" });
    }
    
    if (action === "reset_password") {
      if (!password) {
        return NextResponse.json({ success: false, message: "Password diperlukan" }, { status: 400 });
      }
      
      const hashedPassword = await hash(password, 10);
      await db.collection("users").updateOne(
        { _id: userId },
        { $set: { password: hashedPassword } }
      );
      
      return NextResponse.json({ success: true, message: "Password berhasil di-reset" });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("ADMIN_USER_UPDATE_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
