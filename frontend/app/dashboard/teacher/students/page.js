"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { fetchInstance } from "@/lib/fetchInstance";
import { useDebounce } from "@/hooks/useDebounce";

const loadingComponentClassName = {
  tableRow: "animate-pulse border-b border-slate-50",
  avatar: "w-10 h-10 rounded-xl bg-slate-200",
  title: "h-4 w-32 bg-slate-200 rounded-full",
  subtitle: "h-3 w-20 bg-slate-100 rounded-full mt-2",
  talent: "h-4 w-24 bg-slate-200 rounded-full",
};

const loadingComponentConfiguration = {
  skeletonRowCount: 6,
};

function StudentTableLoadingSkeleton() {
  return (
    <>
      {[...Array(loadingComponentConfiguration.skeletonRowCount)].map(
        (_, index) => (
          <tr
            key={index}
            className={loadingComponentClassName.tableRow}
          >
            <td className="px-8 py-6">
              <div className="flex items-center gap-4">
                <div className={loadingComponentClassName.avatar}></div>

                <div>
                  <div className={loadingComponentClassName.title}></div>
                  <div className={loadingComponentClassName.subtitle}></div>
                </div>
              </div>
            </td>

            <td className="px-8 py-6">
              <div className={loadingComponentClassName.talent}></div>
            </td>
          </tr>
        )
      )}
    </>
  );
}

export default function TeacherStudentsPage() {
  const [studentList, setStudentList] = useState([]);

  const [paginationInformation, setPaginationInformation] =
    useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");

  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  const [currentPage, setCurrentPage] = useState(1);

  const [isStudentListLoading, setIsStudentListLoading] =
    useState(true);

  const pageSize = 10;

  const fetchStudentList = async ({ page = 1, search = "" }) => {
    try {
      setIsStudentListLoading(true);

      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      });

      const response = await fetchInstance(
        `/api/teacher/students?${queryParams.toString()}`
      );

      setStudentList(response?.data || []);
      setPaginationInformation(response?.pagination || null);
    } catch (error) {
      console.error("Failed to fetch student list", error);
    } finally {
      setIsStudentListLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentList({
      page: 1,
      search: "",
    });
  }, []);

  useEffect(() => {
    setCurrentPage(1);

    fetchStudentList({
      page: 1,
      search: debouncedSearchKeyword,
    });
  }, [debouncedSearchKeyword]);

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > (paginationInformation?.totalPages || 1) ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    fetchStudentList({
      page,
      search: debouncedSearchKeyword,
    });
  };

  const visiblePaginationPages = useMemo(() => {
    const totalPages = paginationInformation?.totalPages || 1;
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );

    let endPage = Math.min(
      totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(
        1,
        endPage - maxVisiblePages + 1
      );
    }

    const pages = [];

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, paginationInformation?.totalPages]);

  const totalPages = paginationInformation?.totalPages || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Data Siswa
          </h2>

          <p className="text-slate-500 mt-1 font-medium italic text-sm">
            Manajemen profil, kesejahteraan, dan potensi siswa.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-end gap-4">
          <div className="flex items-center bg-slate-50 px-4 py-2.5 rounded-xl w-full max-w-sm border border-slate-100">
            <Search
              size={18}
              className="text-slate-400 mr-2"
            />

            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchKeyword}
              onChange={(event) =>
                setSearchKeyword(event.target.value)
              }
              className="bg-transparent outline-none text-sm w-full font-medium"
            />
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto max-h-[650px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 sticky top-0 z-10">
              <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-5">
                  Identitas Siswa
                </th>

                <th className="px-8 py-5">
                  Bakat Dominan
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {isStudentListLoading ? (
                <StudentTableLoadingSkeleton />
              ) : studentList.length > 0 ? (
                studentList.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 uppercase">
                          {student.student_fullname?.charAt(0)}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {student.student_fullname}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      {student.dominant_talent ? (
                        <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase tracking-wide">
                          {student.dominant_talent}
                        </span>
                      ) : (
                        <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-wide">
                          Belum Mengisi
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="text-center py-16 text-slate-400 font-semibold"
                  >
                    Tidak ada data siswa ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD LIST */}
        <div className="md:hidden p-4 space-y-4 max-h-[650px] overflow-y-auto">
          {isStudentListLoading ? (
            [...Array(5)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-slate-50 rounded-[28px] p-5 border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>

                  <div className="flex-1">
                    <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
                    <div className="h-3 w-20 bg-slate-100 rounded-full mt-2"></div>
                  </div>
                </div>

                <div className="h-8 w-28 bg-slate-200 rounded-full mt-5"></div>
              </div>
            ))
          ) : studentList.length > 0 ? (
            studentList.map((student) => (
              <div
                key={student._id}
                className="bg-slate-50 rounded-[28px] p-5 border border-slate-100"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center font-black text-slate-600 uppercase">
                      {student.student_fullname?.charAt(0)}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {student.student_fullname}
                      </h4>

                      <p className="text-xs text-slate-400 font-semibold mt-1">
                        Talent Assessment
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  {student.dominant_talent ? (
                    <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase tracking-wide">
                      {student.dominant_talent}
                    </span>
                  ) : (
                    <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-wide">
                      Belum Mengisi
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-400 font-semibold">
              Tidak ada data siswa ditemukan
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {paginationInformation && totalPages > 1 && (
          <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-bold">
              Menampilkan page{" "}
              <span className="text-slate-700">
                {currentPage}
              </span>{" "}
              dari{" "}
              <span className="text-slate-700">
                {totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!paginationInformation.hasPreviousPage}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              {visiblePaginationPages[0] > 1 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    1
                  </button>

                  <span className="px-1 text-slate-300 font-black">
                    ...
                  </span>
                </>
              )}

              {visiblePaginationPages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-xl border text-xs font-black transition-all ${page === currentPage
                      ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  {page}
                </button>
              ))}

              {visiblePaginationPages[
                visiblePaginationPages.length - 1
              ] < totalPages && (
                  <>
                    <span className="px-1 text-slate-300 font-black">
                      ...
                    </span>

                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-500 hover:bg-slate-50 transition-all"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!paginationInformation.hasNextPage}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
