import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

const RISK_LEVELS = ["depresi sedang", "depresi berat", "depresi berat / sangat berat", "Depresi Sedang", "Depresi Berat"];
const CRITICAL_LEVELS = ["depresi berat", "depresi berat / sangat berat", "Depresi Berat"];
const POSITIVE_MOOD_VALUES = ["senang", "bahagia", "gembira", "baik", "happy", "excited", 4, 5];

const TALENT_NAMES_MAP = {
  "Kepemimpinan": "Leadership",
  "Seni & Kreatif": "Creative Thinking",
  "Logika & Riset": "Problem Solving",
  "Sosial & Empati": "Empathy",
  "Teknis & Praktis": "Technical Skill"
};

function computeStyles(ls) {
  const m = { Visual: 0, Kinestetik: 0, Auditori: 0, "Reading/Writing": 0 };
  ls.forEach(item => {
    const name = item._id || "Lainnya";
    const lower = name.toLowerCase();
    if (lower.includes("vis")) m.Visual += item.count;
    else if (lower.includes("kin")) m.Kinestetik += item.count;
    else if (lower.includes("aud")) m.Auditori += item.count;
    else m["Reading/Writing"] += item.count;
  });
  const total = Object.values(m).reduce((a, b) => a + b, 0) || 1;
  return [
    { name: "Visual", value: Math.round((m.Visual / total) * 100) || 50, color: "#3B82F6" },
    { name: "Kinestetik", value: Math.round((m.Kinestetik / total) * 100) || 25, color: "#10B981" },
    { name: "Auditori", value: Math.round((m.Auditori / total) * 100) || 15, color: "#F59E0B" },
    { name: "Reading/Writing", value: Math.round((m["Reading/Writing"] / total) * 100) || 10, color: "#EF4444" }
  ];
}

function computeBrain(bd) {
  const m = { Left: 0, Right: 0, Middle: 0 };
  bd.forEach(item => {
    const name = item._id || "Balanced";
    const lower = name.toLowerCase();
    if (lower.includes("kiri") || lower.includes("left")) m.Left += item.count;
    else if (lower.includes("kanan") || lower.includes("right")) m.Right += item.count;
    else m.Middle += item.count;
  });
  const total = Object.values(m).reduce((a, b) => a + b, 0) || 1;
  return [
    { name: "Analytical (Kiri)", value: Math.round((m.Left / total) * 100) || 40, color: "#10B981" },
    { name: "Balanced (Tengah)", value: Math.round((m.Middle / total) * 100) || 35, color: "#3B82F6" },
    { name: "Creative (Kanan)", value: Math.round((m.Right / total) * 100) || 25, color: "#F59E0B" }
  ];
}

function emptyData() {
  return {
    summary: {
      wellbeingIndex: 0,
      wellbeingIndexChange: 0,
      bullyingReduction: 0,
      bullyingCasesBaseline: 0,
      bullyingCasesCurrent: 0,
      riskReduction: 0,
      riskBaseline: 0,
      riskCurrent: 0,
      helpSeekingImprovement: 0,
      helpSeekingBaseline: 0,
      helpSeekingCurrent: 0,
      teacherEngagement: 0,
      teacherEngagementChange: 0
    },
    coverage: { activeSchools: 0, activeTeachers: 0, registeredStudents: 0 },
    kpiTable: [
      { kpi: "School Wellbeing Index", baseline: "0", current: "0", change: "0 poin", isPositive: true },
      { kpi: "Positive Mood", baseline: "0%", current: "0%", change: "0%", isPositive: true },
      { kpi: "High Risk Student (At Risk + Critical)", baseline: "0%", current: "0%", change: "0%", isPositive: true },
      { kpi: "Incident Bullying", baseline: "0 kasus", current: "0 kasus", change: "0%", isPositive: true },
      { kpi: "Student Help-Seeking", baseline: "0%", current: "0%", change: "0%", isPositive: true }
    ],
    wellbeingDist: [
      { name: "Flourishing (Kondisi Baik)", value: 0, color: "#10B981" },
      { name: "Monitoring (Perlu Pemantauan)", value: 0, color: "#F59E0B" },
      { name: "At Risk (Perlu Intervensi)", value: 0, color: "#3B82F6" },
      { name: "Critical (Tindakan Mendesak)", value: 0, color: "#EF4444" }
    ],
    riskFactors: [],
    learningStyles: [],
    learningStyleCounts: { total: 0 },
    careerInterests: [],
    careerInterestCounts: { total: 0 },
    brainPreference: [],
    brainPreferenceCounts: { total: 0 },
    talentIntelligence: [],
    talentIntelligenceCounts: { total: 0 },
    engagement: []
  };
}

export async function GET(request) {
  try {
    await requireRole(["admin", "superadmin"]);
    const client = await connectDB();
    const db = client.db();

    const { searchParams } = new URL(request.url);
    const citiesParam = searchParams.get("cities");

    let schoolFilter = { is_hide: { $ne: true, $ne: "true" } };
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

    const activeSchoolsDocs = await db.collection("schools").find(schoolFilter).project({ _id: 1 }).toArray();
    const activeSchoolIds = activeSchoolsDocs.map(s => s._id);
    const activeSchoolIdStrings = activeSchoolIds.map(id => id.toString());
    const allSchoolIdKeys = [...activeSchoolIds, ...activeSchoolIdStrings];

    const activeStudents = await db.collection("users").find({
      role: "student",
      school_id: { $in: allSchoolIdKeys }
    }).project({ _id: 1, email: 1 }).toArray();

    const totalTeachers = await db.collection("users").countDocuments({
      role: "teacher",
      school_id: { $in: allSchoolIdKeys }
    });

    const totalStudents = activeStudents.length;

    if (totalStudents === 0) {
      return NextResponse.json({ success: true, data: emptyData() });
    }

    const studentObjIds = activeStudents.map(s => s._id);
    const studentStrIds = studentObjIds.map(id => id.toString());
    const studentEmails = activeStudents.map(s => s.email?.toLowerCase()).filter(Boolean);
    const allStudentIdKeys = [...studentObjIds, ...studentStrIds];

    const [
      tilikDiriDocs,
      moodLogsDocs,
      learningStyleDocs,
      brainDominanceDocs,
      riasecDocs,
      talentDocs,
      incidentReportsDocs,
      criticalChatLogsCount,
      activeChatsCount
    ] = await Promise.all([
      db.collection("student_tilik_diri").find({
        $or: [
          { student_id: { $in: allStudentIdKeys } },
          { "student_data._id": { $in: allStudentIdKeys } }
        ]
      }).toArray(),
      db.collection("mood_logs").find({ student_id: { $in: allStudentIdKeys } }).toArray(),
      db.collection("student_learning_style").find({ student_id: { $in: allStudentIdKeys } }).toArray(),
      db.collection("student_brain_dominance").find({ student_id: { $in: allStudentIdKeys } }).toArray(),
      db.collection("student_riasec").find({ student_id: { $in: allStudentIdKeys } }).toArray(),
      db.collection("student_talents").find({ student_id: { $in: allStudentIdKeys } }).toArray(),
      db.collection("incident_reports").find({
        $or: [
          { reporter_id: { $in: allStudentIdKeys } },
          { reporter_email: { $in: studentEmails } }
        ]
      }).toArray(),
      db.collection("critical_chat_logs").countDocuments({ student_id: { $in: allStudentIdKeys } }),
      db.collection("chat_rooms").countDocuments({ patient_id: { $in: allStudentIdKeys } })
    ]);

    const totalAssessments = tilikDiriDocs.length;
    let totalTilikScore = 0;
    let atRiskCount = 0;
    let criticalCount = 0;

    tilikDiriDocs.forEach(doc => {
      totalTilikScore += Number(doc.totalScore || 0);
      const lvl = (doc.severity?.level || "").toLowerCase();
      if (RISK_LEVELS.some(r => r.toLowerCase() === lvl)) atRiskCount++;
      if (CRITICAL_LEVELS.some(c => c.toLowerCase() === lvl)) criticalCount++;
    });

    const avgScore = totalAssessments > 0 ? (totalTilikScore / totalAssessments) : 0;
    const schoolWellbeingIndex = avgScore > 0 ? Math.round((avgScore / 30) * 100) : 0;
    const riskPercentage = totalAssessments > 0 ? Math.round(((atRiskCount) / totalAssessments) * 100) : 0;

    const flourishingCount = Math.max(0, totalAssessments - atRiskCount);
    const monitoringCount = Math.max(0, atRiskCount - criticalCount);
    const flourishingPct = totalAssessments > 0 ? Math.round((flourishingCount / totalAssessments) * 100) : 0;
    const monitoringPct = totalAssessments > 0 ? Math.round((monitoringCount / totalAssessments) * 100) : 0;
    const atRiskPct = totalAssessments > 0 ? Math.round((monitoringCount / totalAssessments) * 100) : 0;
    const criticalPct = totalAssessments > 0 ? Math.round((criticalCount / totalAssessments) * 100) : 0;

    const totalMoodLogs = moodLogsDocs.length;
    const positiveMoodLogs = moodLogsDocs.filter(m => POSITIVE_MOOD_VALUES.some(v => String(v).toLowerCase() === String(m.mood).toLowerCase())).length;
    const positiveMoodRate = totalMoodLogs > 0 ? Math.round((positiveMoodLogs / totalMoodLogs) * 100) : 0;

    const totalIncidentReports = incidentReportsDocs.length;
    const helpSeekingRate = criticalChatLogsCount > 0 ? Math.round((activeChatsCount / criticalChatLogsCount) * 100) : 0;

    const lsCounts = { Visual: 0, Kinestetik: 0, Auditori: 0, "Reading/Writing": 0 };
    learningStyleDocs.forEach(d => {
      const cat = (d.hasil_dominan?.category || d.dominan || "").toLowerCase();
      if (cat.includes("vis")) lsCounts.Visual++;
      else if (cat.includes("kin")) lsCounts.Kinestetik++;
      else if (cat.includes("aud")) lsCounts.Auditori++;
      else if (cat) lsCounts["Reading/Writing"]++;
    });
    const lsTotal = Object.values(lsCounts).reduce((a, b) => a + b, 0) || 1;
    const learningStyles = [
      { name: "Visual", value: Math.round((lsCounts.Visual / lsTotal) * 100), count: lsCounts.Visual, color: "#3B82F6" },
      { name: "Kinestetik", value: Math.round((lsCounts.Kinestetik / lsTotal) * 100), count: lsCounts.Kinestetik, color: "#10B981" },
      { name: "Auditori", value: Math.round((lsCounts.Auditori / lsTotal) * 100), count: lsCounts.Auditori, color: "#F59E0B" },
      { name: "Reading/Writing", value: Math.round((lsCounts["Reading/Writing"] / lsTotal) * 100), count: lsCounts["Reading/Writing"], color: "#EF4444" }
    ];

    const bdCounts = { Left: 0, Right: 0, Middle: 0 };
    brainDominanceDocs.forEach(d => {
      const dom = (d.dominasi || "").toLowerCase();
      if (dom.includes("kiri") || dom.includes("left")) bdCounts.Left++;
      else if (dom.includes("kanan") || dom.includes("right")) bdCounts.Right++;
      else if (dom) bdCounts.Middle++;
    });
    const bdTotal = Object.values(bdCounts).reduce((a, b) => a + b, 0) || 1;
    const brainPreference = [
      { name: "Analytical (Kiri)", value: Math.round((bdCounts.Left / bdTotal) * 100), count: bdCounts.Left, color: "#10B981" },
      { name: "Balanced (Tengah)", value: Math.round((bdCounts.Middle / bdTotal) * 100), count: bdCounts.Middle, color: "#3B82F6" },
      { name: "Creative (Kanan)", value: Math.round((bdCounts.Right / bdTotal) * 100), count: bdCounts.Right, color: "#F59E0B" }
    ];

    // 6. RIASEC / Career Interests
    const RIASEC_MAP = {
      "INVESTIGATIF": "AI & Technology",
      "INVESTIGATIVE": "AI & Technology",
      "REALISTIK": "Engineering",
      "REALISTIC": "Engineering",
      "ARTISTIK": "Creative Industry",
      "ARTISTIC": "Creative Industry",
      "SOSIAL": "Education",
      "SOCIAL": "Education",
      "ENTERPRISING": "Business",
      "KONVENSIONAL": "Healthcare",
      "CONVENTIONAL": "Healthcare"
    };
    const riasecCounts = {};
    riasecDocs.forEach(d => {
      const cat = (d.peringkat1?.category || d.hasil_dominan?.category || d.category || "Other").toUpperCase();
      const name = RIASEC_MAP[cat] || cat;
      riasecCounts[name] = (riasecCounts[name] || 0) + 1;
    });
    const riasecTotal = riasecDocs.length || 1;
    const careerInterests = Object.entries(riasecCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / riasecTotal) * 100),
      count
    })).sort((a, b) => b.value - a.value);

    // 7. Risk Factors from Incident Reports
    const riskCounts = {};
    incidentReportsDocs.forEach(d => {
      const cat = d.incident_type || d.category || "Lainnya";
      riskCounts[cat] = (riskCounts[cat] || 0) + 1;
    });
    const riskTotal = incidentReportsDocs.length || 1;
    const riskFactors = Object.entries(riskCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / riskTotal) * 100)
    })).sort((a, b) => b.value - a.value);

    const talentCounts = {};
    talentDocs.forEach(d => {
      if (Array.isArray(d.scores) && d.scores.length > 0) {
        const top = [...d.scores].sort((a, b) => (b.value || 0) - (a.value || 0))[0];
        if (top?.subject) {
          const name = TALENT_NAMES_MAP[top.subject] || top.subject;
          talentCounts[name] = (talentCounts[name] || 0) + 1;
        }
      }
    });
    const talentTotal = talentDocs.length || 1;
    const talentIntelligence = Object.entries(talentCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / talentTotal) * 100),
      count
    })).sort((a, b) => b.value - a.value);

    const uniqueMoodStudents = new Set(moodLogsDocs.map(d => String(d.student_id))).size;
    const uniqueTilikStudents = new Set(tilikDiriDocs.map(d => String(d.student_id || d.student_data?._id))).size;
    const uniqueLearningStudents = new Set(learningStyleDocs.map(d => String(d.student_id))).size;
    const uniqueRiasecStudents = new Set(riasecDocs.map(d => String(d.student_id))).size;
    const uniqueBrainStudents = new Set(brainDominanceDocs.map(d => String(d.student_id))).size;
    const uniqueTalentStudents = new Set(talentDocs.map(d => String(d.student_id))).size;

    const engagement = [
      { name: "Log In", value: 100 },
      { name: "Mood Check", value: Math.round((uniqueMoodStudents / totalStudents) * 100) },
      { name: "Screening Tilik Diri", value: Math.round((uniqueTilikStudents / totalStudents) * 100) },
      { name: "Tes Gaya Belajar", value: Math.round((uniqueLearningStudents / totalStudents) * 100) },
      { name: "Tes Karir (RIASEC)", value: Math.round((uniqueRiasecStudents / totalStudents) * 100) },
      { name: "Tes Otak Kanan-Kiri", value: Math.round((uniqueBrainStudents / totalStudents) * 100) },
      { name: "Talent Mapping", value: Math.round((uniqueTalentStudents / totalStudents) * 100) }
    ];

    const kpiTable = [
      { kpi: "School Wellbeing Index", baseline: "0", current: `${schoolWellbeingIndex}`, change: `${schoolWellbeingIndex} poin`, isPositive: schoolWellbeingIndex >= 0 },
      { kpi: "Positive Mood", baseline: "0%", current: `${positiveMoodRate}%`, change: `${positiveMoodRate}%`, isPositive: positiveMoodRate >= 0 },
      { kpi: "High Risk Student (At Risk + Critical)", baseline: "0%", current: `${riskPercentage}%`, change: `${riskPercentage}%`, isPositive: riskPercentage <= 16 },
      { kpi: "Incident Bullying", baseline: "0 kasus", current: `${totalIncidentReports} kasus`, change: `${totalIncidentReports} kasus`, isPositive: totalIncidentReports === 0 },
      { kpi: "Student Help-Seeking", baseline: "0%", current: `${helpSeekingRate}%`, change: `${helpSeekingRate}%`, isPositive: helpSeekingRate >= 0 }
    ];

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          wellbeingIndex: schoolWellbeingIndex,
          wellbeingIndexChange: schoolWellbeingIndex,
          bullyingReduction: totalIncidentReports > 0 ? Math.round((totalIncidentReports / totalStudents) * 100) : 0,
          bullyingCasesBaseline: 0,
          bullyingCasesCurrent: totalIncidentReports,
          riskReduction: riskPercentage,
          riskBaseline: 0,
          riskCurrent: riskPercentage,
          helpSeekingImprovement: helpSeekingRate,
          helpSeekingBaseline: 0,
          helpSeekingCurrent: helpSeekingRate,
          teacherEngagement: totalTeachers > 0 && activeSchoolsDocs.length > 0 ? Math.min(100, Math.round((totalTeachers / activeSchoolsDocs.length) * 15)) : 0,
          teacherEngagementChange: 0
        },
        coverage: {
          activeSchools: activeSchoolsDocs.length,
          activeTeachers: totalTeachers,
          registeredStudents: totalStudents
        },
        kpiTable,
        wellbeingDist: [
          { name: "Flourishing (Kondisi Baik)", value: flourishingPct, color: "#10B981" },
          { name: "Monitoring (Perlu Pemantauan)", value: monitoringPct, color: "#F59E0B" },
          { name: "At Risk (Perlu Intervensi)", value: atRiskPct, color: "#3B82F6" },
          { name: "Critical (Tindakan Mendesak)", value: criticalPct, color: "#EF4444" }
        ],
        riskFactors,
        learningStyles,
        learningStyleCounts: { total: learningStyleDocs.length },
        careerInterests,
        careerInterestCounts: { total: riasecDocs.length },
        brainPreference,
        brainPreferenceCounts: { total: brainDominanceDocs.length },
        talentIntelligence,
        talentIntelligenceCounts: { total: talentDocs.length },
        engagement
      }
    });

  } catch (error) {
    console.error("ADMIN_WELLBEING_LEAGUE_ERROR:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Login diperlukan" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
