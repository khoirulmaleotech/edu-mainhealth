import { NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { getCareerJobById } from "@/lib/careerJobs";
import { connectDB } from "@/lib/mongodb";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const allowedFileTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
]);

const requiredTextFields = [
  "fullName",
  "nickName",
  "gender",
  "domicile",
  "whatsapp",
  "email",
  "educationLevel",
  "university",
  "graduationYear",
  "meaningfulExperience",
  "motivation",
  "projectBasedAvailability",
  "reachableCities",
  "healthyEducationMeaning",
  "expectation",
];

const requiredArrayFields = [
  "expertise",
  "activities",
  "educationExperiences",
  "educationIssues",
  "contributionAreas",
  "availability",
];

const LIST_PASSWORD = process.env.CARRIER_APPLICANTS_PASSWORD || "edumind2026#!";

const s3Client = new S3Client({
  endpoint: "https://sgp1.digitaloceanspaces.com",
  forcePathStyle: false,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

const ses = new SESClient({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function getFormString(formData, key) {
  return String(formData.get(key) || "").trim();
}

function getPositiveInteger(value, fallback, max) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, max);
}

function getEscapedRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isAuthorizedListRequest(request) {
  return request.headers.get("x-carrier-password") === LIST_PASSWORD;
}

function parseArrayField(formData, key) {
  try {
    const parsed = JSON.parse(String(formData.get(key) || "[]"));
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item).trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function sanitizeFileName(fileName) {
  return String(fileName || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function assertFileCanBeUploaded(file) {
  if (!file || file.size === 0) return;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran file maksimal 8MB.");
  }

  if (!allowedFileTypes.has(file.type)) {
    throw new Error("Format file harus PDF, DOC, DOCX, PNG, atau JPG.");
  }

  if (!process.env.DO_SPACES_KEY || !process.env.DO_SPACES_SECRET || !process.env.DO_SPACES_BUCKET) {
    throw new Error("Konfigurasi upload belum lengkap.");
  }
}

async function uploadApplicationFile(file, folder) {
  if (!file || file.size === 0) return null;

  assertFileCanBeUploaded(file);

  const bucketName = process.env.DO_SPACES_BUCKET;
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `career-applications/${folder}/${Date.now()}-${sanitizeFileName(file.name)}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ACL: "public-read",
    ContentType: file.type,
  }));

  return {
    url: `https://${bucketName}.sgp1.digitaloceanspaces.com/${key}`,
    key,
    name: file.name,
    type: file.type,
    size: file.size,
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatList(items) {
  if (!items?.length) return "-";
  return items.map(escapeHtml).join(", ");
}

function renderRow(label, value) {
  return `
    <tr>
      <td style="padding: 10px 0; color: #64748b; vertical-align: top;">${escapeHtml(label)}</td>
      <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0f172a; vertical-align: top;">${value || "-"}</td>
    </tr>
  `;
}

function buildApplicationEmailHtml(application) {
  const selectedJob = application.job_snapshot;
  const applicant = application.applicant;
  const education = application.education;
  const experience = application.experience;
  const interest = application.interest;
  const availability = application.availability;
  const closing = application.closing;
  const files = application.files;

  return `
    <div style="font-family: sans-serif; max-width: 680px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 30px; text-align: center; color: white;">
        <h2 style="margin: 0;">Pendaftaran Karier Edumind</h2>
        <p style="color: #00adb5; font-weight: bold; margin-top: 5px;">Recruitment Psychologist Partner</p>
      </div>

      <div style="padding: 30px; color: #334155;">
        <p>Halo <strong>${escapeHtml(applicant.full_name)}</strong>,</p>
        <p>Terima kasih telah mengirim pendaftaran. Berikut ringkasan data yang berhasil kami terima.</p>

        <div style="margin-top: 26px;">
          <h3 style="margin: 0 0 12px; color: #0f172a;">Selected Job Applicants</h3>
          <div style="background-color: #ecfeff; border: 1px solid #a5f3fc; border-radius: 16px; padding: 18px;">
            <p style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a;">${escapeHtml(selectedJob.title)}</p>
            <p style="margin: 6px 0 0; color: #0891b2; font-weight: 700;">${escapeHtml(selectedJob.type)}</p>
            <p style="margin: 10px 0 0; color: #64748b; font-size: 13px; line-height: 1.6;">${escapeHtml(selectedJob.location)}</p>
          </div>
        </div>

        <div style="margin-top: 30px;">
          <h3 style="margin: 0 0 12px; color: #0f172a;">Detailed User Information</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            ${renderRow("Nama Lengkap", escapeHtml(applicant.full_name))}
            ${renderRow("Nama Panggilan", escapeHtml(applicant.nick_name))}
            ${renderRow("Jenis Kelamin", escapeHtml(applicant.gender))}
            ${renderRow("Domisili", escapeHtml(applicant.domicile))}
            ${renderRow("WhatsApp", escapeHtml(applicant.whatsapp))}
            ${renderRow("Email", escapeHtml(applicant.email))}
            ${renderRow("LinkedIn / CV / Portofolio", applicant.profile_link ? `<a href="${escapeHtml(applicant.profile_link)}" style="color: #00adb5;">${escapeHtml(applicant.profile_link)}</a>` : "-")}
            ${renderRow("Pendidikan Terakhir", escapeHtml(education.level))}
            ${renderRow("Universitas", escapeHtml(education.university))}
            ${renderRow("Tahun Lulus", escapeHtml(education.graduation_year))}
            ${renderRow("Bidang Keahlian", formatList(education.expertise))}
            ${renderRow("Aktivitas Saat Ini", formatList(experience.current_activities))}
            ${renderRow("Pengalaman Pendidikan", formatList(experience.education_experiences))}
            ${renderRow("Pengalaman Bermakna", escapeHtml(experience.meaningful_experience))}
            ${renderRow("Motivasi", escapeHtml(interest.motivation))}
            ${renderRow("Isu Pendidikan", formatList(interest.education_issues))}
            ${renderRow("Isu Lainnya", escapeHtml(interest.education_issue_other))}
            ${renderRow("Area Kontribusi", formatList(interest.contribution_areas))}
            ${renderRow("Bersedia Project Based", escapeHtml(availability.project_based))}
            ${renderRow("Wilayah Dijangkau", escapeHtml(availability.reachable_cities))}
            ${renderRow("Ketersediaan Waktu", formatList(availability.times))}
            ${renderRow("Arti Pendidikan Sehat", escapeHtml(closing.healthy_education_meaning))}
            ${renderRow("Harapan Bergabung", escapeHtml(closing.expectation))}
            ${renderRow("CV / Portofolio", files.cv_portfolio?.url ? `<a href="${escapeHtml(files.cv_portfolio.url)}" style="color: #00adb5;">${escapeHtml(files.cv_portfolio.name)}</a>` : "-")}
            ${renderRow("STR / SIPP", files.str_sipp?.url ? `<a href="${escapeHtml(files.str_sipp.url)}" style="color: #00adb5;">${escapeHtml(files.str_sipp.name)}</a>` : "-")}
          </table>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 15px; border: 1px dashed #cbd5e1; margin-top: 28px;">
          <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.6;">
            Tim Edumind akan meninjau pendaftaran ini dan menghubungi melalui email atau WhatsApp yang tercantum jika ada tahapan lanjutan.
          </p>
        </div>

        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8;">© 2026 Edumind.id - PT Maleo Teknologi Indonesia</p>
        </div>
      </div>
    </div>
  `;
}

export async function GET(request) {
  try {
    if (!isAuthorizedListRequest(request)) {
      return NextResponse.json(
        { success: false, message: "Password tidak valid." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const currentPage = getPositiveInteger(searchParams.get("page"), 1, 100000);
    const pageSize = getPositiveInteger(searchParams.get("pageSize"), 10, 1000);
    const search = (searchParams.get("search") || "").trim();
    const type = searchParams.get("type") || "all";
    const exportMode = searchParams.get("export") === "1";
    const skipData = (currentPage - 1) * pageSize;
    const matchFilter = {};

    if (type !== "all") {
      matchFilter["job_snapshot.type"] = type;
    }

    if (search) {
      const regex = { $regex: getEscapedRegex(search), $options: "i" };
      matchFilter.$or = [
        { "applicant.full_name": regex },
        { "applicant.email": regex },
        { "applicant.whatsapp": regex },
        { "applicant.domicile": regex },
        { "job_snapshot.title": regex },
      ];
    }

    const db = (await connectDB()).db();

    if (exportMode) {
      const data = await db
        .collection("career_applications")
        .find(matchFilter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(5000)
        .toArray();

      return NextResponse.json({ success: true, data });
    }

    const [payload = { data: [], totalData: [] }] = await db
      .collection("career_applications")
      .aggregate([
        { $match: matchFilter },
        {
          $facet: {
            data: [
              { $sort: { createdAt: -1, _id: -1 } },
              { $skip: skipData },
              { $limit: pageSize },
              {
                $project: {
                  job_id: 1,
                  job_snapshot: 1,
                  applicant: 1,
                  education: 1,
                  experience: 1,
                  interest: 1,
                  availability: 1,
                  closing: 1,
                  files: 1,
                  status: 1,
                  createdAt: 1,
                },
              },
            ],
            totalData: [{ $count: "count" }],
          },
        },
      ])
      .toArray();

    const totalData = payload.totalData?.[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: payload.data || [],
      pagination: {
        currentPage,
        pageSize,
        totalData,
        totalPages: Math.ceil(totalData / pageSize),
        hasNextPage: totalData > currentPage * pageSize,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("CAREER_APPLICATION_LIST_ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat data pendaftar." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const jobId = getFormString(formData, "jobId");
    const selectedJob = getCareerJobById(jobId);

    if (!selectedJob) {
      return NextResponse.json(
        { success: false, message: "Job opportunity tidak valid." },
        { status: 400 },
      );
    }

    const textData = requiredTextFields.reduce((payload, key) => {
      payload[key] = getFormString(formData, key);
      return payload;
    }, {});

    const missingTextField = requiredTextFields.find((key) => !textData[key]);

    if (missingTextField) {
      return NextResponse.json(
        { success: false, message: "Mohon lengkapi semua field wajib." },
        { status: 400 },
      );
    }

    const arrayData = requiredArrayFields.reduce((payload, key) => {
      payload[key] = parseArrayField(formData, key);
      return payload;
    }, {});

    const missingArrayField = requiredArrayFields.find((key) => arrayData[key].length === 0);

    if (missingArrayField) {
      return NextResponse.json(
        { success: false, message: "Mohon pilih minimal satu opsi pada setiap bagian checklist wajib." },
        { status: 400 },
      );
    }

    const email = textData.email.toLowerCase();
    const whatsapp = textData.whatsapp.replace(/\D/g, "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid." },
        { status: 400 },
      );
    }

    if (!/^8\d{7,13}$/.test(whatsapp)) {
      return NextResponse.json(
        { success: false, message: "Nomor WhatsApp harus diawali angka 8 setelah prefix +62." },
        { status: 400 },
      );
    }

    const cvFile = formData.get("cvFile");
    const strFile = formData.get("strFile");
    const profileLink = getFormString(formData, "profileLink");

    if ((!cvFile || cvFile.size === 0) && !profileLink) {
      return NextResponse.json(
        { success: false, message: "Mohon lampirkan CV/Portofolio atau isi link LinkedIn/CV/Portofolio." },
        { status: 400 },
      );
    }

    const [cvUpload, strUpload] = await Promise.all([
      uploadApplicationFile(cvFile, "cv"),
      uploadApplicationFile(strFile, "str-sipp"),
    ]);

    const db = (await connectDB()).db();
    const now = new Date();
    const application = {
      job_id: selectedJob.id,
      job_snapshot: {
        id: selectedJob.id,
        title: selectedJob.title,
        type: selectedJob.type,
        department: selectedJob.department,
        location: selectedJob.location,
      },
      applicant: {
        full_name: textData.fullName,
        nick_name: textData.nickName,
        gender: textData.gender,
        domicile: textData.domicile,
        whatsapp: `+62${whatsapp}`,
        email,
        profile_link: profileLink,
      },
      education: {
        level: textData.educationLevel,
        expertise: arrayData.expertise,
        university: textData.university,
        graduation_year: textData.graduationYear,
      },
      experience: {
        current_activities: arrayData.activities,
        education_experiences: arrayData.educationExperiences,
        meaningful_experience: textData.meaningfulExperience,
      },
      interest: {
        motivation: textData.motivation,
        education_issues: arrayData.educationIssues,
        education_issue_other: getFormString(formData, "educationIssueOther"),
        contribution_areas: arrayData.contributionAreas,
        contribution_area_other: getFormString(formData, "contributionAreaOther"),
      },
      availability: {
        project_based: textData.projectBasedAvailability,
        reachable_cities: textData.reachableCities,
        times: arrayData.availability,
      },
      closing: {
        healthy_education_meaning: textData.healthyEducationMeaning,
        expectation: textData.expectation,
      },
      files: {
        cv_portfolio: cvUpload,
        str_sipp: strUpload,
      },
      status: "submitted",
      source: "carrier_page",
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("career_applications").insertOne(application);

    try {
      const emailHtml = buildApplicationEmailHtml(application);
      const sendCommand = new SendEmailCommand({
        Destination: { ToAddresses: [application.applicant.email] },
        Message: {
          Body: { Html: { Charset: "UTF-8", Data: emailHtml } },
          Subject: {
            Charset: "UTF-8",
            Data: `Pendaftaran Karier Edumind - ${application.job_snapshot.title}`,
          },
        },
        Source: "noreply@educourse.id",
      });

      await ses.send(sendCommand);
    } catch (emailErr) {
      console.error("Career Application Email Error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil dikirim.",
      applicationId: result.insertedId,
      jobId: selectedJob.id,
    }, { status: 201 });
  } catch (error) {
    console.error("CAREER_APPLICATION_CREATE_ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengirim pendaftaran." },
      { status: 500 },
    );
  }
}
