import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// Impor fungsi connectDB terpusat yang dipertahankan di folder lib Bapak
import { connectDB } from "@/lib/mongodb"; 

// Konfigurasi DigitalOcean Spaces Singleton di luar handler
const s3Client = new S3Client({
  endpoint: "https://sgp1.digitaloceanspaces.com", // Region Singapura (sgp1) sesuai endpoint Bapak
  forcePathStyle: false,
  region: "us-east-1", // Diperlukan oleh spesifikasi AWS SDK internal untuk Spaces
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET
  }
});

export async function POST(request) {
  try {
    // 1. Validasi Autentikasi Sesi Pelapor (Siswa)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Sesi tidak valid atau kedaluwarsa" }, { status: 401 });
    }

    // 2. Parsing Payload berbasis Form Data (untuk mendukung pengiriman File binary)
    const data = await request.formData();
    
    const incidentType = data.get('incidentType');
    const location = data.get('location');
    const time = data.get('time');
    const description = data.get('description');
    const file = data.get('file'); // Berupa objek File/Blob dari frontend

    let imageUrl = null;

    // 3. Proses Upload File ke DigitalOcean Spaces jika terdapat bukti dokumen/foto
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Sanitasi nama berkas untuk mencegah anomali spasi pada URL endpoint
      const sanitizedFileName = file.name.replace(/\s/g, '-');
      const fileName = `reports/${Date.now()}-${sanitizedFileName}`;
      const bucketName = process.env.DO_SPACES_BUCKET;

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ACL: "public-read", // Membuka akses baca publik agar URL gambar dapat dimuat di frontend
        ContentType: file.type,
      }));

      // Inisialisasi tautan URL hasil unggahan berkas bukti secara dinamis
      imageUrl = `https://${bucketName}.sgp1.digitaloceanspaces.com/${fileName}`;
    }

    // 4. Gunakan koneksi pooling terpusat dari global cache (Bebas dari kebocoran koneksi Atlas)
    const client = await connectDB();
    const db = client.db();

    const reporterIdStr = session.user.id;
    // Validasi format ObjectId sebelum query/insert dokumen baru
    const userId = ObjectId.isValid(reporterIdStr) ? new ObjectId(reporterIdStr) : reporterIdStr;

    // 5. Strukturisasi skema data laporan insiden bullying/curhat siswa
    const newReport = {
      reporter_id: userId,
      incident_type: incidentType,
      location: location,
      occurrence_time: time,
      description: description,
      evidence_url: imageUrl,
      status: "pending", // Status default: pending | processed | resolved
      created_at: new Date(),
      updatedAt: new Date(),
    };

    // 6. Eksekusi penyimpanan ke collection incident_reports
    const result = await db.collection('incident_reports').insertOne(newReport);

    return NextResponse.json({ 
      success: true, 
      message: "Laporan insiden berhasil dikirim ke sistem monitoring sekolah.",
      reportId: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error("❌ REPORT_API_ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Terjadi kesalahan internal pada server pelaporan" 
    }, { status: 500 });
  }
}