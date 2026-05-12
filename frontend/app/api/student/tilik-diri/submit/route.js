import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import nodemailer from "nodemailer";

const uri = process.env.MONGODB_URI;
const mailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});
// TUNGGU TEXT YANG BENAR DARI MBA HEGGY
function getSeverityEmailMeta(severityCode) {
  if (severityCode === "mild") {
    return {
      color: "#22c55e",
      title: "Hasil Bagus, tetap jaga ya!",
      message:
        "Kamu menunjukkan tanda-tanda yang ringan. Terus lakukan hal-hal positif yang membuat harimu lebih nyaman.",
      nextStep:
        "Tetap ceritakan perasaanmu kepada orang dewasa kepercayaan jika kamu butuh.",
    };
  }
  if (severityCode === "moderate") {
    return {
      color: "#0284c7",
      title: "Ayo perhatikan lebih serius",
      message:
        "Hasilmu menunjukkan perhatian sedang. Ini waktu yang baik untuk mulai ngobrol dengan guru BK atau konselor.",
      nextStep: "Coba atur waktu bicara dengan orang dewasa yang kamu percaya.",
    };
  }
  if (severityCode === "severe") {
    return {
      color: "#f97316",
      title: "Perlu bantu lebih cepat",
      message:
        "Jawabanmu menunjukkan kondisi berat. Ayo segera minta dukungan dari konselor atau orang dewasa terdekat.",
      nextStep:
        "Buka dashboard dan hubungi konselor sekolah untuk mendapatkan bantuan lebih cepat.",
    };
  }
  return {
    color: "#ef4444",
    title: "Segera minta bantuan",
    message:
      "Hasil ini sangat mendesak. Segera cari bantuan dari guru, konselor, atau orang tua yang kamu percaya.",
    nextStep:
      "Kalau bisa, bicarakan sekarang juga dengan orang dewasa yang dapat membantu.",
  };
}

function buildTilikDiriEmailHtml({
  name,
  score,
  severity,
  needsUrgentAttention,
}) {
  const meta = getSeverityEmailMeta(severity.code);
  const severityLabel = severity.level;
  const dashboardUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return `<!DOCTYPE html>
<html lang="id">
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter, Arial, sans-serif;color:#334155;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px;">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 60px rgba(15,23,42,.08);">
            <tr>
              <td style="background:${meta.color};padding:32px 32px 24px;color:#ffffff;text-align:center;">
                <h1 style="margin:0;font-size:28px;letter-spacing:.02em;">Hasil Tilik Diri</h1>
                <p style="margin:12px 0 0;font-size:16px;opacity:.9;">Hai ${name || "Sahabat"}, ini ringkasan kondisi yang kamu isi.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px 24px;">
                <div style="border-radius:20px;border:1px solid #e2e8f0;padding:18px;background:#f8fafc;">
                  <p style="margin:0;font-size:14px;color:#64748b;">Skor Asesmen</p>
                  <p style="margin:8px 0 0;font-size:28px;font-weight:800;color:#0f172a;">${score} / 30</p>
                </div>

                <div style="margin:24px 0 0;padding:22px;border-radius:20px;background:${meta.color}10;border:1px solid ${meta.color};">
                  <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${meta.color};font-weight:700;">${severityLabel}</p>
                  <h2 style="margin:12px 0 0;font-size:20px;color:#0f172a;">${meta.title}</h2>
                  <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#475569;">${meta.message}</p>
                </div>

                <div style="margin:24px 0 0;padding:22px;border-radius:20px;background:#f8fafc;border:1px solid #e2e8f0;">
                  <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#334155;">Rekomendasi</p>
                  <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">${meta.nextStep}</p>
                  ${needsUrgentAttention ? `<p style="margin:16px 0 0;font-size:13px;color:#b91c1c;font-weight:700;">Jika kamu merasa kesulitan, jangan tunggu. Hubungi konselor atau orang dewasa sekarang juga.</p>` : ""}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;">
                <a href="${dashboardUrl}/dashboard/student" style="display:inline-block;width:100%;text-align:center;padding:16px 0;border-radius:16px;background:${meta.color};color:#ffffff;font-weight:700;text-decoration:none;font-size:15px;">Kembali ke Website</a>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:24px 32px 28px;color:#64748b;font-size:13px;line-height:1.7;">
                <p style="margin:0 0 8px;">Terima kasih sudah mengisi asesmen Tilik Diri. Jawabanmu membantu kami mendukung kesejahteraanmu.</p>
                <p style="margin:0;">Jika butuh, minta teman atau keluarga untuk menemanimu membaca email ini.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ─── Severity Classification ────────────────────────────────────────────────
// Total score range: 0–30 (10 questions × max 3)
//
//  Ringan       0 – 10   → monitor mandiri, edukasi
//  Sedang      11 – 16   → sesi konseling terjadwal
//  Berat       17 – 20   → konseling segera
//  Sangat Berat 21 – 30  → rujukan / penanganan mendesak

function classifySeverity(score) {
  if (score <= 10) {
    return {
      level: "Ringan",
      code: "mild",
      action: "monitor",
      color: "bg-emerald-400",
    };
  }
  if (score <= 16) {
    return {
      level: "Sedang",
      code: "moderate",
      action: "counseling_scheduled",
      color: "bg-sky-400",
    };
  }
  if (score <= 20) {
    return {
      level: "Berat",
      code: "severe",
      action: "counseling_urgent",
      color: "bg-orange-500",
    };
  }
  return {
    level: "Sangat Berat",
    code: "very_severe",
    action: "immediate_referral",
    color: "bg-red-500",
  };
}

// ─── POST /api/student/tilik-diri/submit ────────────────────────────────────

export async function POST(request) {
  const client = new MongoClient(uri);
  try {
    // ── Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { answers, openEnded } = await request.json();

    // ── Basic validation
    if (!Array.isArray(answers) || answers.length !== 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak lengkap. Pastikan semua pertanyaan terjawab.",
        },
        { status: 400 },
      );
    }

    const userId = new ObjectId(session.user.id);

    // ── Score
    const totalScore = answers.reduce(
      (sum, a) => sum + (Number(a.score) || 0),
      0,
    );
    const severity = classifySeverity(totalScore);

    // ── Sensitive flag: Q9 (self-harm) or Q10 (harm others) answered ≥ 2
    const needsUrgentAttention =
      answers.some(
        (a) => (a.questionId === 9 || a.questionId === 10) && a.score >= 2,
      ) ||
      severity.code === "severe" ||
      severity.code === "very_severe";

    // ── Per-question detail for counselor view
    const breakdown = answers.map((a) => ({
      questionId: a.questionId,
      score: a.score,
      isSensitive: a.questionId === 9 || a.questionId === 10,
    }));

    // ── Document
    const assessmentDoc = {
      student_id: userId,
      type: "tilik_diri",
      totalScore,
      maxScore: 30,
      severity: {
        level: severity.level,
        code: severity.code,
        color: severity.color,
      },
      recommendedAction: severity.action,
      needsUrgentAttention,
      breakdown,
      openEnded: {
        feelings: openEnded?.feelings?.trim() ?? "",
        thoughts: openEnded?.thoughts?.trim() ?? "",
        behaviors: openEnded?.behaviors?.trim() ?? "",
      },
      completedAt: new Date(),
      reviewedByCounselor: false,
    };

    await client.connect();
    const db = client.db();

    // ── Upsert asesmen (satu dokumen per siswa, dapat diperbarui)
    await db
      .collection("student_tilik_diri")
      .updateOne(
        { student_id: userId },
        { $set: assessmentDoc },
        { upsert: true },
      );

    // ── Update student_stats untuk widget dashboard
    await db.collection("student_stats").updateOne(
      { student_id: userId },
      {
        $set: {
          tilik_diri_completed: true,
          tilik_diri_score: totalScore,
          tilik_diri_severity: severity.level,
          tilik_diri_severity_code: severity.code,
          tilik_diri_completed_at: new Date(),
          needs_counselor_attention: needsUrgentAttention,
        },
      },
      { upsert: true },
    );

    // ── Kirim email hasil asesmen ke akun siswa
    try {
      const studentEmail = session.user.email;
      const studentName = session.user.name || "Sahabat";
      if (studentEmail) {
        await mailTransporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
          to: studentEmail,
          subject: `Hasil Asesmen Tilik Diri — ${severity.level}`,
          html: buildTilikDiriEmailHtml({
            name: studentName,
            score: totalScore,
            severity,
            needsUrgentAttention,
          }),
        });
      }
    } catch (emailError) {
      console.error("[tilik-diri/email]", emailError);
    }

    // ── Buat alert untuk dashboard konselor jika mendesak
    if (needsUrgentAttention) {
      await db.collection("counselor_alerts").updateOne(
        { student_id: userId, type: "tilik_diri_urgent" },
        {
          $set: {
            student_id: userId,
            type: "tilik_diri_urgent",
            severity: severity.level,
            severityCode: severity.code,
            totalScore,
            createdAt: new Date(),
            resolved: false,
          },
        },
        { upsert: true },
      );
    }

    return NextResponse.json({
      success: true,
      severity: severity.level,
      needsUrgentAttention,
    });
  } catch (error) {
    console.error("[tilik-diri/submit]", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
