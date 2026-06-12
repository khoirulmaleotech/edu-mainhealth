import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await connectDB();
    const db = client.db("edumind");

    const responses = await db.collection("wellbeing_camp_responses")
      .find({
        assessment_type: "pre_test",
        "part_A.biggest_teen_challenge": { $exists: true, $ne: "" },
        "part_A.biggest_teen_challenge": { $ne: null }
      })
      .sort({ createdAt: -1 })
      .project({
        _id: 1,
        challenge: "$part_A.biggest_teen_challenge",
        school: "$metadata.school_name"
      })
      .toArray();

    return NextResponse.json({ success: true, data: responses });
  } catch (error) {
    console.error("GET Mentimeter Load Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
