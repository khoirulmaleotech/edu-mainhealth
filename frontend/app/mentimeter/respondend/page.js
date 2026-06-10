"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Dictionary kategori psikologis
const categoryKeywords = {
  "Perundungan (Bullying)": ["bully", "tindas", "ejek", "caci", "hina", "palak", "jauhi", "kucil", "olok", "cyberbully"],
  "Tekanan Akademik": ["tugas", "ujian", "sekolah", "nilai", "guru", "belajar", "pr", "rapor", "prestasi", "rangking", "kuliah"],
  "Ekspektasi Keluarga": ["orang tua", "keluarga", "ayah", "ibu", "rumah", "kelahi", "ekspektasi", "tuntutan", "dibanding", "mama", "papa"],
  "Dinamika Sosial": ["teman", "sahabat", "pacar", "sosmed", "circle", "pergaulan", "kesepian", "asing", "ditinggal"],
  "Krisis Citra Diri": ["insecure", "fisik", "penampilan", "muka", "gendut", "kurus", "jelek", "jerawat", "overthinking", "body shaming"],
};

export default function MentimeterRespondentPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("bubble"); // "bubble" | "chart"

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

  // Process data for chart
  const counts = {
    "Perundungan (Bullying)": 0,
    "Tekanan Akademik": 0,
    "Ekspektasi Keluarga": 0,
    "Dinamika Sosial": 0,
    "Krisis Citra Diri": 0,
    "Lainnya": 0,
  };

  responses.forEach(r => {
    const text = (r.answer || "").toLowerCase();
    let matched = false;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        counts[category]++;
        matched = true;
        break; // assign to first matching category
      }
    }
    
    if (!matched) {
      counts["Lainnya"]++;
    }
  });

  const chartData = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value); // Sort descending

  const COLORS = ['#0ea5e9', '#14b8a6', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white flex flex-col p-8 md:p-12 overflow-x-hidden font-sans">
      {/* Header / Question */}
      <div className="mb-8 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-700 mb-4 drop-shadow-sm leading-tight">
          Apa yang paling sering membuat remaja seusiamu merasa tertekan??
        </h1>
      </div>

      {/* View Toggles */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="bg-white rounded-full shadow-md p-1 flex border border-gray-100">
          <button
            onClick={() => setViewMode("bubble")}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              viewMode === "bubble" ? "bg-teal-500 text-white shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Gelembung Teks
          </button>
          <button
            onClick={() => setViewMode("chart")}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              viewMode === "chart" ? "bg-blue-500 text-white shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Grafik Analisis
          </button>
        </div>
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
        ) : viewMode === "bubble" ? (
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
                    animationDelay: `${(index % 10) * 0.1}s`,
                  }}
                >
                  <span className={`font-medium ${sizeClass}`}>
                    {item.answer}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col lg:flex-row gap-8 items-center justify-center animate-fade-in-up">
            <div className="w-full lg:w-1/2 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={140}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const total = chartData.reduce((sum, item) => sum + item.value, 0);
                      const percent = ((value / total) * 100).toFixed(1);
                      return [`${value} tanggapan (${percent}%)`, name];
                    }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Analisis Tema (Konsep Psikologis)</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Grafik ini menggunakan teknik <strong>Natural Language Processing (NLP) ringan berbasis Keyword Matching</strong> untuk mengelompokkan jawaban yang maknanya saling berkaitan. Misalnya, kata kunci seperti <span className="italic">"bully"</span>, <span className="italic">"ditindas"</span>, atau <span className="italic">"diejek"</span> otomatis digabungkan dalam satu kategori psikologis: <span className="font-semibold text-blue-600">Perundungan (Bullying)</span>.
              </p>
              <div className="space-y-4">
                {chartData.map((item, index) => {
                  const total = chartData.reduce((sum, i) => sum + i.value, 0);
                  const percent = Math.round((item.value / total) * 100);
                  return (
                    <div key={index} className="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
                      <div className="w-5 h-5 rounded-full mr-4 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <div className="flex-1 font-semibold text-gray-700">{item.name}</div>
                      <div className="font-bold text-gray-900 text-lg">{percent}% <span className="text-sm font-normal text-gray-500 ml-1">({item.value})</span></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>

      <style jsx global>{`
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
        }
      `}</style>
    </div>
  );
}
