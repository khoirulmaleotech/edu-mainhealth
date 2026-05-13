import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await requireRole(["admin", "superadmin"]);

    const client = await connectDB();
    const database = client.db();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const currentPage = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 8;
    const skipData = (currentPage - 1) * pageSize;

    const searchFilter = search
      ? {
          $or: [
            {
              name: {
                $regex: search,
                $options: "i",
              },
            },
            {
              sub: {
                $regex: search,
                $options: "i",
              },
            },
            {
              type: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const result = await database
      .collection("schools")
      .aggregate([
        {
          $match: {
            is_verified: {
              $ne: true,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "admin_id",
            foreignField: "_id",
            as: "admin",
          },
        },
        {
          $unwind: {
            path: "$admin",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: "$name",
            sub: {
              $ifNull: ["$address", "$admin.email"],
            },
            type: {
              $literal: "Sekolah",
            },
            createdAt: 1,
            href: {
              $literal: "/dashboard/admin/verify-schools",
            },
          },
        },
        {
          $unionWith: {
            coll: "users",
            pipeline: [
              {
                $match: {
                  role: "psychologist",
                  is_verified: {
                    $ne: true,
                  },
                },
              },
              {
                $project: {
                  name: {
                    $ifNull: ["$fullname", "$email"],
                  },
                  sub: {
                    $ifNull: ["$institution_name", "$email"],
                  },
                  type: {
                    $literal: "Psikolog",
                  },
                  createdAt: 1,
                  href: {
                    $literal: "/dashboard/admin/verify-psychologist",
                  },
                },
              },
            ],
          },
        },
        {
          $match: searchFilter,
        },
        {
          $facet: {
            data: [
              { $sort: { createdAt: -1 } },
              { $skip: skipData },
              { $limit: pageSize },
            ],
            totalData: [{ $count: "count" }],
          },
        },
        {
          $project: {
            data: 1,
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
        }
      ])
      .toArray();

    const payload = result[0] || { data: [], totalData: 0 };

    return NextResponse.json({
      success: true,
      data: payload.data,
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
    console.error("ADMIN_VERIFICATION_QUEUE_ERROR:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          message: "Login diperlukan",
        },
        {
          status: 401,
        }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
