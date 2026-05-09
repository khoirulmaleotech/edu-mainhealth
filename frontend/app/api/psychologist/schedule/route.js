import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || "05"; // Default Mei
    const year = searchParams.get('year') || "2026";

    await client.connect();
    const db = client.db();
    
    // Ambil jadwal psikolog (bisa difilter berdasarkan session user nantinya)
    const schedules = await db.collection('appointments').aggregate([
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "_id",
          as: "student_info"
        }
      },
      { $unwind: "$student_info" },
      {
        $project: {
          id: "$_id",
          student: "$student_info.fullname",
          time: 1,       // Format: "09:00 - 10:00"
          date: 1,       // Format: "2026-05-07"
          type: 1,       // Counseling, Mediation, Parent Session
          location: 1,   // Ruang A atau Virtual Meeting
          status: 1,     // Confirmed, On-Going, Pending
          color: 1       // border-primary, border-secondary, dll
        }
      },
      { $sort: { time: 1 } }
    ]).toArray();

    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}