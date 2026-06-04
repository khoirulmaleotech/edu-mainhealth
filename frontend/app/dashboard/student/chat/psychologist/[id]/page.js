"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, ChevronLeft, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MarkdownContent from "@/components/MarkdownContent";

// Helper internal untuk memformat teks pembatas tanggal ala WhatsApp
function getWhatsAppDayLabel(dateString) {
  try {
    const today = new Date();
    const targetDate = new Date(dateString);

    // Normalisasi jam ke 00:00:00 untuk perbandingan tanggal murni
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetZero = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const diffTime = todayZero - targetZero;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari Ini";
    if (diffDays === 1) return "Kemarin";

    // Jika lewat dari kemarin, tampilkan format tanggal Indonesia formal
    return targetDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (err) {
    return "";
  }
}

export default function StudentChatToPsychologistPage({ params }) {
  const { data: session } = useSession();
  const [psychologist, setPsychologist] = useState(null);
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // 1. Fetch Awal (Profile Psikolog & Room)
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
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [params.id, session?.user?.id]);

  // 2. Real-time EventSource Stream Connection
  useEffect(() => {
    let eventSource;

    if (session?.user?.id && roomId) {
      eventSource = new EventSource(`/api/student/chat/stream?roomId=${roomId}`);

      eventSource.addEventListener("newMessage", (event) => {
        try {
          const newMsg = JSON.parse(event.data);
          
          setMessages((prev) => {
            const isExist = prev.some((m) => String(m._id) === String(newMsg._id));
            if (isExist) return prev;
            return [...prev, newMsg];
          });
        } catch (err) {
          console.error("Gagal membaca payload stream:", err);
        }
      });

      eventSource.onerror = (err) => {
        console.error("Koneksi stream terputus, mengupayakan reconnect...", err);
      };
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [roomId, session?.user?.id]);

  // Auto Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSend = async (e) => {
    e.preventDefault();

    if (!input.trim() || !roomId || !session?.user?.id) return;

    const currentText = input;
    const tempId = Date.now().toString();
    
    const tempMsg = {
      _id: tempId,
      sender_id: session.user.id,
      text: currentText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInput("");

    try {
      const res = await fetch("/api/student/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: roomId,
          text: currentText,
          psychologistId: params.id,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        console.error("Gagal simpan di server:", json.message);
      }
    } catch (err) {
      console.error("Kesalahan jaringan");
    }
  };

  if (loading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#00adb5]" size={40} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menghubungkan...</p>
      </div>
    );

  // Variabel bantu penanda perubahan hari saat looping render berjalan
  let lastDisplayedDateLabel = "";

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
      {/* HEADER */}
      <div className="p-6 border-b flex items-center gap-4 bg-white/80 backdrop-blur-md">
        <Link href="/dashboard/student/chat/psychologist" className="p-2 text-slate-400 hover:text-[#00adb5] transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="w-12 h-12 rounded-[18px] bg-[#00adb5]/10 text-[#00adb5] flex items-center justify-center font-black text-lg">
          {psychologist?.fullname?.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-slate-800 leading-none">{psychologist?.fullname}</h3>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Tersambung
          </p>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#fcfdfe]">
        {messages.map((m, index) => {
          const isMe = String(m.sender_id) === String(session?.user?.id);
          
          // Kalkulasi label hari untuk pesan saat ini
          const currentMessageDateLabel = getWhatsAppDayLabel(m.createdAt);
          let showDateSeparator = false;

          // Jika label hari berbeda dengan pesan sebelumnya, tampilkan pembatas baru
          if (currentMessageDateLabel !== lastDisplayedDateLabel) {
            showDateSeparator = true;
            lastDisplayedDateLabel = currentMessageDateLabel;
          }

          return (
            <React.Fragment key={m._id || index}>
              {/* ── UPDATE: KOMPONEN PEMBATAS TANGGAL ALA WHATSAPP ── */}
              {showDateSeparator && (
                <div className="flex justify-center my-4 animate-in fade-in duration-300">
                  <span className="bg-slate-100/80 backdrop-blur-sm text-slate-500 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm border border-slate-200/50 tracking-wide">
                    {currentMessageDateLabel}
                  </span>
                </div>
              )}

              {/* BUBBLE CHAT UTAMA */}
              <div className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[75%] p-5 rounded-[25px] shadow-sm ${
                  isMe 
                  ? "bg-[#00adb5] text-white rounded-br-none" 
                  : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                }`}>
                  <MarkdownContent className="text-sm md:text-base font-bold leading-relaxed">
                    {m.text}
                  </MarkdownContent>
                  <p className={`text-[9px] mt-2 font-black uppercase opacity-50 ${isMe ? "text-right" : "text-left"}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <form onSubmit={onSend} className="p-6 bg-white border-t flex gap-4 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan untuk psikolog..."
          className="flex-1 p-5 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[25px] outline-none text-sm font-bold transition-all shadow-inner"
        />
        <button 
          disabled={!input.trim()}
          className="bg-[#00adb5] text-white p-5 rounded-[22px] shadow-lg shadow-[#00adb5]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
}