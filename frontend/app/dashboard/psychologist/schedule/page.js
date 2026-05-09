"use client";
import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Video, MapPin, Plus, 
  ChevronLeft, ChevronRight, User, MoreHorizontal, Loader2 
} from 'lucide-react';

export default function PsychologistSchedulePage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(7); // Default ke tanggal 7 sesuai desain awal

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/psychologist/schedule?month=05&year=2026');
      const json = await res.json();
      if (json.success) setAppointments(json.data);
    } catch (err) {
      console.error("Gagal memuat jadwal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);

  // Filter agenda untuk hari yang dipilih (simulasi format tanggal)
  const todaysAgenda = appointments.filter(app => {
    const appDate = new Date(app.date).getDate();
    return appDate === selectedDate;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-slate-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Jadwal Sesi <CalendarIcon className="text-[#00adb5]" size={32} />
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic">Kelola waktu intervensi dan pertemuan klinis Anda.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-4 bg-[#00adb5] text-white rounded-2xl font-bold text-xs shadow-lg shadow-[#00adb5]/20 hover:scale-[1.02] transition-all uppercase tracking-widest">
          <Plus size={18} /> Atur Jadwal Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* CALENDAR VIEW */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-black text-slate-800">Mei 2026</h4>
            <div className="flex gap-2">
              <button className="p-2.5 hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-400 transition-all">
                <ChevronLeft size={20} />
              </button>
              <button className="p-2.5 hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-400 transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {days.map((day) => (
              <div key={day} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {dates.map((date) => {
              const hasMeeting = appointments.some(a => new Date(a.date).getDate() === date);
              return (
                <button 
                  key={date} 
                  onClick={() => setSelectedDate(date)}
                  className={`h-20 md:h-24 rounded-[22px] border flex flex-col items-center justify-center gap-1 transition-all relative
                    ${selectedDate === date 
                      ? 'bg-[#00adb5] text-white border-[#00adb5] shadow-lg shadow-[#00adb5]/20 scale-105 z-10' 
                      : 'bg-slate-50/50 border-transparent hover:border-slate-200 hover:bg-white text-slate-500'}
                  `}
                >
                  <span className="text-sm font-black">{date}</span>
                  {hasMeeting && selectedDate !== date && (
                    <span className="w-1.5 h-1.5 bg-[#00adb5] rounded-full animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TODAY'S AGENDA */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Agenda Tanggal {selectedDate}</h4>
              <span className="text-[10px] font-black text-[#00adb5] bg-[#00adb5]/10 px-3 py-1 rounded-full border border-[#00adb5]/10">
                {todaysAgenda.length} Sesi
              </span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-[#00adb5]" /></div>
              ) : todaysAgenda.length === 0 ? (
                <div className="py-10 text-center text-slate-400 italic text-sm border-2 border-dashed border-slate-100 rounded-[30px]">
                  Tidak ada jadwal untuk hari ini.
                </div>
              ) : (
                todaysAgenda.map((app) => (
                  <div key={app.id} className={`p-6 rounded-[30px] border-l-4 ${app.color || 'border-slate-300'} bg-slate-50 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-pointer border border-transparent`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-[#00adb5] uppercase tracking-widest">{app.type}</span>
                      <button className="text-slate-300 group-hover:text-slate-500 transition-colors"><MoreHorizontal size={16} /></button>
                    </div>
                    <h5 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                      <User size={16} className="text-slate-400" /> {app.student}
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        <Clock size={14} className="text-slate-300" /> {app.time}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        {app.location.includes("Virtual") ? <Video size={14} className="text-[#00adb5]" /> : <MapPin size={14} className="text-slate-300" />}
                        {app.location}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SYNC CARD */}
          <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2">Sinkronisasi Kalender 📱</h4>
              <p className="text-[11px] opacity-60 leading-relaxed font-medium mb-5">
                Hubungkan jadwal intervensi Anda dengan Google Calendar untuk notifikasi real-time ke HP Anda.
              </p>
              <button className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all">
                Hubungkan Sekarang
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#00adb5] opacity-20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}