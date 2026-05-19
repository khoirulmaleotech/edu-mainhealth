import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { ObjectId } from 'mongodb';
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'psychologist') {
      return NextResponse.json(
        { message: "Not authorized" },
        { status: 401 }
      );
    }

    const client = await connectDB();
    const db = client.db();

    const userId = session.user.id;

    const queryId = ObjectId.isValid(userId)
      ? new ObjectId(userId)
      : userId;

    const user = await db.collection('users').findOne(
      { _id: queryId },
      {
        projection: {
          password: 0,
          availability: 0
        }
      }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("GET_PROFILE_ERROR:", error);

    return NextResponse.json(
      {
        message: "Server error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'psychologist') {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      fullname,
      work_at,
      sipp,
      is_online
    } = body;

    const client = await connectDB();
    const db = client.db();

    const updateData = {
      updatedAt: new Date()
    };

    if (fullname?.trim()) {
      updateData.fullname = fullname.trim();
    }

    if (work_at?.trim()) {
      updateData.work_at = work_at.trim();
    }

    if (sipp?.trim()) {
      updateData.sipp = sipp.trim();
    }

    if (typeof is_online === "boolean") {
      updateData.is_online = is_online;
    }

    const userId = session.user.id;

    const queryId = ObjectId.isValid(userId)
      ? new ObjectId(userId)
      : userId;

    const result = await db.collection('users').updateOne(
      { _id: queryId },
      {
        $set: updateData
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const updatedUser = await db.collection('users').findOne(
      { _id: queryId },
      {
        projection: {
          password: 0,
          availability: 0
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: updatedUser
    });

  } catch (error) {
    console.error("UPDATE_PROFILE_ERROR:", error);

    return NextResponse.json(
      {
        message: "Update failed"
      },
      { status: 500 }
    );
  }
}