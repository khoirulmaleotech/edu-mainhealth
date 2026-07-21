import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import nodemailer from "nodemailer";

const uri = process.env.MONGODB_URI;

const mailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Langsung tembak server Google agar tidak lari ke 127.0.0.1
  port: 465,              // Port 465 jauh lebih aman dan stabil untuk Google SMTP
  secure: true,           // true untuk port 465 (SSL murni)
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
});

function getSeverityEmailMeta(severityCode) {
  if (severityCode === "mild") {
    return {
      color: "#22c55e",
      title: "Depresi Ringan",
      message: `
        <p>Halo Sobat,</p>
        <p>Terima kasih sudah mengisi Asesmen Tilik Diri dengan jujur dan terbuka. Berdasarkan hasil asesmen, saat ini terdapat beberapa tanda yang mengarah pada gejala depresi ringan.</p>
        <p>Kondisi ini bisa muncul ketika seseorang sedang merasa lelah, tertekan, kehilangan semangat, atau menghadapi banyak pikiran dalam waktu tertentu. Hal tersebut bukan berarti kamu lemah atau gagal. Banyak orang juga pernah mengalami fase seperti ini.</p>
        <p>Yang penting sekarang adalah mulai lebih memperhatikan kondisi dirimu sendiri. Cobalah memberi waktu untuk beristirahat, menjaga pola tidur, makan dengan teratur, mengurangi tekanan berlebihan pada diri sendiri, serta tetap melakukan aktivitas yang membuatmu merasa nyaman dan bermakna.</p>
        <p>Kamu juga tidak harus menghadapi semuanya sendirian. Jika ada hal yang mengganggu pikiranmu, cobalah bercerita kepada orang yang kamu percaya, seperti orang tua, guru, teman dekat, atau konselor sekolah.</p>
        <p>Semoga kamu terus bertumbuh menjadi pribadi yang lebih kuat dan semakin mengenal dirimu sendiri. Terima kasih karena sudah berani peduli terhadap kesehatan mentalmu.</p>
      `,
      nextStep: "Salam hangat,<br/>Tim Pendamping Asesmen Tilik Diri",
    };
  }

  if (severityCode === "moderate") {
    return {
      color: "#0284c7",
      title: "Depresi Sedang",
      message: `
        <p>Halo Sobat,</p>
        <p>Terima kasih sudah mengisi Asesmen Tilik Diri dengan jujur. Berdasarkan hasil asesmen, saat ini terdeteksi adanya gejala depresi pada tingkat sedang.</p>
        <p>Kami memahami bahwa akhir-akhir ini mungkin ada banyak hal yang terasa berat, melelahkan, atau mengganggu pikiran dan perasaanmu.</p>
        <p>Mungkin kamu merasa lebih mudah sedih, kehilangan semangat, sulit fokus, merasa lelah terus-menerus, atau merasa sendirian menghadapi semuanya.</p>
        <p>Perasaan seperti ini penting untuk diperhatikan dan tidak dibiarkan berlarut terlalu lama. Kamu tidak harus menanggung semuanya sendiri.</p>
        <p>Cobalah mulai memberikan perhatian lebih pada kondisi dirimu:</p>
        <ul>
          <li>menjaga pola tidur dan makan,</li>
          <li>mengurangi tekanan yang terlalu berat,</li>
          <li>beristirahat ketika lelah,</li>
          <li>dan tetap terhubung dengan orang-orang yang membuatmu merasa aman dan didengar.</li>
        </ul>
        <p>Jika perasaan ini mulai mengganggu kegiatan sehari-hari, sekolah, hubungan dengan orang lain, atau membuatmu semakin merasa terpuruk, sangat disarankan untuk mulai mencari bantuan dan dukungan.</p>
        <p>Kamu bisa berbicara dengan orang tua, wali, guru BK, konselor sekolah, atau tenaga profesional seperti psikolog dan konselor.</p>
        <p>Tidak apa-apa untuk meminta bantuan. Justru itu adalah langkah berani untuk menjaga diri sendiri.</p>
        <p>Percayalah bahwa kondisi ini bisa dilalui sedikit demi sedikit. Kamu tidak sendirian, dan selalu ada orang yang siap membantu.</p>
      `,
      nextStep: "Salam hangat,<br/>Tim Pendamping Asesmen Tilik Diri",
    };
  }

  if (severityCode === "severe" || severityCode === "very_severe") {
    return {
      color: "#ef4444",
      title: "Depresi Berat / Sangat Berat",
      message: `
        <p>Halo Sobat,</p>
        <p>Terima kasih karena sudah berani dan jujur mengisi Asesmen Tilik Diri. Kami memahami bahwa mungkin ada banyak hal yang sedang terasa sangat berat untuk kamu hadapi akhir-akhir ini.</p>
        <p>Berdasarkan hasil asesmen, saat ini terdeteksi adanya gejala depresi pada tingkat berat/sangat berat.</p>
        <p>Kondisi ini menunjukkan bahwa kamu mungkin sedang mengalami tekanan emosional yang cukup besar dan membutuhkan perhatian serta dukungan lebih lanjut.</p>
        <p>Pertama-tama, penting untuk kamu tahu bahwa apa yang kamu rasakan saat ini bukan tanda bahwa kamu lemah, gagal, atau tidak berharga.</p>
        <p>Ketika seseorang menghadapi tekanan, kesedihan, kelelahan emosional, atau masalah yang berlangsung cukup lama, kondisi mentalnya memang bisa sangat terdampak.</p>
        <p>Kamu juga tidak harus melewati fase ini sendirian.</p>
        <p>Kami sangat menyarankan agar kamu segera mencari dukungan dari:</p>
        <ul>
          <li>orang tua atau keluarga,</li>
          <li>guru atau wali kelas,</li>
          <li>guru BK/konselor sekolah,</li>
          <li>psikolog,</li>
          <li>atau tenaga profesional lainnya.</li>
        </ul>
        <p>Jika kamu merasa sangat kewalahan, kehilangan harapan, atau memiliki pikiran untuk menyakiti diri sendiri, mohon jangan memendamnya sendirian.</p>
        <p>Percayalah bahwa kondisi ini tidak akan selalu terasa seperti sekarang. Fase yang berat ini bisa dilalui perlahan dengan dukungan, bantuan, dan waktu.</p>
        <p>Kamu berharga, dan perasaanmu penting. Terima kasih sudah bertahan sejauh ini.</p>
      `,
      nextStep: "Salam hangat,<br/>Tim Pendamping Asesmen Tilik Diri",
    };
  }

  return {
    color: "#22c55e",
    title: "Tidak Terdeteksi Adanya Depresi",
    message: `
      <p>Halo Sobat,</p>
      <p>Terima kasih sudah meluangkan waktu untuk mengisi Asesmen Tilik Diri dengan jujur.</p>
      <p>Berdasarkan hasil asesmen yang kamu isi, saat ini tidak terdeteksi adanya gejala depresi yang signifikan dalam dirimu.</p>
      <p>Ini adalah hal yang baik dan patut diapresiasi. Artinya, secara umum kamu masih mampu menjalani aktivitas sehari-hari dan menghadapi tantangan yang ada dengan cukup baik.</p>
      <p>Namun demikian, menjaga kesehatan mental tetap penting dilakukan, sama seperti menjaga kesehatan fisik.</p>
      <p>Tetaplah memberikan ruang untuk dirimu beristirahat, melakukan hal-hal yang kamu sukai, menjaga hubungan baik dengan orang-orang terdekat, serta berbicara dengan orang yang dipercaya ketika sedang merasa lelah atau memiliki masalah.</p>
      <p>Ingat bahwa setiap orang bisa mengalami masa sulit dalam hidupnya, dan meminta bantuan bukanlah tanda kelemahan.</p>
      <p>Semoga kamu terus tumbuh menjadi pribadi yang sehat, kuat, dan mampu menjaga dirimu dengan baik.</p>
      <p>Terima kasih sudah peduli terhadap kondisi dirimu sendiri.</p>
    `,
    nextStep: "Salam hangat,<br/>Tim Pendamping Asesmen Tilik Diri",
  };
}

function buildTilikDiriEmailHtml({ name, score, severity, needsUrgentAttention }) {
  const meta = getSeverityEmailMeta(severity.code);
  const severityLabel = severity.level;
  const dashboardUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return `<!DOCTYPE html>
<html lang="id">
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial, sans-serif;color:#334155;">
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
                  <div style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#475569;">${meta.message}</div>
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

function classifySeverity(score) {
  if (score <= 4) {
    return { level: "Tidak Terdeteksi", code: "normal", action: "self_care", color: "#10b981" };
  }
  if (score <= 9) {
    return { level: "Depresi Ringan", code: "mild", action: "monitor", color: "#22c55e" };
  }
  if (score <= 14) {
    return { level: "Depresi Sedang", code: "moderate", action: "counseling_scheduled", color: "#0284c7" };
  }
  return { level: "Depresi Berat / Sangat Berat", code: "severe", action: "immediate_support", color: "#ef4444" };
}

export async function POST(request) {
  const client = new MongoClient(uri);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { answers, openEnded } = await request.json();

    if (!Array.isArray(answers) || answers.length !== 10) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap. Pastikan semua pertanyaan terjawab." },
        { status: 400 }
      );
    }

    const userId = new ObjectId(session.user.id);
    const totalScore = answers.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
    const severity = classifySeverity(totalScore);

    const needsUrgentAttention =
      answers.some((a) => (a.questionId === 9 || a.questionId === 10) && a.score >= 2) ||
      severity.code === "severe" ||
      severity.code === "very_severe";

    const breakdown = answers.map((a) => ({
      questionId: a.questionId,
      score: a.score,
      isSensitive: a.questionId === 9 || a.questionId === 10,
    }));

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

    await db.collection("student_tilik_diri").updateOne(
      { student_id: userId },
      { $set: assessmentDoc },
      { upsert: true }
    );

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
      { upsert: true }
    );

    // ── PROSES PENGIRIMAN EMAIL SINKRON ──
    try {
      const studentEmail = session.user.email;
      const studentName = session.user.name || "Sahabat";
      
      if (studentEmail) {
        await mailTransporter.sendMail({
          from: `"EduMind Support" <${process.env.EMAIL_USERNAME || "edumind8@gmail.com"}>`,
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
      console.error("❌ [TILIK_DIRI_EMAIL_INTERNAL_ERROR]:", emailError);
    }

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
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      severity: severity.level,
      needsUrgentAttention,
    });
  } catch (error) {
    console.error("[tilik-diri/submit]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
}