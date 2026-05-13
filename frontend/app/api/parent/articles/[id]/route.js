import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI belum tersedia");
}

export async function GET(request, { params }) {
  let client;

  try {
    client = new MongoClient(uri);

    await client.connect();

    const db = client.db();

    const article = await db.collection("articles").findOne({
      _id: new ObjectId(params.id),
      status: "Published",
    });

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          message: "Artikel tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article,
    });
  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail artikel",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}