import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// GET: Ambil daftar psikolog yang belum diverifikasi
export async function GET() {
  try {
    await client.connect();
    const db = client.db();
    
    const psychologists = await db.collection('users')
      .find({ role: 'psychologist' }) // Semua role psikolog
      .sort({ is_verified: 1, createdAt: -1 }) // Yang belum verif di atas
      .toArray();

    return NextResponse.json({ success: true, data: psychologists });
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