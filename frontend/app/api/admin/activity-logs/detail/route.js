import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await requireRole(["admin", "superadmin"]);

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const activityType = searchParams.get("activityType");

    if (!dateStr || !activityType) {
      return NextResponse.json({ success: false, message: "Parameter tidak lengkap" }, { status: 400 });
    }

    const client = await connectDB();
    const db = client.db();

    // 1. Setup boundaries for specific date
    const queryDate = new Date(dateStr);
    const startDate = new Date(queryDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(queryDate);
    endDate.setHours(23, 59, 59, 999);

    // 2. Fetch Active Schools where is_hide is explicitly "false"
    const activeSchools = await db.collection("schools").find({ is_hide: "false" }).project({ _id: 1 }).toArray();
    const activeSchoolIds = activeSchools.map(s => s._id);
    const activeSchoolIdStrings = activeSchoolIds.map(id => id.toString());

    // 3. Resolve active students & teachers
    const activeStudentsAndTeachers = await db.collection("users").find({
      role: { $in: ["student", "teacher"] },
      school_id: { $in: [...activeSchoolIds, ...activeSchoolIdStrings] }
    }).project({ _id: 1, email: 1, role: 1 }).toArray();

    const activeStudentIds = activeStudentsAndTeachers.filter(u => u.role === "student").map(u => u._id);
    const activeStudentIdStrings = activeStudentIds.map(id => id.toString());
    
    const activeTeacherIds = activeStudentsAndTeachers.filter(u => u.role === "teacher").map(u => u._id);
    const activeTeacherIdStrings = activeTeacherIds.map(id => id.toString());

    // 4. Determine collection and parameters based on activityType
    let collectionName = "";
    let userKey = "";
    let dateKey = "";
    let activeIds = [];
    let isStringId = false;
    let descFormatter = d => "Aktivitas terdeteksi";

    switch (activityType) {
      case "tilik_diri":
        collectionName = "student_tilik_diri";
        userKey = "student_id";
        dateKey = "completedAt";
        activeIds = activeStudentIds;
        descFormatter = d => `Skor: ${d.totalScore}/30 (${d.severity?.level || "Sedang"})`;
        break;
      case "learning_style":
        collectionName = "student_learning_style";
        userKey = "student_id";
        dateKey = "completedAt";
        activeIds = activeStudentIds;
        descFormatter = d => `Gaya Belajar: ${d.hasil_dominan?.category || "VAK"}`;
        break;
      case "riasec":
        collectionName = "student_riasec";
        userKey = "student_id";
        dateKey = "completedAt";
        activeIds = activeStudentIds;
        descFormatter = d => `Mengisi Asesmen RIASEC`;
        break;
      case "brain_dominance":
        collectionName = "student_brain_dominance";
        userKey = "student_id";
        dateKey = "completedAt";
        activeIds = activeStudentIds;
        descFormatter = d => `Mengisi Tes Otak Kiri/Kanan`;
        break;
      case "talent_mapping":
        collectionName = "student_talents";
        userKey = "student_id";
        dateKey = "completedAt";
        activeIds = activeStudentIds;
        descFormatter = d => `Mengisi Talent Mapping`;
        break;
      case "mood":
        collectionName = "mood_logs";
        userKey = "student_id";
        dateKey = "createdAt";
        activeIds = activeStudentIds;
        descFormatter = d => `Mood: ${d.label || d.mood || "Normal"}`;
        break;
      case "incident":
        collectionName = "incident_reports";
        userKey = "reporter_id";
        dateKey = "created_at";
        activeIds = activeStudentIds;
        descFormatter = d => `Laporan: ${d.incident_type}`;
        break;
      case "chat":
        collectionName = "messages";
        userKey = "sender_id";
        dateKey = "timestamp";
        activeIds = activeStudentIds;
        isStringId = true;
        descFormatter = d => `Pesan: "${(d.text || "")}"`;
        break;
      case "chatTeacher":
        collectionName = "messages";
        userKey = "sender_id";
        dateKey = "timestamp";
        activeIds = activeTeacherIds;
        isStringId = true;
        descFormatter = d => `Pesan: "${(d.text || "")}"`;
        break;
      case "alertReview":
        collectionName = "critical_chat_logs";
        userKey = "reviewed_by";
        dateKey = "reviewed_at";
        activeIds = activeTeacherIds;
        descFormatter = d => `Peringatan Pengecekan (Status: ${d.status})`;
        break;
      case "login":
        collectionName = "login_logs";
        userKey = "userId";
        dateKey = "createdAt";
        activeIds = activeUserIdsStr;
        isStringId = true;
        descFormatter = d => `Melakukan login ke sistem`;
        break;
      default:
        return NextResponse.json({ success: false, message: "Tipe aktivitas tidak valid" }, { status: 400 });
    }

    // 5. Query matching collection
    const matchQuery = {
      [dateKey]: { $gte: startDate, $lte: endDate }
    };

    if (isStringId) {
      const stringIds = activeIds.map(id => id.toString());
      matchQuery[userKey] = { $in: stringIds };
    } else {
      matchQuery[userKey] = { $in: activeIds };
    }

    const pipeline = [
      { $match: matchQuery }
    ];

    // Join with users collection
    if (isStringId) {
      pipeline.push(
        {
          $addFields: {
            userObjectId: {
              $cond: {
                if: { $eq: [{ $strLenCP: `$${userKey}` }, 24] },
                then: { $toObjectId: `$${userKey}` },
                else: null
              }
            }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userObjectId",
            foreignField: "_id",
            as: "user"
          }
        }
      );
    } else {
      pipeline.push({
        $lookup: {
          from: "users",
          localField: userKey,
          foreignField: "_id",
          as: "user"
        }
      });
    }

    pipeline.push(
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } }
    );

    // Join with schools collection (Safe ObjectId / string lookup)
    pipeline.push(
      {
        $addFields: {
          schoolObjectId: {
            $cond: {
              if: { $eq: [{ $type: "$user.school_id" }, "objectId"] },
              then: "$user.school_id",
              else: {
                $cond: {
                  if: { $eq: [{ $type: "$user.school_id" }, "string"] },
                  then: {
                    $cond: {
                      if: { $eq: [{ $strLenCP: "$user.school_id" }, 24] },
                      then: { $toObjectId: "$user.school_id" },
                      else: null
                    }
                  },
                  else: null
                }
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "schools",
          localField: "schoolObjectId",
          foreignField: "_id",
          as: "school"
        }
      },
      { $unwind: { path: "$school", preserveNullAndEmptyArrays: true } }
    );

    pipeline.push({ $sort: { [dateKey]: -1 } });

    const results = await db.collection(collectionName).aggregate(pipeline).toArray();

    const formattedList = results.map(d => ({
      id: d._id.toString(),
      name: d.user?.fullname || "User",
      email: d.user?.email || "",
      schoolName: d.school?.name || "Sekolah Umum",
      timestamp: d[dateKey],
      description: descFormatter(d)
    }));

    return NextResponse.json({
      success: true,
      data: formattedList
    });

  } catch (error) {
    console.error("ADMIN_ACTIVITY_DETAILS_ERROR:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Internal server error"
    }, { status: 500 });
  }
}
