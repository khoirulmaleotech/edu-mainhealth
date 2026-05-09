"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, Send, MoreVertical, ShieldAlert, 
  Stethoscope, Paperclip, Smile, ChevronLeft, Loader2,
  MessageCircle
} from 'lucide-react';

export default function PsychologistChatPage() {
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [inputMsg, setInputMsg] = useState("");

  // Fetch Daftar Chat
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/psychologist/chat/rooms');
        const json = await res.json();
        if (json.success) {
          setRooms(json.data);
          if (json.data.length > 0) setSelectedRoom(json.data[0]);
        }
      } finally { setLoading(false); }
    };
    fetchRooms();
  }, []);

  // Fetch Pesan saat Room dipilih
  useEffect(() => {
    if (!selectedRoom) return;
    const fetchMessages = async () => {
      setMsgLoading(true);
      try {
        const res = await fetch(`/api/psychologist/chat/messages?roomId=${selectedRoom.id}`);
        const json = await res.json();
        if (json.success) setMessages(json.data);
      } finally { setMsgLoading(false); }
    };
    fetchMessages();
  }, [selectedRoom]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    // Logic optimistik: tambahkan ke UI dulu sebelum kirim ke API
    const newMsg = {
      id: Date.now(),
      sender: 'psychologist',
      text: inputMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMsg]);
    setInputMsg("");
  };

  if (loading) return (
    <div className="h-[400px] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#00adb5]" size={40} />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden text-slate-700">
      
      {/* SIDEBAR: DAFTAR PASIEN */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-white ${selectedRoom && 'hidden md:flex'}`}>
        <div className="p-6 border-b border-slate-50">
          <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">Chat Klinis</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Cari pasien..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#00adb5]/20 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rooms.map((room) => (
            <div 
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`p-5 flex gap-4 cursor-pointer transition-all border-b border-slate-50/50 ${
                selectedRoom?.id === room.id ? 'bg-[#00adb5]/5 border-l-4 border-l-[#00adb5]' : 'hover:bg-slate-50'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[#00adb5]">
                  {room.name.charAt(0)}
                </div>
                <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  room.risk === 'Critical' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{room.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">{room.time}</span>
                </div>
                <p className="text-xs text-slate-400 truncate font-medium">{room.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className={`flex-1 flex flex-col bg-[#fcfdfe] ${!selectedRoom && 'hidden md:flex'}`}>
        {selectedRoom ? (
          <>
            {/* HEADER */}
            <div className="p-5 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedRoom(null)} className="md:hidden p-2 text-slate-400"><ChevronLeft size={20} /></button>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  {selectedRoom.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm leading-none">{selectedRoom.name}</h3>
                  <p className={`text-[9px] font-bold mt-1 uppercase ${selectedRoom.risk === 'Critical' ? 'text-red-500' : 'text-[#00adb5]'}`}>
                    {selectedRoom.risk} Case
                  </p>
                </div>
              </div>
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#00adb5]/10 text-[#00adb5] rounded-xl font-bold text-[10px] hover:bg-[#00adb5] hover:text-white transition-all">
                <Stethoscope size={14} /> Catatan Klinis
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {msgLoading ? (
                <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-slate-200" /></div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'psychologist' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] space-y-1.5`}>
                      <div className={`p-4 rounded-[22px] shadow-sm text-sm font-medium leading-relaxed ${
                        m.sender === 'psychologist' 
                        ? 'bg-[#00adb5] text-white rounded-br-none' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                      }`}>
                        {m.text}
                      </div>
                      <p className={`text-[9px] font-bold text-slate-300 ${m.sender === 'psychologist' ? 'text-right mr-1' : 'ml-1'}`}>
                        {m.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* INPUT */}
            <div className="p-6 bg-white border-t border-slate-50">
              <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Tulis pesan intervensi..." 
                    className="w-full pl-6 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-2xl outline-none text-sm font-semibold transition-all"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"><Smile size={20} /></button>
                </div>
                <button type="submit" className="bg-[#00adb5] text-white p-4 rounded-2xl shadow-lg shadow-[#00adb5]/20 hover:scale-105 active:scale-95 transition-all">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4">
            <MessageCircle size={60} strokeWidth={1} />
            <p className="font-bold text-sm">Pilih pasien untuk memulai konsultasi</p>
          </div>
        )}
      </div>
    </div>
  );
}