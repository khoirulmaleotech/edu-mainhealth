import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";

export async function GET(request, context) {
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

    const db = (await connectDB()).db();

    const article = await db.collection("articles").findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          title: 1,
          description: 1,
          content: 1,
          category: 1,
          type: 1,
          thumbnail: 1,
          status: 1,
          author: 1,
          views: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    );

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
  }
}


export async function PATCH(request, context) {
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

    const db = (await connectDB()).db();

    if (Object.keys(body).length === 1 && body.status) {
      await db.collection("articles").updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: body.status, updatedAt: new Date() } },
      );

      return NextResponse.json({
        success: true,
        message: "Status artikel berhasil diperbarui",
      });
    }

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
  }
}

export async function DELETE(request, context) {
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

    const db = (await connectDB()).db();

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
  }
}
