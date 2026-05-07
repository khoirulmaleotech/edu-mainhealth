"use client";
import React from 'react';
import { 
  AlertTriangle, 
  MessageSquare, 
  UserCheck, 
  Clock, 
  ChevronRight, 
  ShieldAlert,
  Info,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

export default function TeacherAlertsPage() {
  // Data Alert berdasarkan Blueprint [cite: 192, 225-230, 441-445]
  const alertsList = [
    { 
      id: 1, 
      student: "Budi Santoso", 
      class: "12A", 
      type: "Cyberbullying", 
      risk: "High", 
      time: "10 menit lalu", 
      desc: "Terdeteksi pola kata kasar berulang di media sosial yang tertangkap sistem.",
      status: "Unresolved"
    },
    { 
      id: 2, 
      student: "Siti Aminah", 
      class: "12A", 
      type: "Mood Drop", 
      risk: "Medium", 
      time: "2 jam lalu", 
      desc: "Penurunan drastis pada mood check-in selama 3 hari berturut-turut.",
      status: "In Progress"
    },
    { 
      id: 3, 
      student: "Reza Aditya", 
      class: "12A", 
      type: "Social Exclusion", 
      risk: "High", 
      time: "5 jam lalu", 
      desc: "Laporan anonim mengenai pengucilan di lingkungan kantin.",
      status: "Unresolved"
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HEADER SECTION [cite: 203, 408] */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Alert Kasus <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">5 Baru</span>
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic">Segera tinjau dan lakukan intervensi pada kasus prioritas. [cite: 439, 510]</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
            Riwayat Kasus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* MAIN ALERT LIST [cite: 430-436, 441-445] */}
        <div className="lg:col-span-3 space-y-6">
          {alertsList.map((alert) => (
            <div key={alert.id} className="bg-white rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all overflow-hidden group">
              <div className="p-8 flex flex-col md:flex-row gap-6">
                {/* Risk Indicator */}
                <div className={`w-2 md:w-3 rounded-full ${alert.risk === 'High' ? 'bg-red-500' : 'bg-secondary'}`}></div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kasus #{alert.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{alert.type}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-800">{alert.student} <span className="text-sm font-medium text-slate-400">({alert.class})</span></h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-tight">{alert.time}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    "{alert.desc}" [cite: 204]
                  </p>

                  {/* Action Buttons [cite: 196, 205, 252] */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                      <UserCheck size={16} /> Mulai Intervensi
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-slate-800 transition-all">
                      <MessageSquare size={16} /> Chat BK / Psikolog
                    </button>
                    <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl border border-slate-100 transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SIDEBAR ANALYTICS [cite: 78, 232] */}
        <div className="space-y-8">
          {/* AI SUMMARY CARD [cite: 244, 447] */}
          <div className="bg-primary p-8 rounded-[40px] text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-secondary">
                AI Summary 🤖
              </h4>
              <p className="text-sm opacity-90 leading-relaxed font-medium mb-6">
                Minggu ini terdeteksi peningkatan kasus <b>Cyberbullying</b> sebesar 15% pada jam malam (20:00 - 22:00).
              </p>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Rekomendasi</p>
                <p className="text-[11px] font-medium leading-relaxed italic">
                  Berikan edukasi mengenai etika digital pada sesi wali kelas berikutnya. [cite: 205]
                </p>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-secondary opacity-10 rounded-full blur-3xl"></div>
          </div>

          {/* QUICK STATS  */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Status Penanganan</h4>
            <StatusItem label="Total Alert" value="28" icon={<AlertTriangle className="text-red-500" />} />
            <StatusItem label="High Risk" value="5" icon={<ShieldAlert className="text-orange-500" />} />
            <StatusItem label="Selesai" value="23" icon={<CheckCircle2 className="text-green-500" />} />
          </div>

          {/* HELP CARD [cite: 271] */}
          <div className="bg-secondary/10 p-8 rounded-[40px] border border-secondary/20">
            <div className="flex items-center gap-3 mb-4">
               <Info className="text-secondary" size={20} />
               <h4 className="font-bold text-slate-900 text-sm tracking-tight">Butuh Bantuan Ahli?</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
              Eskalasi kasus High Risk langsung ke Konsol Psikolog untuk penanganan klinis. [cite: 505, 519]
            </p>
            <button className="w-full mt-4 py-3 bg-secondary text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform">
              Hubungi Psikolog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatusItem({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between group cursor-default">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-xs font-bold text-slate-600 tracking-tight">{label}</span>
      </div>
      <span className="text-lg font-black text-slate-800">{value}</span>
    </div>
  );
}