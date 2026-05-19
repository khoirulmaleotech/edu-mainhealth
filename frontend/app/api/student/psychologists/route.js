import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await connectDB();
    const db = client.db();

    const psychologists = await db
      .collection('users')
      .find({
        role: 'psychologist'
      })
      .project({
        password: 0
      })
      .sort({
        is_online: -1,
        fullname: 1
      })
      .toArray();

    return NextResponse.json({
      success: true,
      data: psychologists
    });

  } catch (error) {
    console.error("PSYCHOLOGIST_LIST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        data: []
      },
      { status: 500 }
    );
  }
}