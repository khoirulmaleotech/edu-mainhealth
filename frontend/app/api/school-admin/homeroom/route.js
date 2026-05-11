import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const uri = process.env.MONGODB_URI;

// Ambil school dari collection schools berdasarkan admin_id
async function getSchoolAdminSession(db) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "school_admin") {
    return { error: "Akses ditolak", status: 403 };
  }

  const adminId = new ObjectId(session.user.id);

  const school = await db
    .collection("schools")
    .findOne({ admin_id: adminId });

  if (!school) {
    return { error: "Sekolah untuk admin ini tidak ditemukan", status: 403 };
  }

  return {
    adminId: session.user.id,
    schoolId: school._id,
    schoolName: school.name,
  };
}

// GET — Ambil semua kelas + guru + jumlah siswa milik sekolah ini
export async function GET() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    const { error, status, schoolId, schoolName } = await getSchoolAdminSession(db);
    if (error) return NextResponse.json({ success: false, message: error }, { status });

    const [classes, teachers, students] = await Promise.all([
      db.collection("classes")
        .find({ school_id: schoolId })
        .sort({ name: 1 })
        .toArray(),
      db.collection("users")
        .find({ role: "teacher", $or: [{ school_id: schoolId }, { school_id: schoolId.toString() }] })
        .project({ fullname: 1 })
        .toArray(),
      db.collection("users")
        .find({ role: "student", $or: [{ school_id: schoolId }, { school_id: schoolId.toString() }] })
        .project({ fullname: 1, class_id: 1, class_name: 1, homeroom_teacher_id: 1 })
        .toArray(),
    ]);

    const teacherMap = new Map(teachers.map((t) => [t._id.toString(), t]));
    const studentCountMap = {};
    students.forEach((s) => {
      const key = s.class_id?.toString();
      if (key) studentCountMap[key] = (studentCountMap[key] || 0) + 1;
    });

    const enrichedClasses = classes.map((cls) => ({
      ...cls,
      _id: cls._id.toString(),
      school_id: cls.school_id.toString(),
      homeroom_teacher_id: cls.homeroom_teacher_id?.toString() || null,
      homeroom_teacher_name: cls.homeroom_teacher_id
        ? (teacherMap.get(cls.homeroom_teacher_id.toString())?.fullname || "Guru tidak ditemukan")
        : null,
      student_count: studentCountMap[cls._id.toString()] || 0,
    }));

    const unassignedStudents = students
      .filter((s) => !s.class_id)
      .map((s) => ({ _id: s._id.toString(), fullname: s.fullname }));

    const studentsByClass = {};
    students.forEach((s) => {
      if (!s.class_id) return;
      const key = s.class_id.toString();
      if (!studentsByClass[key]) studentsByClass[key] = [];
      studentsByClass[key].push({ _id: s._id.toString(), fullname: s.fullname });
    });

    return NextResponse.json({
      success: true,
      schoolName,
      classes: enrichedClasses,
      teachers: teachers.map((t) => ({ _id: t._id.toString(), fullname: t.fullname })),
      unassignedStudents,
      studentsByClass,
      summary: {
        totalClasses: classes.length,
        totalTeachers: teachers.length,
        assignedStudents: students.filter((s) => s.class_id).length,
        unassignedStudents: unassignedStudents.length,
      },
    });
  } catch (error) {
    console.error("HOMEROOM_GET_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST — Buat kelas baru
export async function POST(request) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    const { error, status, schoolId } = await getSchoolAdminSession(db);
    if (error) return NextResponse.json({ success: false, message: error }, { status });

    const { name, academic_year } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: "Nama kelas wajib diisi" }, { status: 400 });
    }

    const existing = await db.collection("classes").findOne({
      school_id: schoolId,
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });
    if (existing) {
      return NextResponse.json({ success: false, message: "Nama kelas sudah ada" }, { status: 400 });
    }

    const result = await db.collection("classes").insertOne({
      name: name.trim(),
      school_id: schoolId,
      homeroom_teacher_id: null,
      academic_year:
        academic_year ||
        `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId.toString() });
  } catch (error) {
    console.error("HOMEROOM_POST_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
}

// PATCH — Berbagai aksi manajemen kelas
export async function PATCH(request) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    const { error, status, schoolId } = await getSchoolAdminSession(db);
    if (error) return NextResponse.json({ success: false, message: error }, { status });

    const { action, classId, ...payload } = await request.json();

    const validateClass = async (id) => {
      const cls = await db.collection("classes").findOne({
        _id: new ObjectId(id),
        school_id: schoolId,
      });
      if (!cls) throw new Error("Kelas tidak ditemukan atau bukan milik sekolah Anda");
      return cls;
    };

    // 1. Assign wali kelas
    if (action === "assign_teacher") {
      const { teacherId } = payload;
      const cls = await validateClass(classId);

      if (teacherId) {
        const teacher = await db.collection("users").findOne({
          _id: new ObjectId(teacherId),
          role: "teacher",
          $or: [{ school_id: schoolId }, { school_id: schoolId.toString() }],
        });
        if (!teacher) {
          return NextResponse.json(
            { success: false, message: "Guru tidak ditemukan di sekolah ini" },
            { status: 400 }
          );
        }
      }

      const newTeacherId = teacherId ? new ObjectId(teacherId) : null;

      await db.collection("classes").updateOne(
        { _id: new ObjectId(classId) },
        { $set: { homeroom_teacher_id: newTeacherId, updatedAt: new Date() } }
      );

      await db.collection("users").updateMany(
        { class_id: new ObjectId(classId) },
        { $set: { homeroom_teacher_id: newTeacherId, updatedAt: new Date() } }
      );

      return NextResponse.json({ success: true });
    }

    // 2. Assign siswa ke kelas (bulk)
    if (action === "assign_students") {
      const { studentIds } = payload;
      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return NextResponse.json(
          { success: false, message: "Pilih minimal 1 siswa" },
          { status: 400 }
        );
      }

      const cls = await validateClass(classId);
      const newTeacherId = cls.homeroom_teacher_id || null;
      const objIds = studentIds.map((id) => new ObjectId(id));

      const validCount = await db.collection("users").countDocuments({
        _id: { $in: objIds },
        role: "student",
        $or: [{ school_id: schoolId }, { school_id: schoolId.toString() }],
      });

      if (validCount !== studentIds.length) {
        return NextResponse.json(
          { success: false, message: "Beberapa siswa tidak valid" },
          { status: 400 }
        );
      }

      await db.collection("users").updateMany(
        { _id: { $in: objIds } },
        {
          $set: {
            class_id: new ObjectId(classId),
            class_name: cls.name,
            homeroom_teacher_id: newTeacherId,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({ success: true, assigned: studentIds.length });
    }

    // 3. Keluarkan siswa dari kelas
    if (action === "remove_student") {
      const { studentId } = payload;
      await validateClass(classId);

      await db.collection("users").updateOne(
        { _id: new ObjectId(studentId), class_id: new ObjectId(classId) },
        {
          $set: {
            class_id: null,
            class_name: null,
            homeroom_teacher_id: null,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({ success: true });
    }

    // 4. Rename kelas
    if (action === "rename_class") {
      const { name } = payload;
      if (!name?.trim()) {
        return NextResponse.json(
          { success: false, message: "Nama kelas tidak boleh kosong" },
          { status: 400 }
        );
      }

      await validateClass(classId);

      await db.collection("classes").updateOne(
        { _id: new ObjectId(classId) },
        { $set: { name: name.trim(), updatedAt: new Date() } }
      );

      await db.collection("users").updateMany(
        { class_id: new ObjectId(classId) },
        { $set: { class_name: name.trim(), updatedAt: new Date() } }
      );

      return NextResponse.json({ success: true });
    }

    // 5. Hapus kelas
    if (action === "delete_class") {
      await validateClass(classId);

      await db.collection("users").updateMany(
        { class_id: new ObjectId(classId) },
        {
          $set: {
            class_id: null,
            class_name: null,
            homeroom_teacher_id: null,
            updatedAt: new Date(),
          },
        }
      );

      await db.collection("classes").deleteOne({ _id: new ObjectId(classId) });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: "Aksi tidak dikenali" },
      { status: 400 }
    );
  } catch (error) {
    console.error("HOMEROOM_PATCH_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
}