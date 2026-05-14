import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

function getPositiveInteger(value, fallback, max) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, max);
}

function getEscapedRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentPage = getPositiveInteger(searchParams.get("page"), 1, 100000);
    const pageSize = getPositiveInteger(searchParams.get("pageSize"), 10, 100);
    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status") || "Semua";
    const skipData = (currentPage - 1) * pageSize;
    const matchFilter = {
      ...(status && status !== "Semua" ? { status } : {}),
    };

    if (search) {
      matchFilter.title = { $regex: getEscapedRegex(search), $options: "i" };
    }

    const db = (await connectDB()).db();
    const [payload = { data: [], totalData: [] }] = await db
      .collection("articles")
      .aggregate([
        { $match: matchFilter },
        {
          $facet: {
            data: [
              { $sort: { createdAt: -1, _id: -1 } },
              { $skip: skipData },
              { $limit: pageSize },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  type: 1,
                  category: 1,
                  status: 1,
                  createdAt: 1,
                },
              },
            ],
            totalData: [{ $count: "count" }],
          },
        },
      ], { allowDiskUse: false })
      .toArray();

    const totalData = payload.totalData?.[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: payload.data || [],
      pagination: {
        currentPage,
        pageSize,
        totalData,
        totalPages: Math.ceil(totalData / pageSize),
        hasNextPage: totalData > currentPage * pageSize,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("GET ARTICLES ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
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
        { success: false, message: "Judul dan konten wajib diisi" },
        { status: 400 },
      );
    }

    const db = (await connectDB()).db();
    const result = await db.collection("articles").insertOne({
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
    });

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil dibuat",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("CREATE ARTICLE ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
