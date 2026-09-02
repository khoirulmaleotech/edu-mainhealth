import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/requiredRole";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/critical-chat-logs
 * 
 * Retrieves statistics on severe indicators and anonymous critical log messages.
 * Query Parameters:
 * - page: number (default 1)
 * - limit: number (default 10)
 * - severity: string filter (e.g., 'high', 'critical', 'medium', 'low')
 * - status: string filter (e.g., 'pending_review', 'reviewed', etc.)
 * - is_critical: boolean string ('true' | 'false')
 */
export async function GET(request) {
  try {
    await requireRole(["admin", "superadmin"]);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const severityFilter = searchParams.get("severity");
    const statusFilter = searchParams.get("status");
    const isCriticalFilter = searchParams.get("is_critical");

    const database = (await connectDB()).db();
    const collection = database.collection("critical_chat_logs");

    // Build filter query for list
    const matchQuery = {};
    if (severityFilter) {
      matchQuery.severity = severityFilter;
    }
    if (statusFilter) {
      matchQuery.status = statusFilter;
    }
    if (isCriticalFilter !== null && isCriticalFilter !== undefined && isCriticalFilter !== "") {
      matchQuery.is_critical = isCriticalFilter === "true";
    }

    const [result = { total: [], countsBySeverity: [], logs: [] }] = await collection
      .aggregate([
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: "$severity",
                  count: { $sum: 1 },
                },
              },
            ],
            totalLogs: [
              {
                $count: "count",
              },
            ],
            totalSevereLogs: [
              {
                $match: {
                  $or: [
                    { severity: "high" },
                    { severity: "critical" },
                    { is_critical: true },
                  ],
                },
              },
              {
                $count: "count",
              },
            ],
            logs: [
              { $match: matchQuery },
              { $sort: { createdAt: -1, _id: -1 } },
              { $skip: skip },
              { $limit: limit },
              {
                // Explicitly project anonymous fields, excluding student_id or sensitive identifiers
                $project: {
                  _id: 1,
                  critical_message: 1,
                  is_critical: 1,
                  severity: 1,
                  risk_types: 1,
                  risk_reason: 1,
                  detected_language: 1,
                  source: 1,
                  status: 1,
                  createdAt: 1,
                  reviewed_at: 1,
                  // Anonymous conversation (only roles, content, createdAt)
                  conversation: {
                    $map: {
                      input: "$conversation",
                      as: "msg",
                      in: {
                        role: "$$msg.role",
                        content: "$$msg.content",
                        createdAt: "$$msg.createdAt",
                      },
                    },
                  },
                },
              },
            ],
            filteredCount: [
              { $match: matchQuery },
              { $count: "count" },
            ],
          },
        },
      ])
      .toArray();

    const totalSevereCount = result.totalSevereLogs?.[0]?.count || 0;
    const totalLogsCount = result.totalLogs?.[0]?.count || 0;
    const filteredTotal = result.filteredCount?.[0]?.count || 0;

    // Severity breakdown map
    const severityBreakdown = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    if (Array.isArray(result.summary)) {
      result.summary.forEach((item) => {
        if (item._id && severityBreakdown.hasOwnProperty(item._id)) {
          severityBreakdown[item._id] = item.count;
        } else if (item._id) {
          severityBreakdown[item._id] = item.count;
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalSevereIndicators: totalSevereCount,
          totalLogs: totalLogsCount,
          severityBreakdown,
        },
        pagination: {
          page,
          limit,
          total: filteredTotal,
          totalPages: Math.ceil(filteredTotal / limit),
        },
        logs: result.logs || [],
      },
    });
  } catch (error) {
    console.error("ADMIN_CRITICAL_CHAT_LOGS_ERROR:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Login diperlukan" },
        { status: 401 }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Endpoint ini hanya untuk admin." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/critical-chat-logs
 * Updates status or teacher note for a specific log entry.
 */
export async function PATCH(request) {
  try {
    const session = await requireRole(["admin", "superadmin"]);

    const body = await request.json();
    const { id, status, teacher_note } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "ID log tidak valid" },
        { status: 400 }
      );
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (teacher_note !== undefined) updateFields.teacher_note = teacher_note;

    updateFields.reviewed_by = session.user.id;
    updateFields.reviewed_at = new Date();

    const database = (await connectDB()).db();
    const result = await database.collection("critical_chat_logs").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Log tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Berhasil memperbarui status log",
    });
  } catch (error) {
    console.error("ADMIN_CRITICAL_CHAT_LOGS_PATCH_ERROR:", error);

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
