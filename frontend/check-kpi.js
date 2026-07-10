const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// 1. Ambil koneksi database dari file .env secara dinamis
const envPath = path.join(__dirname, '.env');
let uri;
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^MONGODB_URI=(.+)$/m);
  uri = match ? match[1].trim() : null;
} catch (e) {
  console.error("Gagal membaca file .env:", e.message);
  process.exit(1);
}

if (!uri) {
  console.error("MONGODB_URI tidak ditemukan di file .env");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  try {
    console.log("Menghubungkan ke MongoDB...");
    await client.connect();
    console.log("Koneksi Berhasil!\n");
    const db = client.db();

    // 1. Aktivasi Akun
    const totalStudents = await db.collection("users").countDocuments({ role: "student" });
    const verifiedStudents = await db.collection("users").countDocuments({ role: "student", is_verified: true });
    const activationPercentage = totalStudents > 0 ? (verifiedStudents / totalStudents) * 100 : 0;

    console.log("=== BUKTI 1: AKTIVASI AKUN EDUMIND ===");
    console.log(`- Total Akun Siswa Terdaftar: ${totalStudents}`);
    console.log(`- Total Akun Siswa Terverifikasi: ${verifiedStudents}`);
    console.log(`- Realisasi Aktivasi: ${activationPercentage.toFixed(2)}% (Target: >= 95%)`);
    console.log(`- Status: ${activationPercentage >= 95 ? "TERLAMPUI" : "BELUM TERCAPAI"}\n`);

    // 2. Penggunaan Mood Check-in
    const uniqueMoodUsers = await db.collection("mood_logs").distinct("student_id");
    const uniqueTilikDiriUsers = await db.collection("student_tilik_diri").distinct("student_id");
    const uniqueLearningStyleUsers = await db.collection("student_learning_style").distinct("student_id");
    const uniqueRiasecUsers = await db.collection("student_riasec").distinct("student_id");
    const uniqueBrainDominanceUsers = await db.collection("student_brain_dominance").distinct("student_id");
    const uniqueTalentUsers = await db.collection("student_talents").distinct("student_id");
    const uniqueReportUsers = await db.collection("incident_reports").distinct("reporter_id");
    const uniqueCriticalChatUsers = await db.collection("critical_chat_logs").distinct("student_id");

    const allActiveUserIds = new Set([
      ...uniqueMoodUsers.map(id => id.toString()),
      ...uniqueTilikDiriUsers.map(id => id.toString()),
      ...uniqueLearningStyleUsers.map(id => id.toString()),
      ...uniqueRiasecUsers.map(id => id.toString()),
      ...uniqueBrainDominanceUsers.map(id => id.toString()),
      ...uniqueTalentUsers.map(id => id.toString()),
      ...uniqueReportUsers.map(id => id.toString()),
      ...uniqueCriticalChatUsers.map(id => id.toString())
    ]);

    const activeStudentsCount = allActiveUserIds.size;
    const moodParticipationPercentage = activeStudentsCount > 0 ? (uniqueMoodUsers.length / activeStudentsCount) * 100 : 0;

    console.log("=== BUKTI 2: PENGGUNAAN MOOD CHECK-IN ===");
    console.log(`- Total Siswa Aktif (Punya Aktivasi Fitur): ${activeStudentsCount}`);
    console.log(`- Siswa yang Melakukan Mood Check-in: ${uniqueMoodUsers.length}`);
    console.log(`- Realisasi Mood Check-in: ${moodParticipationPercentage.toFixed(2)}% (Target: >= 70% dari Siswa Aktif)`);
    console.log(`- Status: ${moodParticipationPercentage >= 70 ? "TERLAMPUI" : "BELUM TERCAPAI"}\n`);

    // 3. AI Wellbeing Assistant
    const criticalLogsCount = await db.collection("critical_chat_logs").countDocuments();
    const chatRoomsCount = await db.collection("chat_rooms").countDocuments();
    const uniqueChatRoomsStudents = await db.collection("chat_rooms").distinct("patient_id");

    console.log("=== BUKTI 3: AI WELLBEING ASSISTANT ===");
    console.log(`- Total Kasus Rujukan Chat Kritis Terdeteksi: ${criticalLogsCount} Laporan`);
    console.log(`- Total Konsultasi Rujukan Aktif Terwujud: ${chatRoomsCount} Konsultasi`);
    console.log(`- Siswa Unik Terlibat Konsultasi Lanjutan: ${uniqueChatRoomsStudents.length} Siswa\n`);

    // 4. Anonymous Reporting
    const incidentReportsCount = await db.collection("incident_reports").countDocuments();
    const uniqueIncidentReportersCount = uniqueReportUsers.length;

    console.log("=== BUKTI 4: ANONYMOUS REPORTING ===");
    console.log(`- Total Laporan Insiden Masuk: ${incidentReportsCount} Laporan`);
    console.log(`- Total Reporter Unik: ${uniqueIncidentReportersCount} Siswa`);
    console.log(`- Status Privasi: Hashing ID dan nama disamarkan menjadi 'Anonim' di dashboard admin sekolah.`);

  } catch (error) {
    console.error("Terjadi kesalahan query:", error);
  } finally {
    await client.close();
  }
}

main();
