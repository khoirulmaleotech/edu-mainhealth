"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, Send, MoreVertical, ChevronLeft, Loader2, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";

export default function PsychologistChatPage() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/psychologist/chat/rooms");
        const json = await res.json();
        if (json.success) setRooms(json.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const roomId = selectedRoom?.id || selectedRoom?._id;
    if (!roomId) return;
    const fetchMessages = async () => {
      setMsgLoading(true);
      try {
        const res = await fetch(`/api/psychologist/chat/messages?roomId=${roomId}`);
        const json = await res.json();
        if (json.success) setMessages(json.data);
      } catch (err) { console.error(err); } finally { setMsgLoading(false); }
    };
    fetchMessages();
  }, [selectedRoom]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const roomId = selectedRoom?.id || selectedRoom?._id;
    if (!inputMsg.trim() || !roomId || !session?.user?.id) return;

    const tempMsg = {
      _id: Date.now().toString(),
      sender_id: session.user.id,
      text: inputMsg,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInputMsg("");

    try {
      await fetch("/api/psychologist/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, text: tempMsg.text }),
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className='flex h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden text-slate-700'>
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-white ${selectedRoom && "hidden md:flex"}`}>
        <div className='p-6 border-b border-slate-50 sticky top-0 bg-white z-10'>
          <h3 className='text-xl font-black text-slate-800 mb-4 tracking-tight'>Chat Klinis</h3>
        </div>
        <div className='flex-1 overflow-y-auto'>
          {loading ? ( <div className='flex justify-center py-10'><Loader2 className='animate-spin text-[#00adb5]' /></div> ) : 
            rooms.map((room) => (
              <div key={room.id || room._id} onClick={() => setSelectedRoom(room)} className={`p-5 flex gap-4 cursor-pointer transition-all border-b border-slate-50/50 ${(selectedRoom?.id || selectedRoom?._id) === (room.id || room._id) ? "bg-[#00adb5]/5 border-l-4 border-l-[#00adb5]" : "hover:bg-slate-50"}`}>
                <div className='w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[#00adb5] text-lg'>{room.name?.charAt(0)}</div>
                <div className='flex-1 min-w-0'>
                  <h4 className='text-sm font-bold text-slate-800 truncate'>{room.name}</h4>
                  <p className='text-xs text-slate-400 truncate mt-1'>{room.lastMsg}</p>
                </div>
              </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-[#fcfdfe] ${!selectedRoom && "hidden md:flex"}`}>
        {selectedRoom ? (
          <>
            <div className='p-5 bg-white border-b border-slate-100 flex justify-between items-center z-10'>
              <div className='flex items-center gap-4'>
                <button onClick={() => setSelectedRoom(null)} className='md:hidden p-2 text-slate-400'><ChevronLeft size={20} /></button>
                <div className='w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm'>{selectedRoom.name?.charAt(0)}</div>
                <h3 className='font-bold text-slate-800 text-sm'>{selectedRoom.name}</h3>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-6 md:p-8 space-y-6'>
              {messages.map((m, index) => {
                const myId = session?.user?.id?.toString();
                const senderId = m.sender_id?.toString();
                const receiverId = m.receiver_id?.toString();

                // LOGIK PERBAIKAN: Jika sender null tapi receiver bukan saya, berarti saya yang kirim
                let isMe = senderId === myId;
                if (!senderId && receiverId && receiverId !== myId) isMe = true;

                return (
                  <div key={m._id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}>
                      <div className={`p-4 rounded-[22px] shadow-sm text-sm font-semibold ${isMe ? "bg-[#00adb5] text-white rounded-br-none" : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"}`}>
                        {m.text}
                      </div>
                      <span className='text-[9px] text-slate-300 uppercase'>
                        {m.timestamp?.$date ? new Date(m.timestamp.$date).toLocaleTimeString() : new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className='p-6 bg-white border-t border-slate-50 flex gap-4'>
              <input type='text' value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} placeholder='Tulis respon...' className='flex-1 p-4 bg-slate-50 border-none rounded-2xl outline-none text-sm font-semibold' />
              <button className='bg-[#00adb5] text-white p-4 rounded-2xl shadow-lg shadow-[#00adb5]/20'><Send size={20} /></button>
            </form>
          </>
        ) : (
          <div className='flex-1 flex flex-col items-center justify-center text-slate-200 bg-slate-50/30'><MessageSquare size={64} /><p className='mt-4 text-xs font-black uppercase'>Pilih Percakapan</p></div>
        )}
      </div>
    </div>
  );
}