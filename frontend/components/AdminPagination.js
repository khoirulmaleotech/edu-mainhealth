"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminPagination({
  currentPage,
  pagination,
  onPageChange,
  accentClassName = "bg-primary border-primary text-white shadow-sm shadow-primary/20",
}) {
  const totalPages = pagination?.totalPages || 1;

  const visiblePaginationPages = useMemo(() => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (!pagination || totalPages <= 1) return null;

  return (
    <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-xs text-slate-400 font-bold">
        Menampilkan page{" "}
        <span className="text-slate-700">{currentPage}</span> dari{" "}
        <span className="text-slate-700">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        {visiblePaginationPages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-500 hover:bg-slate-50 transition-all"
            >
              1
            </button>
            <span className="px-1 text-slate-300 font-black">...</span>
          </>
        )}

        {visiblePaginationPages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-xl border text-xs font-black transition-all ${
              page === currentPage
                ? accentClassName
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        ))}

        {visiblePaginationPages[visiblePaginationPages.length - 1] < totalPages && (
          <>
            <span className="px-1 text-slate-300 font-black">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-500 hover:bg-slate-50 transition-all"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
