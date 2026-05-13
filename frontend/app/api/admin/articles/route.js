import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI belum tersedia di environment");
}

export async function GET(request) {
  let client;

  try {
    const { searchParams } = new URL(request.url);
    const currentPage = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "Semua";
    const skipData = (currentPage - 1) * pageSize;

    client = new MongoClient(uri);

    await client.connect();

    const db = client.db();
    const matchFilter = {
      ...(status && status !== "Semua" ? { status } : {}),
      ...(search
        ? {
            title: {
              $regex: search,
              $options: "i",
            },
          }
        : {}),
    };

    const result = await db
      .collection("articles")
      .aggregate([
        {
          $facet: {
            data: [
              { $match: matchFilter },
              { $sort: { createdAt: -1 } },
              { $skip: skipData },
              { $limit: pageSize },
            ],
            totalData: [
              { $match: matchFilter },
              { $count: "count" },
            ],
            summary: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
        {
          $project: {
            data: 1,
            summary: 1,
            totalData: { $ifNull: [{ $arrayElemAt: ["$totalData.count", 0] }, 0] },
            totalPages: {
              $ceil: {
                $divide: [{ $ifNull: [{ $arrayElemAt: ["$totalData.count", 0] }, 0] }, pageSize],
              },
            },
            hasNextPage: {
              $gt: [{ $ifNull: [{ $arrayElemAt: ["$totalData.count", 0] }, 0] }, currentPage * pageSize],
            },
            hasPreviousPage: { $gt: [currentPage, 1] },
          },
        },
      ])
      .toArray();

    const payload = result[0] || { data: [], totalData: 0, summary: [] };

    return NextResponse.json({
      success: true,
      data: payload.data,
      summary: payload.summary,
      pagination: {
        currentPage,
        pageSize,
        totalData: payload.totalData,
        totalPages: payload.totalPages,
        hasNextPage: payload.hasNextPage,
        hasPreviousPage: payload.hasPreviousPage,
      },
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
