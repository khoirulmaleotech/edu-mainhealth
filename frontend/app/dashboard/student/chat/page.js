"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Info, ArrowLeft, HeartPulse, MessageCircle, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';

export default function StudentChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! Aku Al Mood Buddy. Aku di sini untuk mendengarkanmu. Apa ada yang ingin kamu ceritakan pelan-pelan hari ini? ✨' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

      // JIKA DETEKSI KRITIS DARI API TRUE
      if (data.isCritical) {
        setTimeout(() => setIsCritical(true), 1500);
      }
    } catch (error) {
      console.error("Gagal mengirim pesan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden relative text-slate-700">
      
      {/* INTERVENTION CARD (MUNCUL JIKA KRITIS) */}
      {isCritical && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white rounded-[45px] p-8 md:p-10 max-w-sm w-full shadow-2xl border border-[#00adb5]/20 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <HeartPulse size={42} className="animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-slate-800 leading-tight">Kamu Sangat Berharga</h3>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium">
              Terima kasih sudah bertahan sejauh ini. Aku merasa ceritamu butuh didengar oleh Psikolog profesional kami agar kamu merasa lebih tenang.
            </p>
            
            <div className="mt-8 space-y-3">
              <Link 
                href="/dashboard/student/chat/psychologist"
                className="w-full py-4 bg-[#00adb5] text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-[#00adb5]/20 hover:scale-[1.02] transition-transform"
              >
                Hubungi Psikolog Sekarang
              </Link>
              <button 
                onClick={() => setIsCritical(false)}
                className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Lanjut Cerita dengan AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT HEADER */}
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-50 rounded-xl transition-colors lg:hidden text-slate-400">
            <ArrowLeft size={20} />
          </Link>
          <div className="relative">
            <div className="w-12 h-12 bg-[#00adb5]/10 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-none">Al Mood Buddy</h3>
            <p className="text-[10px] font-black text-[#00adb5] uppercase tracking-widest mt-1.5">AI Supportive Buddy</p> 
          </div>
        </div>
        <button className="p-2 text-slate-300 hover:text-[#00adb5] transition-colors"><Info size={20} /></button>
      </div>

      {/* CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-[#fcfdfe]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[80%] p-5 rounded-[28px] text-sm md:text-base leading-relaxed font-semibold shadow-sm ${
              msg.role === 'user' 
                ? 'bg-[#00adb5] text-white rounded-br-none shadow-[#00adb5]/20' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-[22px] rounded-bl-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00adb5] rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-[#00adb5] rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-[#00adb5] rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* CHAT INPUT AREA */}
      <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-50 flex gap-4">
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik ceritamu pelan-pelan..." 
            className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[25px] outline-none text-sm font-semibold transition-all pr-14"
          />
          <button type="button" className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#00adb5] transition-colors">
            <Smile size={22} />
          </button>
        </div>
        <button 
          disabled={isLoading || !input.trim()}
          className="bg-[#00adb5] text-white p-5 rounded-[25px] shadow-lg shadow-[#00adb5]/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
        >
          <Send size={22} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}