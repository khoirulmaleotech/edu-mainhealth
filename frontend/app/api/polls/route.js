import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const client = await connectDB();
    const db = client.db("edumind");
    const responses = await db
      .collection("polls_responses")
      .find({})
      .toArray();

    // Aggregate counts
    const counts = {
      "SMAN 1 bukittinggi": 0,
      "SMAN 2 bukittinggi": 0,
      "SMAN 3 bukittinggi": 0,
      "SMAN 4 bukittinggi": 0,
      "SMAN 5 bukittinggi": 0,
    };

    responses.forEach(r => {
      if (counts[r.answer] !== undefined) {
        counts[r.answer]++;
      }
    });

    const data = Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("GET Polls Error:", error);
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

    await db.collection("polls_responses").insertOne(newResponse);

    return NextResponse.json(
      { success: true, message: "Vote saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Polls Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
