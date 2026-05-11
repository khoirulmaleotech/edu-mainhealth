"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  CalendarDays,
  Smile,
  Frown,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function TeacherMoodLogsPage() {
  const [logs, setLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const url = selectedStudent
          ? `/api/teacher/mood-logs?studentId=${selectedStudent}`
          : "/api/teacher/mood-logs";
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setStudents(data.students || []);
          setLogs(data.logs || []);
        }
      } catch (error) {
        console.error("Gagal memuat mood log:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedStudent]);

  const grouped = logs.reduce((acc, item) => {
    const key = item.student_id; // stringified by Mongo
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Mood Log Kelas
          </h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            Hanya mood log siswa yang terhubung dengan kelas wali Anda.
          </p>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row w-full sm:w-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 w-full sm:w-72">
            <Search size={18} className="text-slate-400" />
            <select
              value={selectedStudent || ""}
              onChange={(e) => setSelectedStudent(e.target.value || null)}
              className="bg-transparent outline-none text-sm text-slate-700 w-full"
            >
              <option value="">Semua Siswa</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.fullname}{" "}
                  {student.class_name ? `(${student.class_name})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[35px] bg-white p-12 text-center shadow-sm border border-slate-100">
          <Loader2 className="animate-spin mx-auto text-[#00adb5]" size={48} />
          <p className="mt-4 text-slate-500 font-medium">Memuat mood log...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-1 bg-white rounded-[35px] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
              Ringkasan
            </h3>
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-100 p-5 bg-slate-50">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Total Students
                </p>
                <p className="text-3xl font-black text-slate-900 mt-3">
                  {students.length}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-100 p-5 bg-white">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Mood Entries
                </p>
                <p className="text-3xl font-black text-slate-900 mt-3">
                  {logs.length}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-100 p-5 bg-slate-50">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Siswa Dipantau
                </p>
                <p className="text-lg font-black text-slate-900 mt-3">
                  {selectedStudent ? "1" : students.length}
                </p>
              </div>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-6">
            {Object.keys(grouped).length === 0 ? (
              <div className="bg-white rounded-[35px] border border-slate-200 shadow-sm p-12 text-center">
                <p className="text-slate-500 font-medium">
                  Tidak ada mood log tersedia untuk kelas Anda saat ini.
                </p>
              </div>
            ) : (
              Object.entries(grouped).map(([studentId, entries]) => {
                const student = students.find((item) => item._id === studentId);
                return (
                  <div
                    key={studentId}
                    className="bg-white rounded-[35px] border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-800">
                          {student?.fullname || "Siswa Tidak Dikenal"}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {student?.class_name || "Kelas tidak ditetapkan"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} /> {entries.length} catatan
                        </div>
                        <div className="flex items-center gap-2">
                          <Smile size={16} className="text-emerald-500" />{" "}
                          {
                            entries.filter((entry) =>
                              entry.label?.toLowerCase().includes("senang"),
                            ).length
                          }
                        </div>
                        <div className="flex items-center gap-2">
                          <Frown size={16} className="text-rose-500" />{" "}
                          {
                            entries.filter((entry) =>
                              entry.label?.toLowerCase().includes("sedih"),
                            ).length
                          }
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      {entries.map((entry) => (
                        <div
                          key={entry._id}
                          className="rounded-3xl border border-slate-100 p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
                        >
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-black">
                              Mood
                            </p>
                            <p className="text-3xl font-black mt-2">
                              {entry.mood}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-black">
                              Label
                            </p>
                            <p className="text-slate-700 font-bold mt-2">
                              {entry.label}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-black">
                              Tercatat
                            </p>
                            <p className="text-slate-500 font-bold mt-2">
                              {new Date(entry.createdAt).toLocaleString(
                                "id-ID",
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
