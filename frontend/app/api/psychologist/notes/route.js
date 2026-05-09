import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db();
    
    const notes = await db.collection('clinical_notes').aggregate([
      {
        $lookup: {
          from: "users",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient_info"
        }
      },
      { $unwind: "$patient_info" },
      {
        $project: {
          _id: 1,
          student: "$patient_info.fullname",
          date: 1,
          topic: 1,
          category: 1,
          summary: 1,
          status: 1, // Draft atau Finalized
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal memuat catatan" }, { status: 500 });
  }
}