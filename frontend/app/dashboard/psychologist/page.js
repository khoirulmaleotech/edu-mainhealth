"use client";
import React from 'react';
import { 
  Stethoscope, 
  Activity, 
  Calendar, 
  Clock, 
  Filter,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function PsychologistPage() {
  const urgentCases = [
    { id: 1, name: "Budi Santoso", age: "17th", issue: "Indikasi Perundungan Berat", status: "Critical", priority: "High" },
    { id: 2, name: "Siti Aminah", age: "16th", issue: "Gejala Kecemasan Akut", status: "In-Progress", priority: "Medium" },
    { id: 3, name: "Reza Aditya", age: "17th", issue: "Penurunan Mood Drastis", status: "Pending", priority: "High" },
  ];

  return (
    <div className="space-y-10">
      {/* TOP ANALYTICS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AnalyticsCard icon={<ShieldAlert size={32} />} label="Kasus Eskalasi" value="12" variant="danger" />
        <AnalyticsCard icon={<Calendar size={32} />} label="Sesi Hari Ini" value="4" variant="primary" />
        <AnalyticsCard icon={<Clock size={32} />} label="Avg. Session Time" value="45m" variant="secondary" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ESCALATION CASE QUEUE */}
        <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-xl font-bold text-slate-800">Antrian Kasus Prioritas</h4>
              <p className="text-sm text-slate-400 font-medium">Kasus yang membutuhkan rencana intervensi klinis</p>
            </div>
            <button className="p-3 bg-slate-50 rounded-xl text-slate-400 border border-slate-100">
              <Filter size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {urgentCases.map((c) => (
              <div key={c.id} className="group p-6 rounded-[28px] bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`w-3 h-12 rounded-full ${c.priority === 'High' ? 'bg-red-500' : 'bg-secondary'}`}></div>
                  <div>
                    <h5 className="font-bold text-slate-800">{c.name} ({c.age})</h5>
                    <p className="text-sm text-slate-500 font-medium">{c.issue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${c.status === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {c.status}
                  </span>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CLINICAL INSIGHTS / AI ASSISTANT */}
        <div className="space-y-8">
          <div className="bg-primary p-9 rounded-[40px] text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-secondary">
                AI Clinical Insight 🤖
              </h4>
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-[24px] border border-white/20">
                  <p className="text-[10px] font-black text-secondary tracking-widest uppercase mb-2">Trend Analisis</p>
                  <p className="text-sm leading-relaxed font-medium">
                    Terjadi kenaikan 15% pada laporan "Social Isolation" di antara siswa kelas 12 dalam 2 minggu terakhir.
                  </p>
                </div>
                <button className="w-full py-4 bg-white text-primary rounded-[20px] font-black text-sm hover:bg-secondary hover:text-slate-900 transition-all shadow-lg shadow-black/10">
                  Buat Laporan Global
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-secondary opacity-10 rounded-full blur-3xl"></div>
          </div>

          {/* RECENT NOTES SLOT */}
          <div className="bg-slate-900 p-8 rounded-[40px] text-white">
            <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Stethoscope size={20} className="text-primary" />
              Quick Notes
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[11px] text-slate-400 font-bold mb-1">TERAKHIR DIEDIT: 2 JAM LALU</p>
                <p className="text-sm font-medium">Update rencana terapi CBT untuk Budi Santoso...</p>
              </div>
              <button className="w-full py-3 border border-white/20 rounded-xl text-xs font-bold hover:bg-white/5 transition-colors">
                Lihat Semua Catatan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({ icon, label, value, variant }) {
  const styles = {
    danger: "bg-red-50 text-red-500 border-red-100",
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
  };

  return (
    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-6">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${styles[variant]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      </div>
    </div>
  );
}