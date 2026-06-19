import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["admin", "superadmin"]);
    const client = await connectDB();
    const db = client.db();

    // Fetch latest incident reports
    const incidents = await db.collection("incident_reports")
      .find({})
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    // Fetch latest counselor alerts
    const alerts = await db.collection("counselor_alerts")
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Map into unified activities
    const activities = [
      ...incidents.map(i => ({
        id: i._id.toString(),
        type: "incident",
        title: "Laporan Insiden Baru",
        description: `${i.incident_type} di ${i.location}`,
        status: i.status,
        date: i.created_at || i.updated_at,
        href: "/dashboard/admin/reports"
      })),
      ...alerts.map(a => ({
        id: a._id.toString(),
        type: "alert",
        title: "Peringatan Konselor",
        description: `Tipe: ${a.type} | Prioritas: ${a.severity}`,
        status: a.resolved ? "resolved" : "pending",
        date: a.createdAt,
        href: "/dashboard/admin/reports" // Or wherever alerts are viewed
      }))
    ];

    // Sort combined by date descending
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Return top 10
    const topActivities = activities.slice(0, 10);

    return NextResponse.json(
      { success: true, data: topActivities },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("ADMIN_ACTIVITIES_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
