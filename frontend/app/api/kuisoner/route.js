import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { metadata, assessment_type, part_A, part_B, part_C } = body;

    if (!metadata?.email || !metadata?.school_name || !metadata?.student_class) {
      return NextResponse.json({ success: false, message: "Identitas tidak lengkap" }, { status: 400 });
    }

    const client = await connectDB();
    const db = client.db();

    await db.collection("wellbeing_camp_responses").insertOne({
      ...body,
      createdAt: new Date()
    });

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // Langsung tembak server Google agar tidak lari ke 127.0.0.1
        port: 465,              // Port 465 jauh lebih aman dan stabil untuk Google SMTP
        secure: true,           // true untuk port 465 (SSL murni)
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        },
      });

    const titleTest = assessment_type === "pre_test" ? "Pre-Test" : "Post-Test";

    const emailHtmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6;">
        <div style="background-color: #00adb5; padding: 30px; text-align: center; border-radius: 20px 20px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">EduMind Wellbeing Camp</h1>
          <p style="color: #e2f8f9; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; font-weight: bold; tracking-wide">Riwayat Isian ${titleTest}</p>
        </div>
        
        <div style="padding: 30px; background-color: #f8fafc; border: 1px solid #f1f5f9;">
          <h3 style="margin-top: 0; color: #1e293b;">Halo, Terima kasih telah mengisi kuesioner ini dengan jujur.</h3>
          <p style="font-size: 13px; color: #64748b;">Berikut adalah salinan dokumen jawaban resmi yang telah tersimpan dengan aman di sistem kami:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <tr style="background-color: #f1f5f9;"><td style="padding: 10px; font-weight: bold; width: 160px;">Asal Sekolah</td><td style="padding: 10px;">${metadata.school_name}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold;">Kelas</td><td style="padding: 10px;">${metadata.student_class}</td></tr>
            <tr style="background-color: #f1f5f9;"><td style="padding: 10px; font-weight: bold;">No. WhatsApp</td><td style="padding: 10px;">${metadata.whatsapp}</td></tr>
          </table>

          <h4 style="color: #00adb5; margin-top: 30px; border-bottom: 2px solid #00adb5; padding-bottom: 5px;">Bagian A: Well-Being</h4>
          <p style="font-size: 12px; color: #64748b;">(Skala 1 = Tidak Pernah s.d 5 = Sangat Sering)</p>
          <ul style="padding-left: 20px; font-size: 13px;">
            ${part_A.scaled_metrics ? Object.entries(part_A.scaled_metrics).map(([num, val]) => `<li style="margin-bottom: 6px;">Pertanyaan ${num}: <strong>Skala ${val}</strong></li>`).join("") : ""}
          </ul>
          <p style="font-size: 13px; margin-top: 15px;">Orang paling mungkin diajak bicara: <strong>${Array.isArray(part_A.most_likely_confidant) ? part_A.most_likely_confidant.join(", ") : part_A.most_likely_confidant} ${part_A.most_likely_confidant_others ? `(${part_A.most_likely_confidant_others})` : ""}</strong></p>
          <p style="font-size: 13px;">Tantangan terbesar remaja: <br/><i style="color: #475569;">"${part_A.biggest_teen_challenge || "-"}"</i></p>

          <h4 style="color: #00adb5; margin-top: 30px; border-bottom: 2px solid #00adb5; padding-bottom: 5px;">Bagian B: Paparan Perundungan (Bullying)</h4>
          <p style="font-size: 13px;">Pernah mengalami bullying (6 bulan terakhir): <strong>${part_B.experienced_bullying || "-"}</strong></p>
          <p style="font-size: 13px;">Pernah melakukan bullying (6 bulan terakhir): <strong>${part_B.perpetrated_bullying || "-"}</strong></p>
          <p style="font-size: 13px;">Bentuk bullying yang dialami: <strong>${Array.isArray(part_B.bullying_types_suffered) ? part_B.bullying_types_suffered.join(", ") : part_B.bullying_types_suffered || "-"} ${part_B.bullying_types_suffered_others ? `(${part_B.bullying_types_suffered_others})` : ""}</strong></p>
          <p style="font-size: 13px;">Frekuensi bullying di sekolah (1 minggu terakhir): <strong>${part_B.school_bullying_frequency_weekly || "-"}</strong></p>
          <p style="font-size: 13px;">Frekuensi cyberbullying (1 minggu terakhir): <strong>${part_B.cyberbullying_frequency_weekly || "-"}</strong></p>
          <p style="font-size: 13px;">Tempat cyberbullying sering terjadi: <strong>${Array.isArray(part_B.cyberbullying_platforms) ? part_B.cyberbullying_platforms.join(", ") : part_B.cyberbullying_platforms || "-"} ${part_B.cyberbullying_platforms_others ? `(${part_B.cyberbullying_platforms_others})` : ""}</strong></p>
          <p style="font-size: 13px;">Tindakan saat mengalami bullying: <strong>${Array.isArray(part_B.victim_coping_mechanism) ? part_B.victim_coping_mechanism.join(", ") : part_B.victim_coping_mechanism || "-"}</strong></p>

          <h4 style="color: #00adb5; margin-top: 30px; border-bottom: 2px solid #00adb5; padding-bottom: 5px;">Bagian C: Pemahaman Esai Pribadi</h4>
          <p style="font-size: 13px; font-weight: bold; margin-bottom: 2px;">25. Perbedaan Bullying vs Konflik Biasa:</p>
          <p style="font-size: 13px; color: #475569; margin-top: 0; font-style: italic;">"${part_C.bullying_vs_conflict_definition || "-"}"</p>
          
          <p style="font-size: 13px; font-weight: bold; margin-bottom: 2px;">26. Tanda Teman Mengalami Tekanan Emosional:</p>
          <p style="font-size: 13px; color: #475569; margin-top: 0; font-style: italic;">"${part_C.emotional_distress_signs_bystander || "-"}"</p>

          <p style="font-size: 13px; font-weight: bold; margin-bottom: 2px;">27. Tindakan Siswa Saat Melihat Teman Dibully:</p>
          <p style="font-size: 13px; color: #475569; margin-top: 0; font-style: italic;">"${part_C.bystander_intervention_action || "-"}"</p>

          <p style="font-size: 13px; font-weight: bold; margin-bottom: 2px;">28. Target Pencarian Bantuan & Alasan:</p>
          <p style="font-size: 13px; color: #475569; margin-top: 0; font-style: italic;">Target: ${part_C.help_seeking_target || "-"} <br/> Alasan: "${part_C.help_seeking_reason || "-"}"</p>

          <p style="font-size: 13px; font-weight: bold; margin-bottom: 2px;">29. Alasan Korban Memilih Diam:</p>
          <p style="font-size: 13px; color: #475569; margin-top: 0; font-style: italic;">"${part_C.victim_silence_reason || "-"}"</p>

          <p style="font-size: 13px; font-weight: bold; margin-bottom: 2px;">30. Rekomendasi Fasilitas Untuk Pihak Sekolah:</p>
          <p style="font-size: 13px; color: #475569; margin-top: 0; font-style: italic;">"${part_C.school_safe_environment_recommendation || "-"}"</p>
        </div>

        <div style="background-color: #e2e8f0; padding: 20px; text-align: center; border-radius: 0 0 20px 20px; font-size: 11px; color: #64748b;">
          <p style="margin: 0;">Email ini dikirim otomatis oleh Sistem Aplikasi Terintegrasi edumind.or.id</p>
          <p style="margin: 5px 0 0 0;">Lingkungan sekolah aman, nyaman, dan suportif demi masa depan cerah.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'EduMind Admin'}" <${process.env.EMAIL_SERVER_USER}>`,
      to: metadata.email.toLowerCase().trim(),
      subject: `[EduMind] Riwayat Isian Resmi Kuesioner ${titleTest} Well-Being Camp`,
      html: emailHtmlContent,
    });

    return NextResponse.json({ success: true, message: "Kuesioner terkirim dan riwayat isian telah dikirim ke email." }, { status: 201 });

  } catch (error) {
    console.error("ERROR_POST_WELLBEING_CAMP:", error);
    return NextResponse.json({ success: false, message: error.message || "Gagal memproses pengiriman kuesioner" }, { status: 500 });
  }
}