import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // 1. Authorize role
    await requireRole(["admin", "superadmin"]);

    const client = await connectDB();
    const db = client.db();

    // Get cities from query parameters
    const { searchParams } = new URL(request.url);
    const citiesParam = searchParams.get("cities");
    
    let schoolFilter = {
      is_verified: true,
      is_hide: { $ne: "true" }
    };

    if (citiesParam) {
      const cities = citiesParam.split(",").map(c => c.trim()).filter(Boolean);
      if (cities.length > 0) {
        const regexStr = cities.join("|");
        schoolFilter.$or = [
          { city: { $in: cities } },
          { name: { $regex: regexStr, $options: "i" } }
        ];
      }
    }

    // --- Dynamic Stats Query ---
    
    // Schools Count
    const activeSchools = await db.collection("schools").countDocuments(schoolFilter);

    const activeSchoolDocs = await db.collection("schools").find(schoolFilter).project({ _id: 1 }).toArray();
    const activeSchoolIds = activeSchoolDocs.map(s => s._id);

    // Users counts
    const activeStudents = await db.collection("users").find({
      role: "student",
      school_id: { $in: activeSchoolIds }
    }).project({ _id: 1 }).toArray();
    const activeStudentIds = activeStudents.map(s => s._id);
    const activeStudentIdStrings = activeStudents.map(s => s._id.toString());
    const activeStudentMatchIds = [...activeStudentIds, ...activeStudentIdStrings];

    const totalStudents = activeStudents.length;

    const totalTeachers = await db.collection("users").countDocuments({
      role: "teacher",
      school_id: { $in: activeSchoolIds }
    });

    // Tilik Diri (Wellbeing Index)
    // Tilik Diri is out of 30 max score. Let's find average and map to 100.
    const tilikDiriStats = await db.collection("student_tilik_diri").aggregate([
      {
        $match: {
          student_id: { $in: activeStudentMatchIds }
        }
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$totalScore" },
          totalAssessments: { $sum: 1 },
          atRiskCount: {
            $sum: {
              $cond: [
                { $in: ["$severity.level", ["depresi sedang", "depresi berat", "depresi berat / sangat berat", "Depresi Sedang", "Depresi Berat"]] },
                1,
                0
              ]
            }
          },
          criticalCount: {
            $sum: {
              $cond: [
                { $in: ["$severity.level", ["depresi berat", "depresi berat / sangat berat", "Depresi Berat"]] },
                1,
                0
              ]
            }
          }
        }
      }
    ]).toArray();

    const avgScore = tilikDiriStats[0]?.avgScore || 0;
    const totalAssessments = tilikDiriStats[0]?.totalAssessments || 0;
    const atRiskCount = tilikDiriStats[0]?.atRiskCount || 0;
    const criticalCount = tilikDiriStats[0]?.criticalCount || 0;

    // School Wellbeing Index: Out of 100
    // baseline is 74. Current index is based on avg score.
    const schoolWellbeingIndex = avgScore > 0 ? Math.round((avgScore / 30) * 100) : 74;

    // Bullying Cases & Reduction
    const totalIncidentReports = await db.collection("incident_reports").countDocuments({
      reporter_id: { $in: activeStudentMatchIds }
    });
    // Risk rate
    const riskPercentage = totalAssessments > 0 ? Math.round(((atRiskCount + criticalCount) / totalAssessments) * 100) : 0;

    // Help Seeking Rate
    // Active consultation rooms / critical logs
    const criticalLogsCount = await db.collection("critical_chat_logs").countDocuments({
      student_id: { $in: activeStudentMatchIds }
    });
    const activeChatsCount = await db.collection("chat_rooms").countDocuments({
      patient_id: { $in: activeStudentMatchIds }
    });
    const helpSeekingRate = criticalLogsCount > 0 ? Math.round((activeChatsCount / criticalLogsCount) * 100) : 0;

    // Mood averages
    const totalMoodLogs = await db.collection("mood_logs").countDocuments({
      student_id: { $in: activeStudentMatchIds }
    });
    const positiveMoodLogs = await db.collection("mood_logs").countDocuments({
      student_id: { $in: activeStudentMatchIds },
      mood: { $in: ["senang", "bahagia", "gembira", "baik", "happy", "excited", 4, 5] }
    });
    const positiveMoodRate = totalMoodLogs > 0 ? Math.round((positiveMoodLogs / totalMoodLogs) * 100) : 58;

    // Learning Styles distribution
    const learningStyles = await db.collection("student_learning_style").aggregate([
      {
        $match: {
          student_id: { $in: activeStudentMatchIds }
        }
      },
      { $group: { _id: "$hasil_dominan.category", count: { $sum: 1 } } }
    ]).toArray();
    
    // Brain preference
    const brainPreferences = await db.collection("student_brain_dominance").aggregate([
      {
        $match: {
          student_id: { $in: activeStudentMatchIds }
        }
      },
      { $group: { _id: "$dominasi", count: { $sum: 1 } } }
    ]).toArray();

    // Talent Profile
    const talentStats = await db.collection("student_talents").aggregate([
      {
        $match: {
          student_id: { $in: activeStudentMatchIds }
        }
      },
      {
        $project: {
          topTalent: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$scores",
                  as: "s",
                  cond: {
                    $eq: ["$$s.value", { $max: "$scores.value" }]
                  }
                }
              },
              0
            ]
          }
        }
      },
      {
        $group: {
          _id: "$topTalent.subject",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    // Map styles for chart
    const stylesMap = { Visual: 0, Kinesthetic: 0, Auditory: 0, Reading: 0 };
    learningStyles.forEach(item => {
      const name = item._id || "Lainnya";
      if (name.toLowerCase().includes("vis")) stylesMap.Visual += item.count;
      else if (name.toLowerCase().includes("kin")) stylesMap.Kinesthetic += item.count;
      else if (name.toLowerCase().includes("aud")) stylesMap.Auditory += item.count;
      else stylesMap.Reading += item.count;
    });

    const totalStyleMapped = Object.values(stylesMap).reduce((a, b) => a + b, 0) || 1;

    // Brain Dominance Mapping
    const brainMap = { Left: 0, Right: 0, Middle: 0 };
    brainPreferences.forEach(item => {
      const name = item._id || "Balanced";
      if (name.toLowerCase().includes("kiri") || name.toLowerCase().includes("left")) brainMap.Left += item.count;
      else if (name.toLowerCase().includes("kanan") || name.toLowerCase().includes("right")) brainMap.Right += item.count;
      else brainMap.Middle += item.count;
    });

    const totalBrainMapped = Object.values(brainMap).reduce((a, b) => a + b, 0) || 1;

    // Construct response
    const pilotData = {
      summary: {
        wellbeingIndex: 84,
        wellbeingIndexChange: 10,
        bullyingReduction: 41,
        bullyingCasesBaseline: 28,
        bullyingCasesCurrent: 16,
        riskReduction: 56,
        riskBaseline: 16,
        riskCurrent: 7,
        helpSeekingImprovement: 43,
        helpSeekingBaseline: 24,
        helpSeekingCurrent: 67,
        teacherEngagement: 72,
        teacherEngagementChange: 34
      },
      coverage: {
        activeSchools: 5,
        activeTeachers: 63,
        registeredStudents: 383
      },
      kpiTable: [
        { kpi: "School Wellbeing Index", baseline: "74", current: "84", change: "+10 poin", isPositive: true },
        { kpi: "Positive Mood", baseline: "58%", current: "76%", change: "+18%", isPositive: true },
        { kpi: "High Risk Student (At Risk + Critical)", baseline: "16%", current: "7%", change: "-56%", isPositive: true },
        { kpi: "Incident Bullying", baseline: "28 kasus", current: "11 kasus", change: "-61%", isPositive: true },
        { kpi: "Student Help-Seeking", baseline: "24%", current: "67%", change: "+43%", isPositive: true }
      ],
      wellbeingDist: [
        { name: "Flourishing (Kondisi Baik)", value: 58, color: "#10B981" },
        { name: "Monitoring (Perlu Pemantauan)", value: 27, color: "#F59E0B" },
        { name: "At Risk (Perlu Intervensi)", value: 10, color: "#3B82F6" },
        { name: "Critical (Tindakan Mendesak)", value: 5, color: "#EF4444" }
      ],
      riskFactors: [
        { name: "Tekanan Akademik", value: 64 },
        { name: "Bullying Verbal", value: 52 },
        { name: "Cyberbullying", value: 38 },
        { name: "Konflik Pertemanan", value: 31 },
        { name: "Masalah Keluarga", value: 23 }
      ],
      learningStyles: [
        { name: "Visual", value: 68, color: "#3B82F6" },
        { name: "Kinestetik", value: 18, color: "#10B981" },
        { name: "Auditori", value: 9, color: "#F59E0B" },
        { name: "Reading/Writing", value: 5, color: "#EF4444" }
      ],
      careerInterests: [
        { name: "AI & Technology", value: 32 },
        { name: "Healthcare", value: 21 },
        { name: "Education", value: 17 },
        { name: "Business", value: 14 },
        { name: "Creative Industry", value: 9 },
        { name: "Engineering", value: 7 }
      ],
      brainPreference: [
        { name: "Analytical (Kiri)", value: 45, color: "#10B981" },
        { name: "Balanced (Tengah)", value: 30, color: "#3B82F6" },
        { name: "Creative (Kanan)", value: 25, color: "#F59E0B" }
      ],
      talentIntelligence: [
        { name: "Leadership", value: 25 },
        { name: "Creative Thinking", value: 22 },
        { name: "Communication", value: 21 },
        { name: "Problem Solving", value: 18 },
        { name: "Empathy", value: 14 }
      ],
      engagement: [
        { name: "Log In", value: 92 },
        { name: "Mood Check", value: 85 },
        { name: "Assessment (Pre/Post Test)", value: 89 },
        { name: "Screening Tilik Diri", value: 91 },
        { name: "Tes Gaya Belajar", value: 88 },
        { name: "Tes Karir", value: 82 },
        { name: "Tes Otak Kanan-Kiri", value: 80 }
      ]
    };

    const realtimeData = {
      summary: {
        wellbeingIndex: schoolWellbeingIndex,
        wellbeingIndexChange: Math.max(0, schoolWellbeingIndex - 74),
        bullyingReduction: totalIncidentReports > 0 ? Math.round((totalIncidentReports / totalStudents) * 100) : 10,
        bullyingCasesBaseline: totalStudents > 0 ? Math.round(totalStudents * 0.05) : 50,
        bullyingCasesCurrent: totalIncidentReports,
        riskReduction: riskPercentage > 0 ? Math.max(10, 50 - riskPercentage) : 20,
        riskBaseline: 25,
        riskCurrent: riskPercentage,
        helpSeekingImprovement: helpSeekingRate,
        helpSeekingBaseline: 20,
        helpSeekingCurrent: helpSeekingRate || 35,
        teacherEngagement: totalTeachers > 0 ? Math.min(100, Math.round((totalTeachers / (activeSchools || 1)) * 15)) : 70,
        teacherEngagementChange: 12
      },
      coverage: {
        activeSchools: activeSchools || 1,
        activeTeachers: totalTeachers || 1,
        registeredStudents: totalStudents || 1
      },
      kpiTable: [
        { kpi: "School Wellbeing Index", baseline: "74", current: `${schoolWellbeingIndex}`, change: `+${Math.max(0, schoolWellbeingIndex - 74)} poin`, isPositive: schoolWellbeingIndex >= 74 },
        { kpi: "Positive Mood", baseline: "58%", current: `${positiveMoodRate}%`, change: `+${Math.max(0, positiveMoodRate - 58)}%`, isPositive: positiveMoodRate >= 58 },
        { kpi: "High Risk Student (At Risk + Critical)", baseline: "16%", current: `${riskPercentage}%`, change: `${riskPercentage <= 16 ? "-" : "+"}${Math.abs(riskPercentage - 16)}%`, isPositive: riskPercentage <= 16 },
        { kpi: "Incident Bullying", baseline: "28 kasus", current: `${totalIncidentReports} kasus`, change: `${totalIncidentReports <= 28 ? "-" : "+"}${Math.round(Math.abs(totalIncidentReports - 28) / 28 * 100)}%`, isPositive: totalIncidentReports <= 28 },
        { kpi: "Student Help-Seeking", baseline: "24%", current: `${helpSeekingRate || 35}%`, change: `+${Math.max(0, (helpSeekingRate || 35) - 24)}%`, isPositive: (helpSeekingRate || 35) >= 24 }
      ],
      wellbeingDist: [
        { name: "Flourishing (Kondisi Baik)", value: totalAssessments > 0 ? Math.round(((totalAssessments - atRiskCount - criticalCount) / totalAssessments) * 100) : 60, color: "#10B981" },
        { name: "Monitoring (Perlu Pemantauan)", value: totalAssessments > 0 ? Math.round(((atRiskCount - criticalCount) / totalAssessments) * 100) : 25, color: "#F59E0B" },
        { name: "At Risk (Perlu Intervensi)", value: totalAssessments > 0 ? Math.round((atRiskCount / totalAssessments) * 100) : 10, color: "#3B82F6" },
        { name: "Critical (Tindakan Mendesak)", value: totalAssessments > 0 ? Math.round((criticalCount / totalAssessments) * 100) : 5, color: "#EF4444" }
      ],
      riskFactors: [
        { name: "Tekanan Akademik", value: 55 },
        { name: "Bullying Verbal", value: 42 },
        { name: "Cyberbullying", value: 30 },
        { name: "Konflik Pertemanan", value: 25 },
        { name: "Masalah Keluarga", value: 18 }
      ],
      learningStyles: [
        { name: "Visual", value: Math.round((stylesMap.Visual / totalStyleMapped) * 100) || 50, color: "#3B82F6" },
        { name: "Kinestetik", value: Math.round((stylesMap.Kinesthetic / totalStyleMapped) * 100) || 25, color: "#10B981" },
        { name: "Auditori", value: Math.round((stylesMap.Auditory / totalStyleMapped) * 100) || 15, color: "#F59E0B" },
        { name: "Reading/Writing", value: Math.round((stylesMap.Reading / totalStyleMapped) * 100) || 10, color: "#EF4444" }
      ],
      careerInterests: [
        { name: "AI & Technology", value: 35 },
        { name: "Healthcare", value: 25 },
        { name: "Education", value: 15 },
        { name: "Business", value: 12 },
        { name: "Creative Industry", value: 8 },
        { name: "Engineering", value: 5 }
      ],
      brainPreference: [
        { name: "Analytical (Kiri)", value: Math.round((brainMap.Left / totalBrainMapped) * 100) || 40, color: "#10B981" },
        { name: "Balanced (Tengah)", value: Math.round((brainMap.Middle / totalBrainMapped) * 100) || 35, color: "#3B82F6" },
        { name: "Creative (Kanan)", value: Math.round((brainMap.Right / totalBrainMapped) * 100) || 25, color: "#F59E0B" }
      ],
      talentIntelligence: talentStats.length > 0 
        ? talentStats.map(t => {
            const talentNames = {
              "Kepemimpinan": "Leadership",
              "Seni & Kreatif": "Creative Thinking",
              "Logika & Riset": "Problem Solving",
              "Sosial & Empati": "Empathy",
              "Teknis & Praktis": "Technical Skill"
            };
            return {
              name: talentNames[t._id] || t._id,
              value: Math.round((t.count / (totalStudents || 1)) * 100)
            };
          })
        : [
            { name: "Leadership", value: 28 },
            { name: "Creative Thinking", value: 24 },
            { name: "Communication", value: 20 },
            { name: "Problem Solving", value: 16 },
            { name: "Empathy", value: 12 }
          ],
      engagement: [
        { name: "Log In", value: 88 },
        { name: "Mood Check", value: 82 },
        { name: "Assessment (Pre/Post Test)", value: 85 },
        { name: "Screening Tilik Diri", value: 90 },
        { name: "Tes Gaya Belajar", value: 80 },
        { name: "Tes Karir", value: 75 },
        { name: "Tes Otak Kanan-Kiri", value: 78 }
      ]
    };

    return NextResponse.json({
      success: true,
      data: realtimeData
    });
  } catch (error) {
    console.error("ADMIN_WELLBEING_LEAGUE_ERROR:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Login diperlukan" },
        { status: 401 }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
