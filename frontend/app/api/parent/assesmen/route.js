import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MongoClient } from "mongodb";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export const dynamic = "force-dynamic";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI belum tersedia");
}

export async function POST(request) {
  let client;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();
    const answers = body.answers || {};

    client = new MongoClient(uri);

    await client.connect();

    const db = client.db();
    const score = Object.values(answers).reduce(
      (acc, curr) => acc + Number(curr),
      0
    );

    let level = "low";

    let title = "Kondisi Emosional Stabil";

    let recommendations = [];

    if (score >= 7) {
      level = "high";

      title = "Perlu Perhatian Lebih";

      recommendations = [
        "Luangkan waktu mendengarkan cerita anak tanpa menghakimi",
        "Kurangi tekanan akademik atau aktivitas berlebihan sementara",
        "Pantau pola tidur, emosi, dan interaksi sosial anak",
        "Bangun komunikasi yang lebih hangat dan terbuka",
        "Pertimbangkan konsultasi dengan psikolog profesional",
      ];
    } else if (score >= 4) {
      level = "medium";

      title = "Perlu Pendampingan";

      recommendations = [
        "Ajak anak melakukan aktivitas menyenangkan bersama",
        "Perhatikan perubahan emosi atau perilaku anak",
        "Batasi penggunaan gadget secara berlebihan",
        "Berikan ruang aman agar anak nyaman bercerita",
      ];
    } else {
      level = "low";

      title = "Kondisi Relatif Baik";

      recommendations = [
        "Pertahankan komunikasi positif dengan anak",
        "Terus dukung aktivitas dan minat anak",
        "Bangun rutinitas sehat dan seimbang",
      ];
    }

    const assessment = {
      parent_email: session.user.email,

      answers,

      score,

      level,

      title,

      recommendations,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db
      .collection("parent_assessments")
      .insertOne(assessment);

    return NextResponse.json({
      success: true,

      result: {
        score,
        level,
        title,
        recommendations,
      },
    });

  } catch (error) {
    console.error(
      "PARENT ASSESSMENT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Server error",
      },
      {
        status: 500,
      }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}