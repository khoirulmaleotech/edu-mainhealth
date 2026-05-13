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

export async function GET() {
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
    // incident_reports tidak punya school_id langsung → filter via reporter_id ∈ studentIds
    // CATATAN: Asumsi reporter adalah siswa sekolah ini. Laporan dari guru/anonim luar
    // tidak akan tertangkap — ini limitasi skema saat ini.
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
    // 2. TABEL LAPORAN MASUK TERBARU
    // ─────────────────────────────────────────────────────────────

    const rawIncidents = studentIds.length
      ? await db
          .collection("incident_reports")
          .find({ reporter_id: { $in: studentIds } })
          .sort({ created_at: -1 })
          .limit(10)
          .toArray()
      : [];

    // Ambil risk level tiap reporter dari counselor_alerts (unresolved, severity terburuk)
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
      const student = studentMap.get(reporterId);
      const severity = reporterAlertMap.get(reporterId);

      // CATATAN: Skema incident_reports tidak memiliki field is_anonymous.
      // Logika "Anonim (#ID-XXX)" sepenuhnya dihandle di frontend berdasarkan
      // kebijakan privasi; API mengembalikan reporterId agar frontend bisa
      // membuat ID anonim yang konsisten (misal: hash/ID acak per session).
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

        // IMPOSSIBLE: evidence_url tidak dikembalikan di list view.
        // File media harus diakses via endpoint terpisah dengan auth check
        // untuk menghindari eksposur langsung URL storage bucket sekolah.
        // evidence_url: report.evidence_url,
      };
    });

    // ─────────────────────────────────────────────────────────────
    // 3. DISTRIBUSI RISIKO SISWA (untuk progress bar di sidebar)
    // ─────────────────────────────────────────────────────────────

    // Ambil semua counselor_alerts aktif (unresolved) untuk siswa sekolah ini
    const allActiveAlerts = studentIds.length
      ? await db
          .collection("counselor_alerts")
          .find({ student_id: { $in: studentIds }, resolved: false })
          .project({ student_id: 1, severity: 1 })
          .toArray()
      : [];

    // Deduplikasi: tiap siswa hanya dihitung sekali (severity terburuk)
    const studentWorstRisk = new Map();
    for (const alert of allActiveAlerts) {
      const key = alert.student_id.toString();
      const existing = studentWorstRisk.get(key);
      if (!existing || severityRank(alert.severity) > severityRank(existing)) {
        studentWorstRisk.set(key, alert.severity?.toLowerCase());
      }
    }

    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const [, sev] of studentWorstRisk) {
      if (sev === "high" || sev === "critical") highCount++;
      else if (sev === "medium" || sev === "moderate") mediumCount++;
      else lowCount++;
    }
    // Siswa tanpa alert aktif → aman (low risk)
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
    //
    // const wellbeingTrend = await computeWellbeingTrend(db, schoolId, studentIds);
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
      riskDistribution,
      // wellbeingTrend: null, // IMPOSSIBLE: lihat komentar di atas
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