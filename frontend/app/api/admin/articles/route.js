import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI belum tersedia di environment");
}

export async function GET() {
  let client;

  try {
    client = new MongoClient(uri);

    await client.connect();

    const db = client.db();

    const articles = await db
      .collection("articles")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: articles,
    });
  } catch (error) {
    console.error("GET ARTICLES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function POST(request) {
  let client;

  try {
    const body = await request.json();

    const {
      title,
      description,
      content,
      category,
      type,
      thumbnail,
      status,
      author,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          message: "Judul dan konten wajib diisi",
        },
        { status: 400 }
      );
    }

    client = new MongoClient(uri);

    await client.connect();

    const db = client.db();

    const newArticle = {
      title,
      description: description || "",
      content,
      category: category || "Parenting",
      type: type || "Artikel",
      thumbnail: thumbnail || "",
      status: status || "Draft",
      author: author || "Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("articles")
      .insertOne(newArticle);

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil dibuat",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("CREATE ARTICLE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}