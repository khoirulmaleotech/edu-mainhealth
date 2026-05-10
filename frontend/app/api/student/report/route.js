import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/authOptions';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// 1. GET: Mengambil daftar laporan milik siswa
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });

    const userId = new ObjectId(session.user.id);
    await client.connect();
    const db = client.db();

    const reports = await db.collection('incident_reports')
      .find({ reporter_id: userId })
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 2. PATCH: Mengupdate sebagian data laporan (Partial Update)
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });

    const { id, ...updateData } = await request.json();
    
    // Pastikan ID tersedia
    if (!id) return NextResponse.json({ success: false, message: "ID diperlukan" }, { status: 400 });

    await client.connect();
    const db = client.db();

    // Mapping data yang diperbolehkan diupdate untuk keamanan
    const allowedUpdates = {};
    if (updateData.incidentType) allowedUpdates.incident_type = updateData.incidentType;
    if (updateData.location) allowedUpdates.location = updateData.location;
    if (updateData.time) allowedUpdates.occurrence_time = updateData.time;
    if (updateData.description) allowedUpdates.description = updateData.description;
    
    allowedUpdates.updated_at = new Date();

    const result = await db.collection('incident_reports').updateOne(
      { 
        _id: new ObjectId(id), 
        reporter_id: new ObjectId(session.user.id) 
      },
      { $set: allowedUpdates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Laporan tidak ditemukan atau akses ditolak" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH_REPORT_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: "ID diperlukan" }, { status: 400 });

    await client.connect();
    const db = client.db();

    const result = await db.collection('incident_reports').deleteOne({
      _id: new ObjectId(id),
      reporter_id: new ObjectId(session.user.id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Laporan tidak ditemukan atau akses ditolak" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}