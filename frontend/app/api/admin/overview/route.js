import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["admin", "superadmin"]);

    const database = (await connectDB()).db();
    const [payload = { statistics: [], verificationQueue: [] }] = await database
      .collection("users")
      .aggregate([
        {
          $project: {
            source: { $literal: "user" },
            role: 1,
            is_verified: 1,
            name: { $ifNull: ["$fullname", "$email"] },
            sub: { $ifNull: ["$institution_name", "$email"] },
            createdAt: 1,
            href: { $literal: "/dashboard/admin/verify-psychologist" },
          },
        },
        {
          $unionWith: {
            coll: "schools",
            pipeline: [
              {
                $project: {
                  source: { $literal: "school" },
                  role: { $literal: null },
                  is_verified: 1,
                  name: 1,
                  sub: "$address",
                  createdAt: 1,
                  href: { $literal: "/dashboard/admin/verify-schools" },
                },
              },
            ],
          },
        },
        {
          $facet: {
            statistics: [
              {
                $group: {
                  _id: null,
                  totalStudents: {
                    $sum: {
                      $cond: [{ $eq: ["$role", "student"] }, 1, 0],
                    },
                  },
                  activeSchools: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$source", "school"] },
                            { $eq: ["$is_verified", true] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  verifiedPsychologists: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$role", "psychologist"] },
                            { $eq: ["$is_verified", true] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  pendingSchools: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$source", "school"] },
                            { $ne: ["$is_verified", true] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  pendingPsychologists: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$role", "psychologist"] },
                            { $ne: ["$is_verified", true] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  totalStudents: 1,
                  activeSchools: 1,
                  verifiedPsychologists: 1,
                  pendingSchools: 1,
                  pendingPsychologists: 1,
                  pendingVerifications: {
                    $add: ["$pendingSchools", "$pendingPsychologists"],
                  },
                },
              },
            ],
            verificationQueue: [
              {
                $match: {
                  $or: [
                    {
                      source: "school",
                      is_verified: { $ne: true },
                    },
                    {
                      role: "psychologist",
                      is_verified: { $ne: true },
                    },
                  ],
                },
              },
              { $sort: { createdAt: -1, _id: -1 } },
              { $limit: 8 },
              {
                $project: {
                  _id: 1,
                  name: { $ifNull: ["$name", "Psikolog"] },
                  sub: { $ifNull: ["$sub", "-"] },
                  type: {
                    $cond: [{ $eq: ["$source", "school"] }, "Sekolah", "Psikolog"],
                  },
                  createdAt: 1,
                  href: 1,
                },
              },
            ],
          },
        },
      ], { allowDiskUse: false })
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        statistics: payload.statistics?.[0] || {
          totalStudents: 0,
          activeSchools: 0,
          verifiedPsychologists: 0,
          pendingVerifications: 0,
          pendingSchools: 0,
          pendingPsychologists: 0,
        },
        verificationQueue: payload.verificationQueue || [],
      },
    });
  } catch (error) {
    console.error("ADMIN_OVERVIEW_ERROR:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Login diperlukan" },
        { status: 401 },
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
