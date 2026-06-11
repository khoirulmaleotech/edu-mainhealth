import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = (await connectDB()).db();
    const schools = await db
      .collection("schools")
      .find({})
      .project({ _id: 1, name: 1 })
      .toArray();

    return NextResponse.json({ success: true, data: schools });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
