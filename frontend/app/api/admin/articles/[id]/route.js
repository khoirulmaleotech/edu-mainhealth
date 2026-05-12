import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI belum tersedia di environment");
}

export async function GET(request, context) {
  let client;

  try {
    const { id } = context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID artikel tidak valid",
        },
        { status: 400 }
      );
    }

    client = new MongoClient(uri);

    await client.connect();

    const db = client.db();

    const article = await db.collection("articles").findOne({
      _id: new ObjectId(id),
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
      data: article,
    });
  } catch (error) {
    console.error("GET DETAIL ARTICLE ERROR:", error);

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


export async function PATCH(request, context) {
  let client;

  try {
    const { id } = context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID artikel tidak valid",
        },
        { status: 400 }
      );
    }

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

    const article = await db.collection("articles").findOne({
      _id: new ObjectId(id),
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

    await db.collection("articles").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          title,
          description: description || "",
          content,
          category: category || "Parenting",
          type: type || "Artikel",
          thumbnail: thumbnail || "",
          status: status || "Draft",
          author: author || "Admin",

          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil diperbarui",
    });
  } catch (error) {
    console.error("UPDATE ARTICLE ERROR:", error);

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

export async function DELETE(request, context) {
  let client;

  try {
    const { id } = context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID artikel tidak valid",
        },
        { status: 400 }
      );
    }

    client = new MongoClient(uri);

    await client.connect();

    const db = client.db();

    const article = await db.collection("articles").findOne({
      _id: new ObjectId(id),
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

    await db.collection("articles").deleteOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil dihapus",
    });
  } catch (error) {

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