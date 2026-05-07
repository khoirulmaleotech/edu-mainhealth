"use client";
import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  User,
  MoreHorizontal
} from 'lucide-react';

export default function PsychologistSchedulePage() {
  // Data Jadwal Sesi berdasarkan Blueprint [cite: 451-455]
  const appointments = [
    { 
      id: 1, 
      student: "Rizky Ramadhan", 
      time: "09:00 - 10:00", 
      type: "Counseling", 
      location: "Ruang Konseling A", 
      status: "Confirmed",
      color: "border-primary"
    },
    { 
      id: 2, 
      student: "Sinta Wijaya", 
      time: "11:00 - 12:00", 
      type: "Mediation", 
      location: "Virtual Meeting", 
      status: "On-Going",
      color: "border-secondary"
    },
    { 
      id: 3, 
      student: "Budi Santoso", 
      time: "14:00 - 15:00", 
      type: "Parent Session", 
      location: "Ruang Konseling B", 
      status: "Pending",
      color: "border-slate-300"
    }
  ];

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HEADER SECTION [cite: 319-325] */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Jadwal Sesi <CalendarIcon className="text-primary" size={32} />
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic">Kelola waktu intervensi dan pertemuan klinis Anda. [cite: 454-455]</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all uppercase tracking-widest">
          <Plus size={18} /> Atur Jadwal Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* CALENDAR VIEW  */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-bold text-slate-800">Mei 2026</h4>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-400 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-400 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {days.map((day) => (
              <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dates.map((date) => (
              <button 
                key={date} 
                className={`h-24 rounded-[20px] border flex flex-col items-center justify-center gap-1 transition-all group
                  ${date === 7 ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-slate-50/50 border-transparent hover:border-slate-200 hover:bg-white'}
                `}
              >
                <span className="text-sm font-bold">{date}</span>
                {date === 7 && <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>}
                {date === 12 && <div className="flex gap-1"><span className="w-1 h-1 bg-primary rounded-full"></span><span className="w-1 h-1 bg-secondary rounded-full"></span></div>}
              </button>
            ))}
          </div>
        </div>

        {/* TODAY'S AGENDA [cite: 441-445] */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Agenda Hari Ini</h4>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">3 Sesi</span>
            </div>

            <div className="space-y-4">
              {appointments.map((app) => (
                <div key={app.id} className={`p-6 rounded-[28px] border-l-4 ${app.color} bg-slate-50 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-pointer`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{app.type}</span>
                    <button className="text-slate-300 group-hover:text-slate-500"><MoreHorizontal size={16} /></button>
                  </div>
                  <h5 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <User size={16} className="text-slate-400" /> {app.student}
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                      <Clock size={14} /> {app.time}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                      {app.location.includes("Virtual") ? <Video size={14} className="text-primary" /> : <MapPin size={14} />}
                      {app.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SYNC CARD [cite: 454] */}
          <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2">Sinkronisasi Kalender 📱</h4>
              <p className="text-xs opacity-70 leading-relaxed font-medium mb-4">
                Hubungkan jadwal intervensi Anda dengan Google Calendar untuk notifikasi real-time.
              </p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all">
                Hubungkan Sekarang
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary opacity-20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}