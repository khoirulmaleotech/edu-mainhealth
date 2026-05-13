import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI belum tersedia");
}

export async function GET() {
  let client;

  try {
    client = new MongoClient(uri);

    await client.connect();

    const db = client.db();

    const articles = await db
      .collection("articles")
      .find({
        status: "Published",
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    return NextResponse.json({
      success: true,
      articles,
    });
  } catch (error) {
    console.error("GET PARENT ARTICLES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil artikel",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}