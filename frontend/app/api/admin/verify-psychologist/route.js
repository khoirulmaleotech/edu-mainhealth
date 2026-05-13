import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// GET: Ambil daftar psikolog yang belum diverifikasi
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
            { fullname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { institution_name: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    
    const result = await db.collection('users').aggregate([
      { $match: { role: 'psychologist', ...statusMatch, ...searchMatch } },
      {
        $facet: {
          data: [
            { $sort: { is_verified: 1, createdAt: -1 } },
            { $skip: skipData },
            { $limit: pageSize },
            {
              $project: {
                fullname: 1,
                email: 1,
                institution_name: 1,
                is_verified: 1,
                createdAt: 1,
              },
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
    return NextResponse.json({ message: "Gagal mengambil data psikolog" }, { status: 500 });
  }
}

// PATCH: Approve atau Reject akun psikolog
export async function PATCH(request) {
  try {
    const { id, action } = await request.json();

    await client.connect();
    const db = client.db();

    if (action === 'approve') {
      await db.collection('users').updateOne(
        { _id: new ObjectId(id) },
        { $set: { is_verified: true, updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true, message: "Akun Psikolog diaktifkan!" });
    } 
    
    if (action === 'reject') {
      await db.collection('users').deleteOne({ _id: new ObjectId(id) });
      return NextResponse.json({ success: true, message: "Pendaftaran Psikolog dihapus" });
    }

  } catch (error) {
    return NextResponse.json({ message: "Gagal memproses verifikasi" }, { status: 500 });
  }
}
