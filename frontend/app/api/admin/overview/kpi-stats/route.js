import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["admin", "superadmin"]);
    const client = await connectDB();
    const database = client.db();

    // 1. Activation Stats
    const totalStudents = await database.collection("users").countDocuments({ role: "student" });
    const verifiedStudents = await database.collection("users").countDocuments({ role: "student", is_verified: true });

    // 2. Active Student Stats
    const uniqueMoodUsers = await database.collection("mood_logs").distinct("student_id");
    const uniqueTilikDiriUsers = await database.collection("student_tilik_diri").distinct("student_id");
    const uniqueLearningStyleUsers = await database.collection("student_learning_style").distinct("student_id");
    const uniqueRiasecUsers = await database.collection("student_riasec").distinct("student_id");
    const uniqueBrainDominanceUsers = await database.collection("student_brain_dominance").distinct("student_id");
    const uniqueTalentUsers = await database.collection("student_talents").distinct("student_id");
    const uniqueReportUsers = await database.collection("incident_reports").distinct("reporter_id");
    const uniqueCriticalChatUsers = await database.collection("critical_chat_logs").distinct("student_id");

    const allActiveUserIds = new Set([
      ...uniqueMoodUsers.map(id => id.toString()),
      ...uniqueTilikDiriUsers.map(id => id.toString()),
      ...uniqueLearningStyleUsers.map(id => id.toString()),
      ...uniqueRiasecUsers.map(id => id.toString()),
      ...uniqueBrainDominanceUsers.map(id => id.toString()),
      ...uniqueTalentUsers.map(id => id.toString()),
      ...uniqueReportUsers.map(id => id.toString()),
      ...uniqueCriticalChatUsers.map(id => id.toString())
    ]);

    const activeStudentsCount = allActiveUserIds.size;
    
    // Percentages
    const activationPercentage = totalStudents > 0 ? (verifiedStudents / totalStudents) * 100 : 0;
    const activeActivityPercentage = totalStudents > 0 ? (activeStudentsCount / totalStudents) * 100 : 0;

    // Mood Participation Rate (Target >= 70% active students)
    const uniqueMoodCount = uniqueMoodUsers.length;
    const moodParticipationPercentage = activeStudentsCount > 0 ? (uniqueMoodCount / activeStudentsCount) * 100 : 0;

    // AI Wellbeing Assistant Access
    const criticalLogsCount = await database.collection("critical_chat_logs").countDocuments();
    const chatRoomsCount = await database.collection("chat_rooms").countDocuments();
    const uniqueChatRoomsStudents = await database.collection("chat_rooms").distinct("patient_id");

    // Anonymous Reporting
    const incidentReportsCount = await database.collection("incident_reports").countDocuments();
    const uniqueIncidentReportersCount = uniqueReportUsers.length;

    return NextResponse.json(
      {
        success: true,
        data: {
          activation: {
            totalStudents,
            verifiedStudents,
            activeStudentsCount,
            activationPercentage: Math.round(activationPercentage * 100) / 100,
            activeActivityPercentage: Math.round(activeActivityPercentage * 100) / 100,
          },
          mood: {
            uniqueMoodCount,
            moodParticipationPercentage: Math.round(moodParticipationPercentage * 100) / 100,
          },
          ai: {
            criticalLogsCount,
            chatRoomsCount,
            uniqueChatRoomsStudentsCount: uniqueChatRoomsStudents.length,
          },
          reports: {
            incidentReportsCount,
            uniqueIncidentReportersCount,
          }
        }
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      }
    );
  } catch (error) {
    console.error("ADMIN_KPI_STATS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
