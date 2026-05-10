"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Smile, Info, ArrowLeft, HeartPulse, 
  Mic, StopCircle, Trash2, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from "next-auth/react"; // Tambahkan import session

export default function StudentChatPage() {
  const { data: session } = useSession(); // Ambil data session
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! Aku Al Mood Buddy. Aku di sini untuk mendengarkanmu. Jika lelah mengetik, kirim pesan suara juga boleh kok. ✨' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const mediaRecorder = useRef(null);
  const messagesEndRef = useRef(null);

  // FUNGSI AUTO SCROLL (Ditingkatkan)
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end" 
      });
    }
  };

  // Pastikan scroll setiap kali array messages bertambah dan saat session siap
  useEffect(() => {
    if (session?.user?.id) {
      scrollToBottom();
    }
  }, [messages, isLoading, session?.user?.id]); // Tambahkan session id ke dependency

  // LOGIKA REKAM SUARA
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Izin mikrofon ditolak.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const cancelRecording = () => {
    setAudioURL(null);
    setAudioBlob(null);
  };

  // LOGIKA KIRIM PESAN
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    // Tambahkan pengecekan session sebelum mengirim
    if (!session?.user?.id || isLoading || (!input.trim() && !audioBlob)) return;

    setIsLoading(true);
    const formData = new FormData();

    if (audioBlob) {
      formData.append('file', audioBlob, 'recording.ogg');
      setMessages(prev => [...prev, { role: 'user', content: '🎤 Pesan Suara', isAudio: true, url: audioURL }]);
    } else {
      formData.append('message', input);
      setMessages(prev => [...prev, { role: 'user', content: input }]);
    }

    setInput("");
    cancelRecording();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        
        if (data.isCritical === true) {
          setTimeout(() => setIsCritical(true), 1000);
        }
      }
    } catch (error) {
      console.error("Gagal mengirim");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden relative">
      
      {/* POPUP INTERVENSI */}
      {isCritical && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white rounded-[45px] p-8 md:p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <HeartPulse size={42} className="animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-slate-800 leading-tight">Kamu Sangat Berharga</h3>
            <p className="text-sm text-slate-500 mt-4 leading-relaxed font-bold italic">
              Terima kasih sudah berbagi. Ceritamu sangat berarti bagi kami. Kami punya psikolog profesional yang siap membantumu merasa lebih baik.
            </p>
            <div className="mt-8 space-y-3">
              <Link href="/dashboard/student/chat/psychologist" className="w-full py-4 bg-[#00adb5] text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-[#00adb5]/20 hover:scale-[1.02] transition-all">
                Hubungi Psikolog Sekarang
              </Link>
              <button onClick={() => setIsCritical(false)} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                Tetap di sini dengan AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/student" className="p-2 hover:bg-slate-50 rounded-xl transition-colors lg:hidden text-slate-400"><ArrowLeft size={20} /></Link>
          <div className="w-12 h-12 bg-[#00adb5]/10 rounded-2xl flex items-center justify-center text-2xl relative">
            🤖 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-none">Al Mood Buddy</h3>
            <p className="text-[10px] font-black text-[#00adb5] uppercase tracking-widest mt-1.5 font-sans italic">Ready to listen</p> 
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-[#fcfdfe]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[80%] p-5 rounded-[28px] text-sm md:text-base leading-relaxed font-bold shadow-sm ${
              msg.role === 'user' ? 'bg-[#00adb5] text-white rounded-br-none shadow-[#00adb5]/20' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
            }`}>
              {msg.isAudio ? <audio src={msg.url} controls className="h-8 max-w-[200px]" /> : msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-white border border-slate-100 p-4 rounded-[22px] flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 bg-[#00adb5] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#00adb5] rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-[#00adb5] rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        {/* ELEMENT PANCINGAN SCROLL */}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* INPUT AREA */}
      <div className="p-6 bg-white border-t border-slate-50">
        {audioURL && !isRecording && (
          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-3xl mb-4 animate-in slide-in-from-bottom-2">
            <audio src={audioURL} controls className="h-8 flex-1" />
            <button onClick={cancelRecording} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={20} /></button>
          </div>
        )}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isRecording || audioURL}
              placeholder={isRecording ? "Sedang mendengarkan..." : "Ceritakan apapun di sini..."} 
              className={`w-full p-5 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[25px] outline-none text-sm font-bold transition-all ${isRecording ? 'border-rose-200 bg-rose-50' : ''}`}
            />
            {isRecording && <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2"><span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span></div>}
          </div>
          {!input.trim() && !audioURL ? (
            <button 
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-5 rounded-[25px] shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 hover:text-[#00adb5]'}`}
            >
              {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
            </button>
          ) : (
            <button 
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-[#00adb5] text-white p-5 rounded-[25px] shadow-lg shadow-[#00adb5]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}