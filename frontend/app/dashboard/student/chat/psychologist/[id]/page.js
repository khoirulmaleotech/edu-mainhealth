"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, ChevronLeft, Loader2, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function StudentChatToPsychologistPage({ params }) {
  const { data: session } = useSession();
  const [psychologist, setPsychologist] = useState(null);
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/student/chat/psychologist/${params.id}`);
        const json = await res.json();
        if (json.success) {
          setPsychologist(json.data.psychologist);
          setMessages(json.data.messages || []);
          setRoomId(json.data.roomId);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSend = async (e) => {
    e.preventDefault();

    // Tambahkan pengecekan manual sebelum fetch
    if (!input.trim() || !roomId || !session?.user?.id) {
      console.error("Data belum siap untuk dikirim");
      return;
    }

    const currentText = input;
    const tempMsg = {
      _id: Date.now().toString(),
      sender_id: session.user.id,
      text: currentText,
      createdAt: new Date().toISOString(),
    };
    console.log("🚀 ~ onSend ~ tempMsg:", tempMsg)

    setMessages((prev) => [...prev, tempMsg]);
    setInput("");

    try {
      const res = await fetch("/api/student/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: roomId,
          text: currentText,
          psychologistId: params.id, // Diambil dari folder [id]
        }),
      });

      const json = await res.json();
      if (!json.success) {
        console.error("Gagal simpan di server:", json.message);
      }
    } catch (err) {
      console.error("Kesalahan jaringan saat kirim chat");
    }
  };

  if (loading)
    return (
      <div className='h-screen flex items-center justify-center'>
        <Loader2 className='animate-spin' />
      </div>
    );

  return (
    <div className='flex flex-col h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden'>
      {/* HEADER */}
      <div className='p-5 border-b flex items-center gap-4 bg-white'>
        <Link
          href='/dashboard/student/chat/psychologist'
          className='p-2 text-slate-400'>
          <ChevronLeft size={20} />
        </Link>
        <div className='w-10 h-10 rounded-xl bg-[#00adb5]/10 text-[#00adb5] flex items-center justify-center font-bold'>
          {psychologist?.fullname?.charAt(0)}
        </div>
        <h3 className='font-bold text-slate-800'>{psychologist?.fullname}</h3>
      </div>

      {/* MESSAGES */}
      <div className='flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfdfe]'>
        {messages.map((m, index) => {
          const isMe = String(m.sender_id) === String(session?.user?.id);
          return (
            <div
              key={m._id || index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] p-4 rounded-2xl ${isMe ? "bg-[#00adb5] text-white rounded-br-none" : "bg-white border text-slate-700 rounded-bl-none"}`}>
                <p className='text-sm font-semibold'>{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={onSend} className='p-6 bg-white border-t flex gap-4'>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ketik pesan...'
          className='flex-1 p-4 bg-slate-50 border-none rounded-2xl outline-none text-sm font-semibold focus:bg-white transition-all shadow-inner'
        />
        <button className='bg-[#00adb5] text-white p-4 rounded-2xl shadow-lg shadow-[#00adb5]/20'>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
