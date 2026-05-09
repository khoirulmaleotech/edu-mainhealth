import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const psychologistId = session.user.id; 

  try {
    await client.connect();
    const db = client.db();
    
    // Perbaikan Query: Cari berdasarkan psychologist_id secara eksplisit
    // Jangan hanya mengandalkan array participants yang ada null-nya
    const rooms = await db.collection('chat_rooms').aggregate([
      {
        $match: {
          $or: [
            { psychologist_id: psychologistId },
            { psychologist_id: new ObjectId(psychologistId) },
            { participants: { $in: [psychologistId] } }
          ]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient_data"
        }
      },
      { $unwind: { path: "$patient_data", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: "$_id",
          // Fallback jika patient_data null agar dashboard tidak putih polos
          name: { $ifNull: ["$patient_data.fullname", "Pasien Anonim"] },
          lastMsg: { $ifNull: ["$lastMsg", "Belum ada pesan"] },
          time: { $ifNull: ["$updatedAt", "$createdAt"] },
          risk: { $ifNull: ["$risk", "Medium"] },
          unread: { $ifNull: ["$unread", 0] }
        }
      },
      { $sort: { time: -1 } }
    ]).toArray();

    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    console.error("ERR_GET_ROOMS:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}