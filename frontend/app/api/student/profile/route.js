import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const s3Client = new S3Client({
  endpoint: "https://sgp1.digitaloceanspaces.com",
  forcePathStyle: false,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET
  }
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });

    await client.connect();
    const db = client.db();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } }
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const fullname = data.get('fullname');
    const phone = data.get('phone');
    const file = data.get('file');

    const updateData = { 
      fullname, 
      phone, 
      updated_at: new Date() 
    };

    // Logika Upload ke DigitalOcean Spaces jika ada file baru
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Nama file unik (menggunakan ID user dan timestamp)
      const fileName = `avatars/${session.user.id}-${Date.now()}.png`;
      const bucketName = process.env.DO_SPACES_BUCKET;

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ACL: "public-read", // Agar gambar bisa diakses melalui URL
        ContentType: file.type,
      }));

      // Simpan URL gambar ke field 'image' di database
      updateData.image = `https://${bucketName}.sgp1.digitaloceanspaces.com/${fileName}`;
    }

    await client.connect();
    const db = client.db();

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PROFILE_PATCH_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}