"use client";

import React, { useEffect, useState } from "react";

export default function MentimeterLoadPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await fetch("/api/mentimeter-load", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        });
        const data = await res.json();
        if (data.success) {
          setResponses(data.data);
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
    const intervalId = setInterval(fetchResponses, 3000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white flex flex-col p-8 md:p-12 overflow-x-hidden font-sans">
      <div className="mb-8 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-4 drop-shadow-sm leading-tight">
          Apa Tantangan Terbesar Remaja Seusiamu Saat Ini?
        </h1>
        <p className="text-slate-500 font-medium text-lg">Suara jujur dari siswa-siswi (Pre-Test)</p>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto relative z-10">
        {loading && responses.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-violet-500"></div>
          </div>
        ) : responses.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-2xl italic">Belum ada tanggapan...</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-center">
            {responses.map((item, index) => {
              const colors = [
                "bg-blue-600/90 text-blue-50 border-blue-500",
                "bg-teal-600/90 text-teal-50 border-teal-500",
                "bg-purple-600/90 text-purple-50 border-purple-500",
                "bg-pink-600/90 text-pink-50 border-pink-500",
                "bg-indigo-600/90 text-indigo-50 border-indigo-500",
                "bg-rose-600/90 text-rose-50 border-rose-500",
              ];
              const sizes = ["text-xl", "text-2xl", "text-3xl", "text-xl", "text-2xl"];
              
              const colorClass = colors[index % colors.length];
              const sizeClass = sizes[index % sizes.length];
              
              return (
                <div
                  key={item._id || index}
                  className={`animate-fade-in-up px-6 py-4 rounded-full border border-opacity-50 shadow-lg backdrop-blur-sm transform transition-all duration-500 hover:scale-110 hover:z-10 ${colorClass}`}
                  style={{
                    animationDelay: `${(index % 10) * 0.1}s`,
                  }}
                >
                  <span className={`font-semibold tracking-wide ${sizeClass}`}>
                    {item.challenge}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
