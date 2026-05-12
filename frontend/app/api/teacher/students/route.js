import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

const talentCategoryMapping = {
  "Logika & Riset": "Analytical",
  "Seni & Kreatif": "Creative",
  "Sosial & Empati": "Communicative",
  "Kepemimpinan": "Leadership",
  "Teknis & Praktis": "Technical",
};

export async function GET(request) {
  try {
    const session = await requireRole([
      "teacher",
    ]);

    const client = await connectDB();

    const database = client.db();

    const teacherId = new ObjectId(
      session.user.id
    );

    const { searchParams } = new URL(
      request.url
    );

    const currentPage =
      Number(
        searchParams.get("page")
      ) || 1;

    const pageSize =
      Number(
        searchParams.get("pageSize")
      ) || 10;

    const searchQuery =
      searchParams.get("search") || "";

    const skipData =
      (currentPage - 1) * pageSize;

    const searchFilter =
      searchQuery.trim()
        ? {
          fullname: {
            $regex: searchQuery,
            $options: "i",
          },
        }
        : {};

    const baseMatchFilter = {
      role: "student",

      homeroom_teacher_id:
        teacherId,

      ...searchFilter,
    };

    const totalData =
      await database
        .collection("users")
        .countDocuments(
          baseMatchFilter
        );

    const studentResult =
      await database
        .collection("users")
        .aggregate([
          {
            $match:
              baseMatchFilter,
          },

          {
            $lookup: {
              from: "student_talent",

              let: {
                studentId: "$_id",
              },

              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: [
                        "$student_id",
                        "$$studentId",
                      ],
                    },
                  },
                },

                {
                  $sort: {
                    completedAt: -1,
                  },
                },

                {
                  $limit: 1,
                },
              ],

              as: "latest_talent",
            },
          },

          {
            $unwind: {
              path: "$latest_talent",

              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $sort: {
              fullname: 1,
            },
          },

          {
            $skip: skipData,
          },

          {
            $limit: pageSize,
          },
        ])
        .toArray();

    const transformedStudentData =
      studentResult.map(
        (studentItem) => {
          const talentScores =
            studentItem
              ?.latest_talent
              ?.scores || [];

          const sortedScores =
            [...talentScores].sort(
              (
                firstScore,
                secondScore
              ) =>
                secondScore.value -
                firstScore.value
            );

          const dominantTalent =
            sortedScores[0];

          return {
            _id: studentItem._id,

            student_fullname:
              studentItem.fullname,

            dominant_talent:
              dominantTalent
                ? talentCategoryMapping[
                dominantTalent
                  .subject
                ]
                : null,

            highest_score:
              dominantTalent
                ?.value || null,

            completed_at:
              studentItem
                ?.latest_talent
                ?.completedAt ||
              null,

            has_completed_talent_assessment:
              !!studentItem.latest_talent,
          };
        }
      );

    return NextResponse.json({
      success: true,

      data: transformedStudentData,

      pagination: {
        currentPage,

        pageSize,

        totalData,

        totalPages: Math.ceil(
          totalData / pageSize
        ),

        hasNextPage:
          currentPage * pageSize <
          totalData,

        hasPreviousPage:
          currentPage > 1,
      },
    });
  } catch (error) {
    console.error(
      "TEACHER_STUDENTS_ERROR:",
      error
    );

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
