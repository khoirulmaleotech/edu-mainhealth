import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export const dynamic = 'force-dynamic';

const uri = process.env.MONGODB_URI;

// Helper: rank severity strings untuk perbandingan
function severityRank(severity) {
  const map = { critical: 4, high: 3, medium: 2, moderate: 2, low: 1 };
  return map[severity?.toLowerCase()] ?? 0;
}

// Helper: mapping severity DB → label UI
function severityToRiskLabel(severity) {
  const s = severity?.toLowerCase();
  if (s === "high" || s === "critical") return "Tinggi";
  if (s === "medium" || s === "moderate") return "Sedang";
  return "Rendah";
}

// Helper: mapping status DB → label UI
function statusToLabel(status) {
  if (status === "pending") return "Menunggu";
  if (status === "resolved" || status === "closed") return "Selesai";
  return "Diproses"; // in_progress, dll.
}

// Tambahkan parameter request untuk mengambil query params (search, page, limit)
export async function GET(request) {
  const client = new MongoClient(uri);
  try {
    const session = await getServerSession(authOptions);

    // Guard: hanya school_admin yang boleh akses dashboard sekolah
    if (!session?.user?.id || session.user.role !== "school_admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    // ─────────────────────────────────────────────────────────────
    // BACA PARAMETER PAGINATION & SEARCH DARI URL
    // ─────────────────────────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const skip = (page - 1) * limit;

    await client.connect();
    const db = client.db();

    // ─────────────────────────────────────────────────────────────
    // Resolve schoolId dari koleksi schools.
    // session.user TIDAK menyimpan school_id secara langsung untuk
    // role school_admin; kita cari dokumen sekolah berdasarkan
    // schools.admin_id === session.user.id.
    // ─────────────────────────────────────────────────────────────
    const adminObjectId = new ObjectId(session.user.id);

    const school = await db
      .collection("schools")
      .findOne(
        { admin_id: adminObjectId },
        { projection: { _id: 1 } }, // hanya butuh _id
      );

    if (!school) {
      return NextResponse.json(
        { success: false, message: "Sekolah tidak ditemukan untuk akun ini" },
        { status: 404 },
      );
    }

    const schoolId = school._id; // ObjectId — siap dipakai di query berikutnya

    // ─────────────────────────────────────────────────────────────
    // 1. STAT CARDS
    // ─────────────────────────────────────────────────────────────

    // Total Siswa Aktif → users[role=student, school_id]
    const totalStudents = await db
      .collection("users")
      .countDocuments({ role: "student", school_id: schoolId });

    // Guru Terhubung → users[role=teacher, school_id]
    // Catatan: ini mencakup semua guru di sekolah (wali kelas & BK)
    const totalTeachers = await db
      .collection("users")
      .countDocuments({ role: "teacher", school_id: schoolId });

    // Ambil semua student _id untuk sekolah ini (dipakai di query berikutnya)
    const students = await db
      .collection("users")
      .find({ role: "student", school_id: schoolId })
      .project({ _id: 1, fullname: 1, class_name: 1 })
      .toArray();

    const studentIds = students.map((s) => s._id);
    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

    // Total Laporan Insiden untuk sekolah ini
    const totalIncidents = studentIds.length
      ? await db
          .collection("incident_reports")
          .countDocuments({ reporter_id: { $in: studentIds } })
      : 0;

    const pendingIncidents = studentIds.length
      ? await db
          .collection("incident_reports")
          .countDocuments({
            reporter_id: { $in: studentIds },
            status: "pending",
          })
      : 0;

    // Siswa Risiko Tinggi → counselor_alerts[severity=high/critical, resolved=false]
    const highRiskStudents = studentIds.length
      ? await db.collection("counselor_alerts").countDocuments({
          student_id: { $in: studentIds },
          resolved: false,
          severity: { $in: ["high", "critical"] },
        })
      : 0;

    // ─────────────────────────────────────────────────────────────
    // 2. TABEL LAPORAN MASUK TERBARU (DENGAN SEARCH & PAGINATION)
    // ─────────────────────────────────────────────────────────────
    const pipeline = [
      { $match: { reporter_id: { $in: studentIds } } },
      {
        $lookup: {
          from: "users",
          localField: "reporter_id",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: { path: "$studentInfo", preserveNullAndEmptyArrays: true } }
    ];

    // Logika Search Server-Side
    if (search) {
      const statusRegexMap = [];
      if ("menunggu".includes(search)) statusRegexMap.push("pending");
      if ("selesai".includes(search)) statusRegexMap.push("resolved", "closed");
      if ("diproses".includes(search)) statusRegexMap.push("in_progress");

      const matchOr = [
        { "studentInfo.fullname": { $regex: search, $options: "i" } },
        { "studentInfo.class_name": { $regex: search, $options: "i" } },
        { incident_type: { $regex: search, $options: "i" } }
      ];

      if (statusRegexMap.length > 0) {
        matchOr.push({ status: { $in: statusRegexMap } });
      } else {
        matchOr.push({ status: { $regex: search, $options: "i" } });
      }

      pipeline.push({ $match: { $or: matchOr } });
    }

    // Hitung total data yang difilter untuk pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = studentIds.length ? await db.collection("incident_reports").aggregate(countPipeline).toArray() : [];
    const totalFiltered = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalFiltered / limit);

    // Terapkan sorting dan pagination ($skip & $limit)
    pipeline.push({ $sort: { created_at: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const rawIncidents = studentIds.length
      ? await db.collection("incident_reports").aggregate(pipeline).toArray()
      : [];

    // Ambil risk level tiap reporter dari counselor_alerts HANYA untuk hasil page ini
    const reporterIds = rawIncidents.map((r) => r.reporter_id);
    const alertsForReporters = reporterIds.length
      ? await db
          .collection("counselor_alerts")
          .find({ student_id: { $in: reporterIds }, resolved: false })
          .project({ student_id: 1, severity: 1 })
          .toArray()
      : [];

    // Map student_id → severity terburuk
    const reporterAlertMap = new Map();
    for (const alert of alertsForReporters) {
      const key = alert.student_id.toString();
      const existing = reporterAlertMap.get(key);
      if (!existing || severityRank(alert.severity) > severityRank(existing)) {
        reporterAlertMap.set(key, alert.severity);
      }
    }

    const incidentRows = rawIncidents.map((report) => {
      const reporterId = report.reporter_id?.toString();
      const student = report.studentInfo || studentMap.get(reporterId); 
      const severity = reporterAlertMap.get(reporterId);

      return {
        id: report._id.toString(),
        reporterId,
        name: student?.fullname ?? "Siswa Tidak Dikenal",
        class: student?.class_name ?? "-",
        type: report.incident_type,
        status: statusToLabel(report.status),
        risk: severityToRiskLabel(severity), // "Rendah" jika tidak ada alert aktif
        location: report.location,
        occurrenceTime: report.occurrence_time,
        createdAt: new Date(report.created_at).toISOString(),
      };
    });

    // ─────────────────────────────────────────────────────────────
    // 3. DISTRIBUSI RISIKO SISWA (untuk progress bar di sidebar)
    // ─────────────────────────────────────────────────────────────
    const allActiveAlerts = studentIds.length
      ? await db
          .collection("counselor_alerts")
          .find({ student_id: { $in: studentIds }, resolved: false })
          .project({ student_id: 1, severity: 1 })
          .toArray()
      : [];

    const studentWorstRisk = new Map();
    for (const alert of allActiveAlerts) {
      const key = alert.student_id.toString();
      const existing = studentWorstRisk.get(key);
      if (!existing || severityRank(alert.severity) > severityRank(existing)) {
        studentWorstRisk.set(key, alert.severity?.toLowerCase());
      }
    }

    let highCount = 0, mediumCount = 0, lowCount = 0;
    for (const [, sev] of studentWorstRisk) {
      if (sev === "high" || sev === "critical") highCount++;
      else if (sev === "medium" || sev === "moderate") mediumCount++;
      else lowCount++;
    }
    lowCount += totalStudents - studentWorstRisk.size;

    const riskDistribution =
      totalStudents > 0
        ? {
            low: Math.round((lowCount / totalStudents) * 100),
            medium: Math.round((mediumCount / totalStudents) * 100),
            high: Math.round((highCount / totalStudents) * 100),
          }
        : { low: 100, medium: 0, high: 0 };

    // ─────────────────────────────────────────────────────────────
    // IMPOSSIBLE: Tren Kesejahteraan ("Membaik" / "Memburuk")
    // Skema tidak menyimpan snapshot historis aggregat per sekolah.
    // mood_logs ada per siswa tapi tidak ada field "agregat mingguan" di schools.
    // Implementasi yang benar butuh scheduled job yang menyimpan snapshot
    // riskDistribution ke koleksi terpisah (misal: wellbeing_snapshots) dan
    // membandingkan periode ini vs periode sebelumnya.
    // ─────────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalIncidents,
        pendingIncidents,
        highRiskStudents,
      },
      incidentReports: incidentRows,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages: totalPages === 0 ? 1 : totalPages,
      },
      riskDistribution,
    });
  } catch (error) {
    console.error("SCHOOL_DASHBOARD_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}