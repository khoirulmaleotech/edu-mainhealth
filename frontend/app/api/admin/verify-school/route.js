import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// ==========================================
// 1. GET: Ambil Antrean Sekolah (Aggregated)
// ==========================================
export async function GET(request) {
  try {
    await client.connect();
    const db = client.db();
    const { searchParams } = new URL(request.url);
    const currentPage = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 20;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const skipData = (currentPage - 1) * pageSize;

    const statusMatch =
      status === "verified"
        ? { is_verified: true }
        : status === "pending"
          ? { is_verified: { $ne: true } }
          : {};
    
    const searchMatch = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
            { "admin_info.email": { $regex: search, $options: "i" } },
            { "admin_info.fullname": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const result = await db.collection('schools').aggregate([
      { $match: statusMatch },
      {
        $lookup: {
          from: "users",
          localField: "admin_id",
          foreignField: "_id",
          as: "admin_info"
        }
      },
      {
        $unwind: {
          path: "$admin_info",
          preserveNullAndEmptyArrays: true 
        }
      },
      { $match: searchMatch },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skipData },
            { $limit: pageSize },
            {
              $project: {
                name: 1,
                address: 1,
                phone: 1,
                website: 1,
                is_verified: 1,
                createdAt: 1,
                admin_name: "$admin_info.fullname",
                admin_email: "$admin_info.email"
              }
            },
          ],
          totalData: [{ $count: "count" }]
        }
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
        }
      }
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
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

// ==========================================
// 2. PATCH: Proses Approve atau Reject
// ==========================================
export async function PATCH(request) {
  try {
    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ message: "ID dan Action wajib diisi" }, { status: 400 });
    }

    await client.connect();
    const db = client.db();

    if (action === 'approve') {
      // Step A: Update status sekolah
      await db.collection('schools').updateOne(
        { _id: new ObjectId(id) },
        { $set: { is_verified: true, updatedAt: new Date() } }
      );

      // Step B: Ambil admin_id dari sekolah tersebut
      const school = await db.collection('schools').findOne({ _id: new ObjectId(id) });

      // Step C: Aktifkan user terkait agar bisa login
      if (school && school.admin_id) {
        await db.collection('users').updateOne(
          { _id: new ObjectId(school.admin_id) },
          { $set: { is_verified: true } }
        );
      }

      return NextResponse.json({ success: true, message: "Sekolah & Admin berhasil diaktifkan" });

    } else if (action === 'reject') {
      // Ambil data sekolah dulu untuk hapus user terkait
      const school = await db.collection('schools').findOne({ _id: new ObjectId(id) });
      
      if (school && school.admin_id) {
        await db.collection('users').deleteOne({ _id: new ObjectId(school.admin_id) });
      }
      
      // Hapus data sekolah
      await db.collection('schools').deleteOne({ _id: new ObjectId(id) });

      return NextResponse.json({ success: true, message: "Pendaftaran dihapus permanen" });
    }

    return NextResponse.json({ message: "Action tidak valid" }, { status: 400 });

  } catch (error) {
    console.error("PATCH_SCHOOL_ERR:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
