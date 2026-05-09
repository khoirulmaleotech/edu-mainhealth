import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db();
    
    // Mengambil daftar room chat
    const rooms = await db.collection('chat_rooms').aggregate([
      {
        $lookup: {
          from: "users",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient"
        }
      },
      { $unwind: "$patient" },
      {
        $project: {
          id: "$_id",
          name: "$patient.fullname",
          lastMsg: 1,
          time: 1,
          risk: 1,
          unread: 1
        }
      },
      { $sort: { updatedAt: -1 } }
    ]).toArray();

    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}