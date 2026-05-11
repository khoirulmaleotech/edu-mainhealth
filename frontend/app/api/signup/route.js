import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      fullname,
      email,
      password,
      role,
      institution_id,
      institution_name,
      sipp_number,
      student_email,    // ← BARU: khusus role parent
    } = body;

    if (!fullname || !email || !password || !role) {
      return NextResponse.json({ message: "Data wajib diisi semua." }, { status: 400 });
    }

    await client.connect();
    const db = client.db();

    // Cek email duplikat
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar di sistem." }, { status: 400 });
    }

    // ── VALIDASI KHUSUS PARENT ──────────────────────────────────────────
    let studentDoc = null;
    if (role === 'parent') {
      if (!student_email) {
        return NextResponse.json({ message: "Email anak wajib diisi." }, { status: 400 });
      }

      // Pastikan siswa sudah terdaftar dan benar-benar role student
      studentDoc = await db.collection('users').findOne({
        email: student_email.toLowerCase(),
        role: 'student',
      });

      if (!studentDoc) {
        return NextResponse.json({
          message: "Akun siswa dengan email tersebut tidak ditemukan. Pastikan anak Anda sudah mendaftar terlebih dahulu."
        }, { status: 404 });
      }

      // Cegah duplikasi: satu siswa hanya boleh punya 1 pending/active request per orang tua
      const existingLink = await db.collection('family_links').findOne({
        student_id: studentDoc._id,
        parent_email: email.toLowerCase(),
        status: { $in: ['pending', 'active'] },
      });

      if (existingLink) {
        return NextResponse.json({
          message: "Permintaan koneksi ke siswa ini sudah ada sebelumnya."
        }, { status: 400 });
      }
    }
    // ────────────────────────────────────────────────────────────────────

    const hashedPassword = await hash(password, 12);

    const newUser = {
      fullname,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      is_verified: role === 'psychologist' ? false : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (role === 'psychologist') {
      newUser.work_at = institution_name;
      newUser.sipp = sipp_number;
    } else if (role === 'parent') {
      // Parent tidak perlu school_id — relasinya lewat family_links
    } else {
      if (!institution_id) {
        return NextResponse.json({ message: "Asal sekolah wajib dipilih." }, { status: 400 });
      }
      newUser.school_id = new ObjectId(institution_id);
    }

    // Simpan user baru
    const result = await db.collection('users').insertOne(newUser);
    const newParentId = result.insertedId;

    // ── BUAT FAMILY LINK (jika parent) ─────────────────────────────────
    if (role === 'parent' && studentDoc) {
      await db.collection('family_links').insertOne({
        parent_id: newParentId,
        parent_email: email.toLowerCase(),         // redundan, untuk query cepat
        student_id: studentDoc._id,
        student_email: student_email.toLowerCase(), // redundan, untuk query cepat
        school_id: studentDoc.school_id ?? null,
        status: 'pending',   // pending | active | rejected | revoked
        requested_at: new Date(),
        responded_at: null,
        createdAt: new Date(),
      });

      // TODO: Kirim notifikasi ke siswa (push notif / email)
      // await sendNotificationToStudent(studentDoc._id, newParentId);
    }
    // ────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      message: role === 'parent'
        ? "Pendaftaran berhasil. Permintaan koneksi telah dikirim ke akun anak Anda untuk disetujui."
        : "Pendaftaran berhasil.",
      userId: newParentId,
    }, { status: 201 });

  } catch (error) {
    console.error("❌ SIGNUP_ERROR:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server.", error: error.message },
      { status: 500 }
    );
  }
}