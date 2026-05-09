import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db();
    
    // Mengambil data rujukan kasus klinis
    const cases = await db.collection('clinical_cases').aggregate([
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
          name: "$patient_info.fullname",
          origin: 1,      // Contoh: "Rujukan Guru BK" atau "AI Detection"
          issue: 1,       // Contoh: "Indikasi Depresi"
          priority: 1,    // Critical, High, Medium
          status: 1,      // Waiting, On-Going, Scheduled
          lastSession: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    return NextResponse.json({ success: true, data: cases });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat data klinis" }, { status: 500 });
  }
}