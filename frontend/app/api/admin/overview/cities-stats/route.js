import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["admin", "superadmin"]);

    const client = await connectDB();
    const database = client.db();

    const pipeline = [
      {
        $match: { is_hide: "false" }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "school_id",
          as: "users"
        }
      },
      {
        $project: {
          city: { $ifNull: ["$city", "Tidak Diketahui"] },
          totalStudents: {
            $size: {
              $filter: {
                input: "$users",
                as: "user",
                cond: { $eq: ["$$user.role", "student"] }
              }
            }
          },
          totalTeachers: {
            $size: {
              $filter: {
                input: "$users",
                as: "user",
                cond: { $eq: ["$$user.role", "teacher"] }
              }
            }
          },
          usersDetails: {
            $map: {
              input: "$users",
              as: "u",
              in: { id: { $toString: "$$u._id" }, email: "$$u.email" }
            }
          }
        }
      },
      {
        $group: {
          _id: "$city",
          activeSchools: { $sum: 1 },
          totalStudents: { $sum: "$totalStudents" },
          totalTeachers: { $sum: "$totalTeachers" },
          usersDetails: { $push: "$usersDetails" },
          schoolNames: { $push: "$name" }
        }
      },
      {
        $project: {
          _id: 0,
          city: "$_id",
          activeSchools: 1,
          totalStudents: 1,
          totalTeachers: 1,
          schoolNames: 1,
          usersDetails: {
            $reduce: {
              input: "$usersDetails",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          }
        }
      },
      {
        $sort: { activeSchools: -1, city: 1 }
      }
    ];

    const citiesData = await database.collection("schools").aggregate(pipeline).toArray();

    const responses = await database.collection("wellbeing_camp_responses")
      .find({ assessment_type: { $in: ["pre_test", "post_test"] } })
      .project({ student_id: 1, assessment_type: 1, metadata: 1 })
      .toArray();

    for (const city of citiesData) {
       let pre = 0;
       let post = 0;
       
       const cityEmails = new Set(city.usersDetails ? city.usersDetails.map(u => u.email?.toLowerCase()).filter(Boolean) : []);
       const cityIds = new Set(city.usersDetails ? city.usersDetails.map(u => u.id) : []);
       const citySchoolNames = new Set(city.schoolNames ? city.schoolNames.map(n => n?.toUpperCase().trim()).filter(Boolean) : []);

       for (const r of responses) {
          const rEmail = r.metadata?.email?.toLowerCase() || "";
          const rSchoolName = r.metadata?.school_name?.toUpperCase().trim() || "";
          const rStudentId = r.student_id ? r.student_id.toString() : "";

          let isMatch = false;
          if (rStudentId && cityIds.has(rStudentId)) isMatch = true;
          else if (rEmail && cityEmails.has(rEmail)) isMatch = true;
          else if (rSchoolName && citySchoolNames.has(rSchoolName)) isMatch = true;

          if (isMatch) {
             if (r.assessment_type === "pre_test") pre++;
             else if (r.assessment_type === "post_test") post++;
          }
       }
       
       city.totalPreTest = pre;
       city.totalPostTest = post;
       delete city.usersDetails;
       delete city.schoolNames;
    }

    return NextResponse.json(
      {
        success: true,
        data: citiesData,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("ADMIN_CITIES_STATS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
