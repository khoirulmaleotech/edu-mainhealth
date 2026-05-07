"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StudentChatPage() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Halo! Aku Al Mood Buddy. Aku di sini untuk mendengarkanmu. Apa ada yang ingin kamu ceritakan pelan-pelan hari ini? ✨' 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Menghubungkan ke API Route yang sudah kita buat sebelumnya
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply 
      }]);

      // Jika ada trigger handover otomatis dari AI [cite: 505]
      if (data.forceHandover) {
        // Logika untuk menampilkan modal HandoverCard bisa diletakkan di sini
        console.log("System: Suggesting professional intervention");
      }
    } catch (error) {
      console.error("Gagal mengirim pesan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden relative">
      {/* CHAT HEADER */}
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-xl transition-colors lg:hidden">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div className="relative">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              🤖
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-none">Al Mood Buddy</h3>
            <p className="text-[11px] font-bold text-primary uppercase tracking-widest mt-1">AI Supportive Intermediary</p> 
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
          <Info size={20} />
        </button>
      </div>

      {/* CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#fcfdfe]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[75%] p-5 rounded-[30px] text-[16px] leading-relaxed font-medium shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 text-slate-400 p-4 rounded-[25px] rounded-bl-none animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-200 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-200 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-slate-200 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* SAFETY WARNING COMPONENT  */}
      <div className="px-8 py-2 bg-red-50/50 flex items-center justify-center gap-2">
        <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">
          ⚠️ Jika darurat, segera hubungi guru BK atau orang dewasa terpercaya. [cite: 378]
        </span>
      </div>

      {/* CHAT INPUT AREA */}
      <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-50 flex gap-4">
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis ceritamu di sini..." 
            className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[25px] outline-none text-[16px] font-medium transition-all pr-14"
          />
          <button type="button" className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-secondary transition-colors">
            <Smile size={24} />
          </button>
        </div>
        <button 
          disabled={isLoading || !input.trim()}
          className="bg-primary text-white p-5 rounded-[25px] shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
        >
          <Send size={24} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}