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
          name: 1,
          city: 1,
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
        $sort: { totalStudents: -1, name: 1 }
      }
    ];

    const schoolsData = await database.collection("schools").aggregate(pipeline).toArray();

    const responses = await database.collection("wellbeing_camp_responses")
      .find({ assessment_type: { $in: ["pre_test", "post_test"] } })
      .project({ student_id: 1, assessment_type: 1, metadata: 1 })
      .toArray();

    for (const school of schoolsData) {
       let pre = 0;
       let post = 0;
       
       const schoolEmails = new Set(school.usersDetails ? school.usersDetails.map(u => u.email?.toLowerCase()).filter(Boolean) : []);
       const schoolIds = new Set(school.usersDetails ? school.usersDetails.map(u => u.id) : []);
       const schoolNameUpper = school.name ? school.name.toUpperCase().trim() : "";

       for (const r of responses) {
          const rEmail = r.metadata?.email?.toLowerCase() || "";
          const rSchoolName = r.metadata?.school_name?.toUpperCase().trim() || "";
          const rStudentId = r.student_id ? r.student_id.toString() : "";

          let isMatch = false;
          if (rStudentId && schoolIds.has(rStudentId)) isMatch = true;
          else if (rEmail && schoolEmails.has(rEmail)) isMatch = true;
          else if (rSchoolName && rSchoolName === schoolNameUpper) isMatch = true;

          if (isMatch) {
             if (r.assessment_type === "pre_test") pre++;
             else if (r.assessment_type === "post_test") post++;
          }
       }
       
       school.totalPreTest = pre;
       school.totalPostTest = post;
       delete school.usersDetails;
    }

    return NextResponse.json(
      {
        success: true,
        data: schoolsData,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("ADMIN_SCHOOLS_STATS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
