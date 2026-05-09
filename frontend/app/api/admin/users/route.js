import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// GET: Ambil semua user
export async function GET() {
  try {
    await client.connect();
    const db = client.db();
    
    const users = await db.collection('users').aggregate([
      { $match: { role: { $ne: 'admin' } } },
      // Tahap 1: Konversi String ID ke ObjectId jika formatnya valid
      {
        $addFields: {
          converted_id: { 
            $cond: {
              if: { 
                $and: [
                  { $ne: ["$institution_id", ""] },
                  { $ne: ["$institution_id", null] },
                  { $eq: [{ $strLenCP: { $ifNull: ["$institution_id", ""] } }, 24] }
                ]
              },
              then: { $toObjectId: "$institution_id" },
              else: null
            }
          }
        }
      },
      // Tahap 2: Join ke koleksi schools
      {
        $lookup: {
          from: "schools",
          localField: "converted_id",
          foreignField: "_id",
          as: "school_data"
        }
      },
      { $unwind: { path: "$school_data", preserveNullAndEmptyArrays: true } },
      // Tahap 3: Proyeksi (Hanya gunakan Inclusion saja)
      {
        $project: {
          _id: 1, // Boleh ada 1 dan 0 khusus untuk _id
          fullname: 1,
          email: 1,
          role: 1,
          is_verified: 1,
          createdAt: 1,
          institution_name: 1, 
          school_name: "$school_data.name" 
          // Field 'password' otomatis hilang karena tidak disebutkan (Inclusion mode)
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("DETEKSI ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE & PATCH: Untuk manajemen status user
export async function PATCH(request) {
  try {
    const { id, action } = await request.json();
    await client.connect();
    const db = client.db();

    if (action === 'delete') {
      await db.collection('users').deleteOne({ _id: new ObjectId(id) });
      return NextResponse.json({ success: true, message: "User berhasil dihapus" });
    }

    // Toggle status blokir atau aktif
    if (action === 'toggle_status') {
      const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
      await db.collection('users').updateOne(
        { _id: new ObjectId(id) },
        { $set: { is_active: !user.is_active, updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json({ message: "Gagal memproses perubahan" }, { status: 500 });
  }
}