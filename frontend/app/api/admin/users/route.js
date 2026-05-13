import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// GET: Ambil semua user
export async function GET(request) {
  try {
    await client.connect();
    const db = client.db();
    const { searchParams } = new URL(request.url);
    const currentPage = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 20;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";
    const skipData = (currentPage - 1) * pageSize;

    const roleMatch = role && role !== "all" ? { role } : {};
    const searchMatch = search
      ? {
          $or: [
            { fullname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
            { institution_name: { $regex: search, $options: "i" } },
            { "school_data.name": { $regex: search, $options: "i" } },
          ],
        }
      : {};
    
    const result = await db.collection('users').aggregate([
      { $match: { role: { $ne: 'admin' }, ...roleMatch } },
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
      {
        $lookup: {
          from: "schools",
          localField: "converted_id",
          foreignField: "_id",
          as: "school_data"
        }
      },
      { $unwind: { path: "$school_data", preserveNullAndEmptyArrays: true } },
      { $match: searchMatch },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skipData },
            { $limit: pageSize },
            {
              $project: {
                _id: 1,
                fullname: 1,
                email: 1,
                role: 1,
                is_verified: 1,
                createdAt: 1,
                institution_name: 1, 
                school_name: "$school_data.name" 
              }
            },
          ],
          totalData: [{ $count: "count" }],
        },
      },
      {
        $project: {
          data: 1,
          totalData: { $ifNull: [{ $arrayElemAt: ["$totalData.count", 0] }, 0] },
          totalPages: {
            $ceil: {
              $divide: [{ $ifNull: [{ $arrayElemAt: ["$totalData.count", 0] }, 0] }, pageSize],
            },
          },
          hasNextPage: {
            $gt: [{ $ifNull: [{ $arrayElemAt: ["$totalData.count", 0] }, 0] }, currentPage * pageSize],
          },
          hasPreviousPage: { $gt: [currentPage, 1] },
        },
      },
    ]).toArray();

    const payload = result[0] || { data: [], totalData: 0 };

    return NextResponse.json({
      success: true,
      data: payload.data,
      pagination: {
        currentPage,
        pageSize,
        totalData: payload.totalData,
        totalPages: payload.totalPages,
        hasNextPage: payload.hasNextPage,
        hasPreviousPage: payload.hasPreviousPage,
      },
    });
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
