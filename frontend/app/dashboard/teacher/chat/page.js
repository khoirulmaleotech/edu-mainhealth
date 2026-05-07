"use client";
import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  User, 
  ShieldAlert,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function TeacherChatPage() {
  const [selectedChat, setSelectedChat] = useState(1);

  const chatList = [
    { id: 1, name: "Rizky Ramadhan", lastMsg: "Pak, saya mau cerita soal kejadian di kantin...", time: "Baru saja", unread: 2, risk: "High", avatar: "R" },
    { id: 2, name: "Siti Aminah", lastMsg: "Terima kasih sarannya, Pak.", time: "1 jam lalu", unread: 0, risk: "Low", avatar: "S" },
    { id: 3, name: "Budi Santoso", lastMsg: "Besok saya ke ruang BK jam berapa?", time: "3 jam lalu", unread: 0, risk: "Medium", avatar: "B" },
  ];

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      
      {/* LEFT SIDEBAR: Chat List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-50 flex flex-col">
        <div className="p-6 border-b border-slate-50">
          <h3 className="text-xl font-black text-slate-800 mb-4">Konseling Chat</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari siswa..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chatList.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-5 flex gap-4 cursor-pointer transition-all border-b border-slate-50/50 ${selectedChat === chat.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-slate-50'}`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 shadow-sm">
                  {chat.avatar}
                </div>
                {chat.risk === "High" && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    <ShieldAlert size={8} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{chat.name}</h4>
                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">{chat.lastMsg}</p>
              </div>
              {chat.unread > 0 && (
                <div className="bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black self-center">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT CONTENT: Chat Window */}
      <div className="hidden md:flex flex-1 flex-col bg-[#fcfdfe]">
        {/* Chat Header */}
        <div className="p-6 bg-white border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
              R
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-none">Rizky Ramadhan</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Siswa - 12A</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><Phone size={20} /></button>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><Video size={20} /></button>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Handover Notice */}
          <div className="flex justify-center">
            <div className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-full flex items-center gap-2">
              <Clock size={14} className="text-orange-500" />
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-tight">Eskalasi Otomatis AI - 14:02</span>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="max-w-[70%] bg-white border border-slate-100 p-5 rounded-[25px] rounded-bl-none shadow-sm">
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                Pak, saya merasa tertekan beberapa hari ini karena ada teman-teman yang terus mengejek saya di grup WhatsApp. Saya bingung harus bagaimana.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="max-w-[70%] bg-primary text-white p-5 rounded-[25px] rounded-br-none shadow-lg shadow-primary/20">
              <p className="text-sm leading-relaxed font-medium">
                Halo Rizky, terima kasih ya sudah berani bercerita. Bapak di sini untuk mendengarkan. Bisa beri tahu Bapak siapa saja yang ada di grup tersebut?
              </p>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-6 bg-white border-t border-slate-50">
          <form className="flex gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Tulis pesan intervensi..." 
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none text-sm font-medium transition-all"
              />
            </div>
            <button className="bg-primary text-white px-6 rounded-2xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold text-sm">
              <Send size={18} /> Kirim
            </button>
            <button type="button" className="p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all title='Selesaikan Kasus'">
              <CheckCircle2 size={20} />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}