"use client";
import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  MoreVertical, 
  User, 
  ShieldAlert, 
  Stethoscope,
  Info,
  Paperclip,
  Smile,
  ChevronLeft
} from 'lucide-react';

export default function PsychologistChatPage() {
  const [selectedChat, setSelectedChat] = useState(1);

  const patientsChat = [
    { id: 1, name: "Rizky Ramadhan", lastMsg: "Saya merasa tidak aman di sekolah...", time: "2m lalu", risk: "Critical", unread: 3 },
    { id: 2, name: "Sinta Wijaya", lastMsg: "Sesi kemarin sangat membantu, Dok.", time: "1j lalu", risk: "High", unread: 0 },
    { id: 3, name: "Budi Santoso", lastMsg: "Kapan jadwal kontrol saya berikutnya?", time: "5j lalu", risk: "Medium", unread: 0 },
  ];

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      
      {/* SIDEBAR: DAFTAR PASIEN CHAT */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-50 flex flex-col bg-white">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-xl font-black text-slate-800 mb-4">Chat Klinis</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari pasien..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {patientsChat.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-6 flex gap-4 cursor-pointer transition-all border-b border-slate-50/50 ${
                selectedChat === chat.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-slate-50'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                  {chat.name.charAt(0)}
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  chat.risk === 'Critical' ? 'bg-red-500' : chat.risk === 'High' ? 'bg-orange-500' : 'bg-blue-500'
                }`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{chat.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">{chat.lastMsg}</p>
              </div>
              {chat.unread > 0 && (
                <div className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black self-center">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className="hidden md:flex flex-1 flex-col bg-[#fcfdfe]">
        {/* HEADER CHAT */}
        <div className="p-6 bg-white border-b border-slate-50 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-50 rounded-xl lg:hidden"><ChevronLeft size={20} /></button>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">R</div>
            <div>
              <h3 className="font-bold text-slate-800 leading-none">Rizky Ramadhan</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Priority: Critical Case</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
              <Stethoscope size={14} /> Buat Catatan Klinis
            </button>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="flex justify-center">
            <span className="bg-slate-100 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Sesi Dimulai - 07 Mei 2026</span>
          </div>

          {/* Patient Message */}
          <div className="flex justify-start">
            <div className="max-w-[70%] space-y-2">
              <div className="bg-white border border-slate-100 p-5 rounded-[25px] rounded-bl-none shadow-sm">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  Dok, saya merasa tidak aman di sekolah setelah kejadian bullying kemarin. Saya merasa cemas setiap kali harus masuk kelas.
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-300 ml-2">14:02</span>
            </div>
          </div>

          {/* Psychologist Message */}
          <div className="flex justify-end">
            <div className="max-w-[70%] space-y-2 flex flex-col items-end">
              <div className="bg-primary text-white p-5 rounded-[25px] rounded-br-none shadow-lg shadow-primary/20">
                <p className="text-sm leading-relaxed font-medium">
                  Terima kasih Rizky sudah mau terbuka. Bapak sangat mengerti perasaanmu. Saat ini kamu sedang berada di tempat yang aman, mari kita coba teknik pernapasan pelan-pelan ya.
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-300 mr-2">14:05</span>
            </div>
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="p-6 bg-white border-t border-slate-50">
          <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-2xl mb-4 flex items-center gap-2">
            <ShieldAlert size={14} className="text-red-500" />
            <span className="text-[10px] font-black text-red-600 uppercase tracking-tight">Peringatan: Pasien menunjukkan indikasi kecemasan akut.</span>
          </div>
          
          <form className="flex gap-4 items-center">
            <button type="button" className="p-3 text-slate-400 hover:text-primary transition-all"><Paperclip size={20} /></button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Tulis pesan intervensi klinis..." 
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none text-sm font-medium transition-all"
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"><Smile size={20} /></button>
            </div>
            <button className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* INFO SIDEBAR (Optional Desktop) */}
      <div className="hidden xl:flex w-72 bg-white border-l border-slate-50 flex-col p-8 space-y-8">
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Profil Pasien</h4>
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl mx-auto flex items-center justify-center text-3xl">R</div>
            <h5 className="font-bold text-slate-800">Rizky Ramadhan</h5>
            <span className="bg-red-50 text-red-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Kritis</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Observasi Terakhir</h4>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Siswa memiliki riwayat isolasi sosial. Respon terhadap instruksi relaksasi: Baik.
            </p>
          </div>
        </div>

        <button className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all">
          Lihat Catatan Lengkap
        </button>
      </div>

    </div>
  );
}