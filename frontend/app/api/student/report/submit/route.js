import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Konfigurasi DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: "https://sgp1.digitaloceanspaces.com", // Sesuaikan region Bapak
  forcePathStyle: false,
  region: "us-east-1", 
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET
  }
});

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });

    const data = await request.formData();
    
    // Ambil data dari FormData
    const incidentType = data.get('incidentType');
    const location = data.get('location');
    const time = data.get('time');
    const description = data.get('description');
    const file = data.get('file'); // Ini adalah objek File

    let imageUrl = null;

    // Proses upload ke DigitalOcean Spaces jika ada file
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `reports/${Date.now()}-${file.name.replace(/\s/g, '-')}`;
      const bucketName = process.env.DO_SPACES_BUCKET;

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ACL: "public-read", // Agar foto bisa diakses publik via URL
        ContentType: file.type,
      }));

      // Generate URL hasil upload
      imageUrl = `https://${bucketName}.sgp1.digitaloceanspaces.com/${fileName}`;
    }

    // Simpan data lengkap ke MongoDB
    await client.connect();
    const db = client.db();
    const newReport = {
      reporter_id: new ObjectId(session.user.id),
      incident_type: incidentType,
      location: location,
      occurrence_time: time,
      description: description,
      evidence_url: imageUrl,
      status: "pending",
      created_at: new Date(),
    };

    const result = await db.collection('incident_reports').insertOne(newReport);

    return NextResponse.json({ success: true, reportId: result.insertedId });
  } catch (error) {
    console.error("REPORT_API_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}