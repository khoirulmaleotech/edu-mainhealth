"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Activity, Users } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function PollsStreamPage() {
  const [data, setData] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/polls");
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        const total = result.data.reduce((acc, curr) => acc + curr.value, 0);
        setTotalVotes(total);
      }
    } catch (error) {
      console.error("Error fetching poll data:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling every 3 seconds
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="text-blue-600 w-8 h-8" />
              Live Polling Results
            </h1>
            <p className="text-gray-500 mt-1">Real-time vote count untuk pemilihan sekolah favorit.</p>
          </div>
          <div className="mt-4 md:mt-0 bg-blue-50 px-6 py-3 rounded-xl border border-blue-100 flex items-center gap-3">
            <Users className="text-blue-600 w-6 h-6" />
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Votes</p>
              <p className="text-2xl font-bold text-blue-900">{totalVotes}</p>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 70,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 13 }}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' 
                  }}
                  itemStyle={{ fontWeight: 600, color: '#1f2937' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                  animationDuration={1500}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
}
