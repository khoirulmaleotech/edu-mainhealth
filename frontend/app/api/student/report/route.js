import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/authOptions';
// Impor fungsi connectDB terpusat yang dipertahankan di folder lib Bapak
import { connectDB } from "@/lib/mongodb"; 

// 1. GET: Mengambil daftar laporan milik siswa yang sedang login
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Gunakan koneksi pooling terpusat dari global cache (Aman dari Connection Full)
    const client = await connectDB();
    const db = client.db();

    const studentIdStr = session.user.id;
    const userId = ObjectId.isValid(studentIdStr) ? new ObjectId(studentIdStr) : studentIdStr;

    // Ambil data laporan diurutkan dari yang paling baru dikirim
    const reports = await db.collection('incident_reports')
      .find({ reporter_id: userId })
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("❌ GET_REPORT_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message || "Gagal mengambil daftar laporan" }, { status: 500 });
  }
}

// 2. PATCH: Mengupdate sebagian data laporan siswa (Partial Update)
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id, ...updateData } = await request.json();
    
    // Validasi ketersediaan ID laporan
    if (!id) {
      return NextResponse.json({ success: false, message: "ID diperlukan" }, { status: 400 });
    }

    // Gunakan koneksi pooling terpusat dari global cache
    const client = await connectDB();
    const db = client.db();

    const studentIdStr = session.user.id;
    const queryUserId = ObjectId.isValid(studentIdStr) ? new ObjectId(studentIdStr) : studentIdStr;
    const queryReportId = ObjectId.isValid(id) ? new ObjectId(id) : id;

    // Mapping data yang diperbolehkan diupdate demi keamanan data integrity
    const allowedUpdates = {};
    if (updateData.incidentType !== undefined) allowedUpdates.incident_type = updateData.incidentType;
    if (updateData.location !== undefined) allowedUpdates.location = updateData.location;
    if (updateData.time !== undefined) allowedUpdates.occurrence_time = updateData.time;
    if (updateData.description !== undefined) allowedUpdates.description = updateData.description;
    
    allowedUpdates.updated_at = new Date();

    // Eksekusi update dengan memastikan bahwa pelapor adalah pemilik asli laporan tersebut
    const result = await db.collection('incident_reports').updateOne(
      { 
        _id: queryReportId, 
        reporter_id: queryUserId 
      },
      { $set: allowedUpdates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Laporan tidak ditemukan atau akses ditolak" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Laporan berhasil diperbarui" });
  } catch (error) {
    console.error("❌ PATCH_REPORT_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message || "Gagal memperbarui laporan" }, { status: 500 });
  }
}

// 3. DELETE: Menghapus laporan berdasarkan ID laporan dan ID siswa
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validasi ketersediaan ID laporan pada URL query params
    if (!id) {
      return NextResponse.json({ success: false, message: "ID diperlukan" }, { status: 400 });
    }

    // Gunakan koneksi pooling terpusat dari global cache
    const client = await connectDB();
    const db = client.db();

    const studentIdStr = session.user.id;
    const queryUserId = ObjectId.isValid(studentIdStr) ? new ObjectId(studentIdStr) : studentIdStr;
    const queryReportId = ObjectId.isValid(id) ? new ObjectId(id) : id;

    // Eksekusi penghapusan dengan memastikan kepemilikan dokumen laporan
    const result = await db.collection('incident_reports').deleteOne({
      _id: queryReportId,
      reporter_id: queryUserId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Laporan tidak ditemukan atau akses ditolak" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Laporan berhasil dihapus dari sistem" });
  } catch (error) {
    console.error("❌ DELETE_REPORT_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message || "Gagal menghapus laporan" }, { status: 500 });
  }
}