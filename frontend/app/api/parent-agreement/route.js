import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { metadata, assessment_scores, agreement_signed } = body;

    if (!metadata?.parent_name || !metadata?.child_name || !metadata?.agreement_date) {
      return NextResponse.json(
        { success: false, message: "Identitas penandatanganan berkas tidak lengkap." },
        { status: 400 }
      );
    }

    if (!assessment_scores || typeof assessment_scores !== "object" || Object.keys(assessment_scores).length !== 10) {
      return NextResponse.json(
        { success: false, message: "Data butir kuesioner self-assessment tidak lengkap atau tidak valid." },
        { status: 400 }
      );
    }

    // ── MASTER DATA PERNYATAAN UNTUK DISIMPAN KE MONGODB ──
    const assessmentQuestionsMapping = {
      1: "Saya mengetahui aplikasi AI yang digunakan anak saya.",
      2: "Saya berdiskusi dengan anak tentang apa yang mereka lihat di internet.",
      3: "Saya memberi contoh penggunaan gadget yang sehat.",
      4: "Saya memiliki aturan penggunaan gadget di rumah.",
      5: "Saya makan bersama keluarga tanpa gadget.",
      6: "Saya mengetahui akun media sosial yang digunakan anak.",
      7: "Saya lebih sering berdialog daripada memarahi terkait gadget.",
      8: "Saya memahami manfaat dan risiko AI bagi anak.",
      9: "Saya meluangkan waktu khusus berbicara dengan anak setiap hari.",
      10: "Saya mengajarkan etika dan tanggung jawab digital kepada anak."
    };

    const agreementPointsMapping = {
      point1: "Teknologi adalah alat, bukan tujuan hidup.",
      point2: "AI digunakan untuk belajar dan berkembang.",
      point3: "AI tidak digunakan untuk menyontek.",
      point4: "Kami akan berdiskusi terbuka tentang penggunaan teknologi.",
      point5: "Kami memiliki waktu khusus tanpa gadget.",
      point6: "Kami menjaga sopan santun dan etika digital.",
      point7: "Kami menghormati privasi dan keamanan data."
    };

    // 1. Validasi pengisian skor sekaligus memetakan teks pertanyaan ke nilai isian
    const detailedAssessmentRecords = {};
    let totalAssessmentScore = 0;

    for (const [qId, text] of Object.entries(assessmentQuestionsMapping)) {
      const scoreValue = Number(assessment_scores[qId]);
      if (isNaN(scoreValue) || scoreValue < 1 || scoreValue > 5) {
        return NextResponse.json(
          { success: false, message: `Nilai skor pada butir nomor ${qId} tidak valid.` },
          { status: 400 }
        );
      }
      totalAssessmentScore += scoreValue;
      detailedAssessmentRecords[`q_${qId}`] = {
        question_text: text,
        given_score: scoreValue
      };
    }

    // 2. Petakan teks lembar kesepakatan komitmen keluarga bersamanya
    const detailedAgreementRecords = {};
    for (const [pointId, text] of Object.entries(agreementPointsMapping)) {
      const isAgreed = agreement_signed[pointId] === true;
      detailedAgreementRecords[pointId] = {
        agreement_text: text,
        is_agreed: isAgreed
      };
    }

    // 3. Kalkulasi parameter interpretasi tingkat kesiapan parenting di sisi server
    let statusTitle = "";
    let statusLabel = "";

    if (totalAssessmentScore >= 41 && totalAssessmentScore <= 50) {
      statusTitle = "Orang Tua Adaptif Digital";
      statusLabel = "GREEN";
    } else if (totalAssessmentScore >= 31 && totalAssessmentScore <= 40) {
      statusTitle = "Orang Tua Berkembang";
      statusLabel = "YELLOW";
    } else if (totalAssessmentScore >= 20 && totalAssessmentScore <= 30) {
      statusTitle = "Orang Tua Waspada";
      statusLabel = "ORANGE";
    } else {
      statusTitle = "Orang Tua Berisiko Tertinggal";
      statusLabel = "RED";
    }

    const client = await connectDB();
    const db = client.db();

    // 4. Masukkan seluruh bundel data terstruktur ke koleksi 'family_ai_agreements'
    await db.collection("family_ai_agreements").insertOne({
      metadata: {
        parent_name: metadata.parent_name.toUpperCase().trim(),
        child_name: metadata.child_name.toUpperCase().trim(),
        agreement_date: metadata.agreement_date
      },
      assessment: {
        detailed_responses: detailedAssessmentRecords,
        total_score: totalAssessmentScore,
        category: statusTitle,
        label: statusLabel
      },
      agreement: {
        detailed_signs: detailedAgreementRecords
      },
      createdAt: new Date()
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Seluruh berkas data komitmen kesepakatan keluarga beserta teks instrumen berhasil disimpan." 
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ ERROR_POST_FAMILY_AGREEMENT_WITH_QUESTIONS_LOG:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses penyimpanan berkas paket kesepakatan" }, 
      { status: 500 }
    );
  }
}