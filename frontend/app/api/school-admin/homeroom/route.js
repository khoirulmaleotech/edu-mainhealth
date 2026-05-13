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

export async function GET(request) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    const { error, status, schoolId, schoolName } = await getSchoolAdminSession(db);
    if (error) return NextResponse.json({ success: false, message: error }, { status });

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // ─────────────────────────────────────────────────────────────
    // SUB-ROUTE: Ambil Siswa secara Pagination per Kelas
    // ─────────────────────────────────────────────────────────────
    if (action === "get_students") {
      const classId = searchParams.get("classId");
      const studentPage = parseInt(searchParams.get("studentPage") || "1", 10);
      const studentLimit = parseInt(searchParams.get("studentLimit") || "6", 10);
      const skip = (studentPage - 1) * studentLimit;

      const studentQuery = {
        role: "student",
        $or: [
          { class_id: new ObjectId(classId) },
          { class_id: classId }
        ]
      };

      const totalStudents = await db.collection("users").countDocuments(studentQuery);
      const totalPages = Math.ceil(totalStudents / studentLimit);

      const students = await db.collection("users")
        .find(studentQuery)
        .project({ fullname: 1 })
        .sort({ fullname: 1 })
        .skip(skip)
        .limit(studentLimit)
        .toArray();

      return NextResponse.json({
        success: true,
        students: students.map(s => ({ _id: s._id.toString(), fullname: s.fullname })),
        pagination: {
          page: studentPage,
          limit: studentLimit,
          total: totalStudents,
          totalPages: totalPages === 0 ? 1 : totalPages
        }
      });
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE UTAMA: Ambil Kelas secara Pagination + Global Search
    // ─────────────────────────────────────────────────────────────
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const skip = (page - 1) * limit;

    const classQuery = { school_id: schoolId };

    // Logika Pencarian: Kelas, Guru, atau Murid
    if (search) {
      // 1. Cari Guru yang cocok
      const matchingTeachers = await db.collection("users").find({
        role: "teacher",
        $or: [{ school_id: schoolId }, { school_id: schoolId.toString() }],
        fullname: { $regex: search, $options: "i" }
      }).project({ _id: 1 }).toArray();

      const teacherIds = matchingTeachers.map((t) => t._id);
      const teacherIdsString = matchingTeachers.map((t) => t._id.toString());

      // 2. Cari Murid yang cocok
      const matchingStudents = await db.collection("users").find({
        role: "student",
        $or: [{ school_id: schoolId }, { school_id: schoolId.toString() }],
        fullname: { $regex: search, $options: "i" },
        class_id: { $nin: [null, ""] }
      }).project({ class_id: 1 }).toArray();

      const validStudentClassIds = [];
      matchingStudents.forEach((s) => {
        try {
          if (typeof s.class_id === 'string' && ObjectId.isValid(s.class_id)) {
            validStudentClassIds.push(new ObjectId(s.class_id));
          } else if (s.class_id instanceof ObjectId) {
            validStudentClassIds.push(s.class_id);
          }
        } catch(e) {}
      });

      // Gabungkan kriteria pencarian dengan $or
      const orConditions = [{ name: { $regex: search, $options: "i" } }];
      if (teacherIds.length > 0 || teacherIdsString.length > 0) {
        orConditions.push({ homeroom_teacher_id: { $in: [...teacherIds, ...teacherIdsString] } });
      }
      if (validStudentClassIds.length > 0) {
        orConditions.push({ _id: { $in: validStudentClassIds } });
      }

      classQuery.$or = orConditions;
    }

    const totalFilteredClasses = await db.collection("classes").countDocuments(classQuery);
    const totalPages = Math.ceil(totalFilteredClasses / limit);

    // Ambil Kelas
    const classes = await db.collection("classes")
      .find(classQuery)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Fetch Semua Guru untuk dropdown form
    const teachers = await db.collection("users")
      .find({ role: "teacher", $or: [{ school_id: schoolId }, { school_id: schoolId.toString() }] })
      .project({ fullname: 1 })
      .toArray();
    const teacherMap = new Map(teachers.map((t) => [t._id.toString(), t]));

    // Fetch Murid Belum Masuk Kelas (Unassigned)
    const unassignedCursor = await db.collection("users").find({
      role: "student",
      $or: [{ school_id: schoolId }, { school_id: schoolId.toString() }],
      class_id: { $in: [null, ""] }
    }).project({ fullname: 1 }).toArray();

    // Hitung total siswa per kelas menggunakan Aggregation
    const classIdsObj = classes.map(c => new ObjectId(c._id));
    const classIdsString = classes.map(c => c._id.toString());
    
    let studentCountMap = {};
    if (classes.length > 0) {
      const studentCounts = await db.collection("users").aggregate([
        { 
          $match: { 
            role: "student", 
            $or: [{ class_id: { $in: classIdsObj } }, { class_id: { $in: classIdsString } }] 
          } 
        },
        { $group: { _id: "$class_id", count: { $sum: 1 } } }
      ]).toArray();

      studentCounts.forEach(sc => {
        studentCountMap[sc._id.toString()] = sc.count;
      });
    }

    // Statistik Global
    const totalClassesCount = await db.collection("classes").countDocuments({ school_id: schoolId });
    const totalAssignedStudents = await db.collection("users").countDocuments({
      role: "student",
      $or: [{ school_id: schoolId }, { school_id: schoolId.toString() }],
      class_id: { $nin: [null, ""] }
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

    return NextResponse.json({
      success: true,
      schoolName,
      classes: enrichedClasses,
      teachers: teachers.map((t) => ({ _id: t._id.toString(), fullname: t.fullname })),
      unassignedStudents: unassignedCursor.map((s) => ({ _id: s._id.toString(), fullname: s.fullname })),
      summary: {
        totalClasses: totalClassesCount,
        totalTeachers: teachers.length,
        assignedStudents: totalAssignedStudents,
        unassignedStudents: unassignedCursor.length,
      },
      pagination: {
        page,
        limit,
        total: totalFilteredClasses,
        totalPages: totalPages === 0 ? 1 : totalPages,
      }
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