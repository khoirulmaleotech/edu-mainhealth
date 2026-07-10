import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// Generic helper function to fetch specific activities from any collection and join with users
async function fetchGenericActivities({
  db,
  collectionName,
  userKey,
  dateKey,
  activeUserIds,
  role,
  typeLabel,
  descFormatter,
  search,
  dateFilter,
  isStringId = false
}) {
  const matchQuery = {};
  
  if (Object.keys(dateFilter).length > 0) {
    matchQuery[dateKey] = dateFilter;
  }
  
  if (isStringId) {
    const stringIds = activeUserIds.map(id => id.toString());
    matchQuery[userKey] = { $in: stringIds };
  } else {
    matchQuery[userKey] = { $in: activeUserIds };
  }

  const pipeline = [
    { $match: matchQuery }
  ];

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
  } else if (userKey === "parent_email") {
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "parent_email",
        foreignField: "email",
        as: "user"
      }
    });
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

  pipeline.push({ $unwind: { path: "$user", preserveNullAndEmptyArrays: false } });

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { "user.fullname": { $regex: search, $options: "i" } },
          { "user.email": { $regex: search, $options: "i" } }
        ]
      }
    });
  }

  pipeline.push({ $sort: { [dateKey]: -1 } });
  pipeline.push({ $limit: 100 });

  const docs = await db.collection(collectionName).aggregate(pipeline).toArray();

  return docs.map(d => ({
    id: d._id.toString(),
    userId: (d.user?._id || "").toString(),
    name: d.user?.fullname || "User",
    email: d.user?.email || "",
    role: role,
    type: typeLabel,
    timestamp: d[dateKey],
    description: typeof descFormatter === "function" ? descFormatter(d) : descFormatter
  }));
}

export async function GET(request) {
  try {
    await requireRole(["admin", "superadmin"]);
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const type = searchParams.get("type") || "";
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 15;

    const client = await connectDB();
    const db = client.db();

    // 2. Fetch Active Schools where is_hide is explicitly "false"
    const activeSchools = await db.collection("schools").find({ is_hide: "false" }).project({ _id: 1 }).toArray();
    const activeSchoolIds = activeSchools.map(s => s._id);
    const activeSchoolIdStrings = activeSchoolIds.map(id => id.toString());

    // 3. Resolve Active User ID sets for active schools
    const activeStudentsAndTeachers = await db.collection("users").find({
      role: { $in: ["student", "teacher"] },
      school_id: { $in: [...activeSchoolIds, ...activeSchoolIdStrings] }
    }).project({ _id: 1, email: 1, role: 1 }).toArray();

    const activeStudentIds = activeStudentsAndTeachers.filter(u => u.role === "student").map(u => u._id);
    const activeStudentIdStrings = activeStudentIds.map(id => id.toString());
    
    const activeTeacherIds = activeStudentsAndTeachers.filter(u => u.role === "teacher").map(u => u._id);
    const activeTeacherIdStrings = activeTeacherIds.map(id => id.toString());

    const familyLinks = await db.collection("family_links").find({
      student_id: { $in: activeStudentIds }
    }).project({ parent_email: 1 }).toArray();
    const activeParentEmails = familyLinks.map(fl => fl.parent_email?.toLowerCase()).filter(Boolean);

    const activeParents = await db.collection("users").find({
      role: "parent",
      email: { $in: activeParentEmails }
    }).project({ _id: 1, email: 1 }).toArray();

    const activeParentIds = activeParents.map(p => p._id);
    const activeParentIdStrings = activeParentIds.map(id => id.toString());
    const activeParentEmailsSet = new Set(activeParentEmails);

    const activeUserIdsStr = [
      ...activeStudentIdStrings,
      ...activeTeacherIdStrings,
      ...activeParentIdStrings
    ];

    // Parse date filters
    let dateFilter = {};
    if (startDateStr) {
      dateFilter.$gte = new Date(startDateStr);
    }
    if (endDateStr) {
      const endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.$lte = endDate;
    }
    const hasDateFilter = startDateStr || endDateStr;

    // --- Heatmap Date Range Determination ---
    let heatmapStartDate = new Date();
    heatmapStartDate.setDate(heatmapStartDate.getDate() - 29); // default last 30 days
    let heatmapEndDate = new Date();

    if (startDateStr) {
      heatmapStartDate = new Date(startDateStr);
    }
    if (endDateStr) {
      heatmapEndDate = new Date(endDateStr);
    }

    // Set boundaries
    heatmapStartDate.setHours(0, 0, 0, 0);
    const resolvedEndDate = new Date(heatmapEndDate);
    resolvedEndDate.setHours(23, 59, 59, 999);

    // Calculate days difference
    const diffTime = Math.abs(resolvedEndDate - heatmapStartDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const maxDays = Math.min(diffDays, 90); // Cap at 90 days to prevent layout overload

    const dayMap = {};
    for (let i = 0; i <= maxDays; i++) {
      const d = new Date(heatmapStartDate);
      d.setDate(heatmapStartDate.getDate() + i);
      if (d <= resolvedEndDate) {
        const dateString = d.toISOString().split("T")[0]; // YYYY-MM-DD
        dayMap[dateString] = {
          date: dateString,
          logins: { total: 0, uniqueUsers: new Set() },
          tilikDiri: new Set(),
          learningStyle: new Set(),
          riasec: new Set(),
          brainDominance: new Set(),
          talentMapping: new Set(),
          mood: new Set(),
          incident: new Set(),
          chat: new Set(),
          chatTeacher: new Set(),
          alertReview: new Set(),
          parentAssessments: new Set(),
          totalActivities: 0
        };
      }
    }

    let loginActivities = [];
    let specificActivities = [];

    // --- A. Login activities (Global) ---
    if (!type || type === "login") {
      let query = {
        userId: { $in: activeUserIdsStr }
      };
      if (hasDateFilter) query.createdAt = dateFilter;
      if (role) query.role = role;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      
      const logs = await db.collection("login_logs")
        .find(query)
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
        
      loginActivities = logs.map(l => ({
        id: l._id.toString(),
        userId: l.userId,
        name: l.name || "User",
        email: l.email || "",
        role: l.role,
        type: "login",
        timestamp: l.createdAt,
        description: "Telah login ke sistem"
      }));
    }

    // --- B. Platform usage activities (Specific features for student/teacher/parent) ---
    if (!type || type === "platform_use") {
      
      // 1. Student Features
      if (!role || role === "student") {
        // Tilik diri
        const tilikDiri = await fetchGenericActivities({
          db,
          collectionName: "student_tilik_diri",
          userKey: "student_id",
          dateKey: "completedAt",
          activeUserIds: activeStudentIds,
          role: "student",
          typeLabel: "tilik_diri",
          descFormatter: d => `Mengisi Asesmen Tilik Diri (Skor: ${d.totalScore}/30, ${d.severity?.level || "Sedang"})`,
          search,
          dateFilter
        });
        
        // Learning style
        const learningStyle = await fetchGenericActivities({
          db,
          collectionName: "student_learning_style",
          userKey: "student_id",
          dateKey: "completedAt",
          activeUserIds: activeStudentIds,
          role: "student",
          typeLabel: "learning_style",
          descFormatter: d => `Mengisi Tes Gaya Belajar (VAK) (Dominan: ${d.hasil_dominan?.category || "VAK"})`,
          search,
          dateFilter
        });

        // Riasec
        const riasec = await fetchGenericActivities({
          db,
          collectionName: "student_riasec",
          userKey: "student_id",
          dateKey: "completedAt",
          activeUserIds: activeStudentIds,
          role: "student",
          typeLabel: "riasec",
          descFormatter: "Mengisi Tes Karir (RIASEC)",
          search,
          dateFilter
        });

        // Brain dominance
        const brainDominance = await fetchGenericActivities({
          db,
          collectionName: "student_brain_dominance",
          userKey: "student_id",
          dateKey: "completedAt",
          activeUserIds: activeStudentIds,
          role: "student",
          typeLabel: "brain_dominance",
          descFormatter: "Mengisi Tes Dominasi Otak Kanan & Kiri",
          search,
          dateFilter
        });

        // Talents
        const talents = await fetchGenericActivities({
          db,
          collectionName: "student_talents",
          userKey: "student_id",
          dateKey: "completedAt",
          activeUserIds: activeStudentIds,
          role: "student",
          typeLabel: "talent_mapping",
          descFormatter: "Mengisi Asesmen EduMind Talent Mapping",
          search,
          dateFilter
        });

        // Mood check-in
        const moodLogs = await fetchGenericActivities({
          db,
          collectionName: "mood_logs",
          userKey: "student_id",
          dateKey: "createdAt",
          activeUserIds: activeStudentIds,
          role: "student",
          typeLabel: "mood",
          descFormatter: d => `Melakukan Mood Check-in (Mood: ${d.label || d.mood || "Normal"})`,
          search,
          dateFilter
        });

        // Lapor insiden
        const incidentReports = await fetchGenericActivities({
          db,
          collectionName: "incident_reports",
          userKey: "reporter_id",
          dateKey: "created_at",
          activeUserIds: activeStudentIds,
          role: "student",
          typeLabel: "incident",
          descFormatter: d => `Melaporkan Insiden Baru (Tipe: ${d.incident_type})`,
          search,
          dateFilter
        });

        // Student chat messages
        const studentMessages = await fetchGenericActivities({
          db,
          collectionName: "messages",
          userKey: "sender_id",
          dateKey: "timestamp",
          activeUserIds: activeStudentIds,
          role: "student",
          typeLabel: "chat",
          descFormatter: d => `Mengirim pesan konsultasi: "${(d.text || "").substring(0, 40)}..."`,
          search,
          dateFilter,
          isStringId: true
        });

        specificActivities.push(
          ...tilikDiri,
          ...learningStyle,
          ...riasec,
          ...brainDominance,
          ...talents,
          ...moodLogs,
          ...incidentReports,
          ...studentMessages
        );
      }

      // 2. Teacher Features
      if (!role || role === "teacher") {
        const teacherMessages = await fetchGenericActivities({
          db,
          collectionName: "messages",
          userKey: "sender_id",
          dateKey: "timestamp",
          activeUserIds: activeTeacherIds,
          role: "teacher",
          typeLabel: "chat",
          descFormatter: d => `Membalas pesan konsultasi siswa: "${(d.text || "").substring(0, 40)}..."`,
          search,
          dateFilter,
          isStringId: true
        });

        const alertReviews = await fetchGenericActivities({
          db,
          collectionName: "critical_chat_logs",
          userKey: "reviewed_by",
          dateKey: "reviewed_at",
          activeUserIds: activeTeacherIds,
          role: "teacher",
          typeLabel: "incident",
          descFormatter: d => `Meninjau / Merespons Peringatan Krisis Siswa (Status: ${d.status})`,
          search,
          dateFilter
        });

        specificActivities.push(...teacherMessages, ...alertReviews);
      }

      // 3. Parent Features
      if (!role || role === "parent") {
        const parentAssessments = await fetchGenericActivities({
          db,
          collectionName: "parent_assessments",
          userKey: "parent_email",
          dateKey: "createdAt",
          activeUserIds: activeParentEmails,
          role: "parent",
          typeLabel: "parent_assessment",
          descFormatter: d => `Mengisi Asesmen Orang Tua (${d.title || "Kondisi Emosional"}, Skor: ${d.score})`,
          search,
          dateFilter
        });

        specificActivities.push(...parentAssessments);
      }
    }

    let allActivities = [...loginActivities, ...specificActivities];
    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const totalCount = allActivities.length;
    const startIndex = (page - 1) * limit;
    const paginatedActivities = allActivities.slice(startIndex, startIndex + limit);

    // --- Overview Statistics (Matching selected date range) ---
    const loginStats = await db.collection("login_logs").aggregate([
      { 
        $match: { 
          createdAt: { $gte: heatmapStartDate, $lte: resolvedEndDate },
          userId: { $in: activeUserIdsStr }
        } 
      },
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]).toArray();
    
    const loginStatsMap = { student: 0, teacher: 0, parent: 0 };
    loginStats.forEach(item => {
      if (loginStatsMap[item._id] !== undefined) {
        loginStatsMap[item._id] = item.count;
      }
    });

    const totalTilikDiri = await db.collection("student_tilik_diri")
      .countDocuments({ completedAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, student_id: { $in: activeStudentIds } });

    const totalLearning = await db.collection("student_learning_style")
      .countDocuments({ completedAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, student_id: { $in: activeStudentIds } });

    const totalRiasec = await db.collection("student_riasec")
      .countDocuments({ completedAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, student_id: { $in: activeStudentIds } });

    const totalBrain = await db.collection("student_brain_dominance")
      .countDocuments({ completedAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, student_id: { $in: activeStudentIds } });

    const totalTalents = await db.collection("student_talents")
      .countDocuments({ completedAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, student_id: { $in: activeStudentIds } });

    const totalMood = await db.collection("mood_logs")
      .countDocuments({ createdAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, student_id: { $in: activeStudentIds } });

    const totalIncidents = await db.collection("incident_reports")
      .countDocuments({ created_at: { $gte: heatmapStartDate, $lte: resolvedEndDate }, reporter_id: { $in: activeStudentIds } });

    const totalParentAssessments = await db.collection("parent_assessments")
      .countDocuments({ createdAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, parent_email: { $in: activeParentEmails } });

    const totalPlatformUseCount = 
      totalTilikDiri + 
      totalLearning + 
      totalRiasec + 
      totalBrain + 
      totalTalents + 
      totalMood + 
      totalIncidents + 
      totalParentAssessments;

    // --- Heatmap Data (Last 30 days or filtered range with unique users per feature) ---
    const recentLogins = await db.collection("login_logs")
      .find({ 
        createdAt: { $gte: heatmapStartDate, $lte: resolvedEndDate },
        userId: { $in: activeUserIdsStr }
      })
      .project({ createdAt: 1, userId: 1 })
      .toArray();
      
    recentLogins.forEach(l => {
      if (l.createdAt) {
        const dateStr = new Date(l.createdAt).toISOString().split("T")[0];
        if (dayMap[dateStr]) {
          dayMap[dateStr].logins.total += 1;
          if (l.userId) dayMap[dateStr].logins.uniqueUsers.add(l.userId.toString());
          dayMap[dateStr].totalActivities += 1;
        }
      }
    });

    const recentTilikDiri = await db.collection("student_tilik_diri")
      .find({ completedAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, student_id: { $in: activeStudentIds } })
      .project({ completedAt: 1, student_id: 1 }).toArray();

    const recentLearningStyle = await db.collection("student_learning_style")
      .find({ completedAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, student_id: { $in: activeStudentIds } })
      .project({ completedAt: 1, student_id: 1 }).toArray();

    const recentRiasecTest = await db.collection("student_riasec")
      .find({ completedAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, student_id: { $in: activeStudentIds } })
      .project({ completedAt: 1, student_id: 1 }).toArray();

    const recentBrainTest = await db.collection("student_brain_dominance")
      .find({ completedAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, student_id: { $in: activeStudentIds } })
      .project({ completedAt: 1, student_id: 1 }).toArray();

    const recentTalentsTest = await db.collection("student_talents")
      .find({ completedAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, student_id: { $in: activeStudentIds } })
      .project({ completedAt: 1, student_id: 1 }).toArray();

    const recentMoodLogs = await db.collection("mood_logs")
      .find({ createdAt: { $gte: heatmapStartDate, $lte: resolvedEndDate }, student_id: { $in: activeStudentIds } })
      .project({ createdAt: 1, student_id: 1 }).toArray();

    const recentIncidentLogs = await db.collection("incident_reports")
      .find({ created_at: { $gte: heatmapStartDate, $lte: resolvedEndDate }, reporter_id: { $in: activeStudentIds } })
      .project({ created_at: 1, reporter_id: 1 }).toArray();

    const recentStudentMessages = await db.collection("messages")
      .find({ 
        timestamp: { $gte: heatmapStartDate, $lte: resolvedEndDate },
        sender_id: { $in: activeStudentIdStrings }
      })
      .project({ timestamp: 1, sender_id: 1 })
      .toArray();

    const recentTeacherMessages = await db.collection("messages")
      .find({ 
        timestamp: { $gte: heatmapStartDate, $lte: resolvedEndDate },
        sender_id: { $in: activeTeacherIdStrings }
      })
      .project({ timestamp: 1, sender_id: 1 })
      .toArray();

    const recentAlertReviews = await db.collection("critical_chat_logs")
      .find({
        reviewed_at: { $gte: heatmapStartDate, $lte: resolvedEndDate },
        reviewed_by: { $in: activeTeacherIds }
      })
      .project({ reviewed_at: 1, reviewed_by: 1 })
      .toArray();

    const recentParentAssessments = await db.collection("parent_assessments")
      .find({ 
        createdAt: { $gte: heatmapStartDate, $lte: resolvedEndDate },
        parent_email: { $in: activeParentEmails }
      })
      .project({ createdAt: 1, parent_email: 1 })
      .toArray();

    // Populating Sets helper
    const applySet = (list, dateField, userField, dayMapKey) => {
      list.forEach(item => {
        if (item[dateField] && item[userField]) {
          const dateStr = new Date(item[dateField]).toISOString().split("T")[0];
          if (dayMap[dateStr]) {
            dayMap[dateStr][dayMapKey].add(item[userField].toString());
            dayMap[dateStr].totalActivities += 1;
          }
        }
      });
    };

    applySet(recentTilikDiri, "completedAt", "student_id", "tilikDiri");
    applySet(recentLearningStyle, "completedAt", "student_id", "learningStyle");
    applySet(recentRiasecTest, "completedAt", "student_id", "riasec");
    applySet(recentBrainTest, "completedAt", "student_id", "brainDominance");
    applySet(recentTalentsTest, "completedAt", "student_id", "talentMapping");
    applySet(recentMoodLogs, "createdAt", "student_id", "mood");
    applySet(recentIncidentLogs, "created_at", "reporter_id", "incident");
    applySet(recentStudentMessages, "timestamp", "sender_id", "chat");
    applySet(recentTeacherMessages, "timestamp", "sender_id", "chatTeacher");
    applySet(recentAlertReviews, "reviewed_at", "reviewed_by", "alertReview");

    // Parents
    recentParentAssessments.forEach(item => {
      if (item.createdAt && item.parent_email) {
        const dateStr = new Date(item.createdAt).toISOString().split("T")[0];
        if (dayMap[dateStr]) {
          dayMap[dateStr].parentAssessments.add(item.parent_email.toLowerCase());
          dayMap[dateStr].totalActivities += 1;
        }
      }
    });

    // Serialize sets into counts in JSON
    const heatmap = Object.values(dayMap).map(day => ({
      date: day.date,
      total: day.totalActivities,
      logins: day.logins.total,
      uniqueLogins: day.logins.uniqueUsers.size,
      studentStats: {
        tilikDiri: day.tilikDiri.size,
        learningStyle: day.learningStyle.size,
        riasec: day.riasec.size,
        brainDominance: day.brainDominance.size,
        talentMapping: day.talentMapping.size,
        mood: day.mood.size,
        incident: day.incident.size,
        chat: day.chat.size,
        totalUniqueStudents: new Set([
          ...day.tilikDiri,
          ...day.learningStyle,
          ...day.riasec,
          ...day.brainDominance,
          ...day.talentMapping,
          ...day.mood,
          ...day.incident,
          ...day.chat
        ]).size
      },
      teacherStats: {
        chat: day.chatTeacher.size,
        alertReview: day.alertReview.size,
        totalUniqueTeachers: new Set([
          ...day.chatTeacher,
          ...day.alertReview
        ]).size
      },
      parentStats: {
        parentAssessments: day.parentAssessments.size
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        },
        stats: {
          logins: loginStatsMap,
          tilikDiriCount: totalTilikDiri + totalLearning + totalRiasec + totalBrain + totalTalents + totalMood + totalIncidents,
          parentAssessmentsCount: totalParentAssessments,
          totalActivities: loginStats.reduce((acc, c) => acc + c.count, 0) + totalPlatformUseCount
        },
        heatmap
      }
    }, {
      headers: { 
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache"
      }
    });

  } catch (error) {
    console.error("ADMIN_ACTIVITY_LOGS_ERROR:", error);
    
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Login diperlukan" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }
    
    return NextResponse.json({
      success: false,
      message: error.message || "Internal server error"
    }, { status: 500 });
  }
}
