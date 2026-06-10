import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const client = await connectDB();
    const db = client.db("edumind");
    const responses = await db
      .collection("mentimeter_responses")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: responses }, { status: 200 });
  } catch (error) {
    console.error("GET Mentimeter Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { answer } = body;

    if (!answer) {
      return NextResponse.json(
        { success: false, message: "Answer is required" },
        { status: 400 }
      );
    }

    const client = await connectDB();
    const db = client.db("edumind");
    
    const newResponse = {
      answer,
      createdAt: new Date(),
    };

    await db.collection("mentimeter_responses").insertOne(newResponse);

    return NextResponse.json(
      { success: true, message: "Response saved successfully", data: newResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Mentimeter Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
