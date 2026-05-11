import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const uri = process.env.MONGODB_URI;

export async function GET() {
  const client = new MongoClient(uri);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    await client.connect();
    const db = client.db();
    const teacherId = session.user.id;

    const students = await db
      .collection("users")
      //.find({ role: "student" })
      .find({ role: "student", homeroom_teacher_id: new ObjectId(teacherId) })
      .project({ fullname: 1, class_name: 1 })
      .toArray();

    const studentIds = students.map((s) =>
      s._id instanceof ObjectId ? s._id : new ObjectId(s._id),
    );

    // Ambil SEMUA dokumen dari critical_chat_logs (semua isinya sudah pasti kritis)
    const criticalEvents = studentIds.length
      ? await db
          .collection("critical_chat_logs")
          .find({ student_id: { $in: studentIds } })
          .sort({ createdAt: -1 })
          .toArray()
      : [];

    console.log(
      `[ALERTS] Students: ${students.length}, Critical logs: ${criticalEvents.length}`,
    );

    // Buat Map untuk lookup cepat student
    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

    const alerts = criticalEvents.map((event) => {
      const student = studentMap.get(event.student_id.toString());

      if (!student) {
        console.warn(
          `[ALERTS] student_id ${event.student_id} tidak ditemukan di users!`,
        );
      }

      return {
        id: event._id.toString(),
        student: student?.fullname || "Siswa Tidak Dikenal",
        class: student?.class_name || "Kelas Tidak Terdefinisi",
        type: "Peringatan Sistem AI",
        risk: "High",
        time: new Date(event.createdAt).toISOString(),
        desc: "Sistem AI mendeteksi indikasi krisis emosional atau tingkat stres tinggi. Detail obrolan dirahasiakan demi privasi anak. Mohon segera lakukan pendekatan personal kepada siswa yang bersangkutan.",
        status: event.status || "pending_review",
      };
    });

    return NextResponse.json({
      success: true,
      teacherId,
      students,
      alerts,
      summary: {
        totalAlerts: alerts.length,
        pendingReview: alerts.filter((a) => a.status === "pending_review")
          .length,
        totalStudents: students.length,
      },
    });
  } catch (error) {
    console.error("TEACHER_ALERTS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
