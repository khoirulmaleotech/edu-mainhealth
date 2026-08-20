import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await connectDB();
    const db = client.db();
    
    const config = await db.collection("configs").findOne({ key: "kuisoner_test_type" });
    const testType = config ? config.value : "post_test"; // Default to post_test
    
    return NextResponse.json({ success: true, testType });
  } catch (error) {
    console.error("GET_KUISONER_SETTINGS_ERR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { testType } = body;
    
    if (testType !== "pre_test" && testType !== "post_test") {
      return NextResponse.json({ success: false, message: "Invalid test type" }, { status: 400 });
    }
    
    const client = await connectDB();
    const db = client.db();
    
    await db.collection("configs").updateOne(
      { key: "kuisoner_test_type" },
      { $set: { value: testType, updatedAt: new Date() } },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("POST_KUISONER_SETTINGS_ERR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
