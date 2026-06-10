"use client";

import React, { useEffect, useState } from "react";

export default function MentimeterRespondentPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Polling for real-time updates
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await fetch("/api/mentimeter");
        const data = await res.json();
        if (data.success) {
          setResponses(data.data);
        }
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchResponses();

    // Poll every 3 seconds
    const intervalId = setInterval(fetchResponses, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col p-8 md:p-12 overflow-x-hidden font-sans">
      {/* Header / Question */}
      <div className="mb-12 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-4 drop-shadow-sm leading-tight">
          Apa yang paling sering membuat remaja seusiamu merasa tertekan??
        </h1>
        <p className="text-gray-400 text-lg md:text-xl">
          Buka <span className="text-white font-semibold">/mentimeter</span> untuk ikut berpartisipasi
        </p>
      </div>

      {/* Results Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto relative z-10">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
          </div>
        ) : responses.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-2xl italic">Belum ada tanggapan...</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-center">
            {responses.map((item, index) => {
              // Generate some random visual variations based on index for a more dynamic look
              const colors = [
                "bg-blue-600/80 text-blue-50 border-blue-500",
                "bg-teal-600/80 text-teal-50 border-teal-500",
                "bg-purple-600/80 text-purple-50 border-purple-500",
                "bg-pink-600/80 text-pink-50 border-pink-500",
                "bg-indigo-600/80 text-indigo-50 border-indigo-500",
                "bg-rose-600/80 text-rose-50 border-rose-500",
              ];
              const sizes = ["text-xl", "text-2xl", "text-3xl", "text-xl", "text-2xl"];
              
              const colorClass = colors[index % colors.length];
              const sizeClass = sizes[index % sizes.length];
              
              return (
                <div
                  key={item._id || index}
                  className={`animate-fade-in-up px-6 py-4 rounded-full border border-opacity-50 shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform duration-300 ${colorClass}`}
                  style={{
                    animationDelay: \`\${(index % 10) * 0.1}s\`,
                  }}
                >
                  <span className={\`font-medium \${sizeClass}\`}>
                    {item.answer}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <style jsx global>{\`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      \`}</style>
    </div>
  );
}
