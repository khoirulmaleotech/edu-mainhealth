import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["admin", "superadmin"]);

    const client = await connectDB();
    const database = client.db();

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
          $group: {
            _id: null,
            pendingSchools: {
              $sum: 1,
            },
            pendingPsychologists: {
              $sum: 0,
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
                $group: {
                  _id: null,
                  pendingSchools: {
                    $sum: 0,
                  },
                  pendingPsychologists: {
                    $sum: 1,
                  },
                },
              },
            ],
          },
        },
        {
          $group: {
            _id: null,
            pendingSchools: {
              $sum: "$pendingSchools",
            },
            pendingPsychologists: {
              $sum: "$pendingPsychologists",
            },
          },
        },
        {
          $project: {
            _id: 0,
            pendingSchools: 1,
            pendingPsychologists: 1,
            pendingVerifications: {
              $add: ["$pendingSchools", "$pendingPsychologists"],
            },
          },
        },
      ])
      .next();

    return NextResponse.json({
      success: true,
      pendingSchools: result?.pendingSchools || 0,
      pendingPsychologists: result?.pendingPsychologists || 0,
      pendingVerifications: result?.pendingVerifications || 0,
    });
  } catch (error) {
    console.error("ADMIN_PENDING_VERIFICATIONS_ERROR:", error);

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
