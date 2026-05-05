"use client";
import { useState } from 'react';
import HandoverCard from '@/components/HandoverCard';

export default function ChildChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [count, setCount] = useState(0);
  const [showHandover, setShowHandover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    
    const newCount = count + 1;
    setCount(newCount);

    try {
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

      // LOGIKA HANDOVER: 
      // Munculkan modal jika:
      // 1. API mendeteksi indikasi kritis (forceHandover: true)
      // 2. ATAU jumlah pesan sudah mencapai threshold (10)
      if (data.forceHandover || newCount >= 10) {
        setShowHandover(true);
      }

    } catch (error) {
      console.error("Koneksi AI terputus");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="p-6 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Al Mood Buddy</h1>
        <span className="px-4 py-1 bg-primary/10 text-primary text-sm rounded-full font-bold">Online</span>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-5 rounded-[30px] text-xl ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-slate-100 text-slate-700 rounded-bl-none shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 text-slate-400 p-4 rounded-2xl animate-pulse text-lg italic">
              Bot sedang mengetik...
            </div>
          </div>
        )}
      </div>

      <HandoverCard 
        show={showHandover} 
        onCancel={() => setShowHandover(false)} 
      />

      <form onSubmit={sendMessage} className="p-8 border-t flex gap-4 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik apa yang kamu rasakan..."
          className="flex-1 p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-primary focus:ring-0 outline-none text-xl transition-all"
        />
        <button 
          disabled={isLoading} 
          className="bg-primary text-white px-10 rounded-2xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-primary/20"
        >
          {isLoading ? "..." : "Kirim"}
        </button>
      </form>
    </div>
  );
}