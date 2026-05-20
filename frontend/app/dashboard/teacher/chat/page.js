"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, MessageSquare, Search, Send } from "lucide-react";
import { useSession } from "next-auth/react";

import MarkdownContent from "@/components/MarkdownContent";
import { fetchInstance } from "@/lib/fetchInstance";

const pageSize = 20;

function formatMessageTime(message) {
  const value = message.createdAt || message.timestamp;
  if (!value) return "";
  return new Date(value).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TeacherChatPage() {
  const { data: session } = useSession();
  const [requestedRoomId, setRequestedRoomId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);
  const didMountSearchRef = useRef(false);
  const didOpenRequestedRoomRef = useRef(false);

  const selectedRoomId = selectedRoom?.roomId || selectedRoom?.id || selectedRoom?._id;

  // Ambil roomId dari query param (jika datang dari halaman daftar siswa)
  useEffect(() => {
    setRequestedRoomId(new URLSearchParams(window.location.search).get("roomId"));
  }, []);

  const fetchRooms = async ({ page = 1, append = false, search = "" } = {}) => {
    try {
      if (append) setLoadingMore(true);

      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      });

      const response = await fetchInstance(`/api/teacher/chat/rooms?${queryParams}`);
      const nextRooms = response?.data || [];

      setRooms((prev) => append ? [...prev, ...nextRooms] : nextRooms);
      setPagination(response?.pagination || null);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch teacher chat rooms:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchRoomDetail = async (roomId) => {
    try {
      const response = await fetchInstance(`/api/teacher/chat/rooms/${roomId}`);
      return response?.data || null;
    } catch (error) {
      console.error("Failed to fetch teacher room detail:", error);
      return null;
    }
  };

  // Load awal
  useEffect(() => {
    fetchRooms({ page: 1 });
  }, []);

  // Polling daftar room tiap 5 detik — update lastMsg & unread tanpa refresh
  useEffect(() => {
    const interval = setInterval(() => {
      // Hanya fetch halaman pertama agar tidak bentrok dengan pagination
      fetchRooms({ page: 1, search: searchTerm });
    }, 5000);

    return () => clearInterval(interval);
  }, [searchTerm]);

  // Debounce search
  useEffect(() => {
    if (!didMountSearchRef.current) {
      didMountSearchRef.current = true;
      return;
    }
    const timer = setTimeout(() => {
      fetchRooms({ page: 1, search: searchTerm });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Buka room yang diminta dari query param
  useEffect(() => {
    if (!requestedRoomId || didOpenRequestedRoomRef.current) return;
    if (String(selectedRoomId || "") === String(requestedRoomId)) return;

    const openRequestedRoom = async () => {
      didOpenRequestedRoomRef.current = true;
      const existing = rooms.find(
        (r) => String(r.roomId || r.id) === String(requestedRoomId)
      );

      if (existing) {
        setSelectedRoom(existing);
        return;
      }

      const room = await fetchRoomDetail(requestedRoomId);
      if (room) {
        setRooms((prev) => [
          room,
          ...prev.filter((r) => String(r.roomId || r.id) !== String(requestedRoomId)),
        ]);
        setSelectedRoom(room);
      }
    };

    openRequestedRoom();
  }, [requestedRoomId, rooms, selectedRoomId]);

  // Fetch pesan ketika room dipilih
  useEffect(() => {
    const roomId = selectedRoom?.roomId || selectedRoom?.id || selectedRoom?._id;
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetchInstance(`/api/teacher/chat/messages?roomId=${roomId}`);
        setMessages(response?.data || []);
        // Reset badge unread di sidebar
        setRooms((prev) =>
          prev.map((r) =>
            String(r.roomId || r.id) === String(roomId) ? { ...r, unread: 0 } : r
          )
        );
      } catch (error) {
        console.error("Failed to fetch teacher messages:", error);
      }
    };

    fetchMessages();
  }, [selectedRoom]);

  // Polling tiap 3 detik untuk pesan baru (sama seperti student)
  useEffect(() => {
    const roomId = selectedRoom?.roomId || selectedRoom?.id || selectedRoom?._id;
    if (!roomId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetchInstance(`/api/teacher/chat/messages?roomId=${roomId}`);
        const incoming = response?.data || [];
        setMessages((prev) => {
          if (incoming.length !== prev.length) return incoming;
          return prev;
        });
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedRoom]);

  // Auto scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMoreRooms = () => {
    if (!pagination?.hasNextPage || loadingMore) return;
    fetchRooms({ page: currentPage + 1, append: true, search: searchTerm });
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const roomId = selectedRoom?.roomId || selectedRoom?.id || selectedRoom?._id;
    const text = inputMsg.trim();
    if (!text || !roomId || !session?.user?.id) return;

    // Optimistic update
    const tempMsg = {
      _id: Date.now().toString(),
      sender_id: session.user.id,
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInputMsg("");

    try {
      const response = await fetchInstance("/api/teacher/chat/messages", {
        method: "POST",
        body: JSON.stringify({ roomId, text }),
      });

      const savedMessage = response?.data;
      if (savedMessage) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempMsg._id ? savedMessage : m))
        );
      }

      setRooms((prev) =>
        prev.map((r) =>
          String(r.roomId || r.id) === String(roomId)
            ? { ...r, lastMsg: text, time: new Date().toISOString(), unread: 0 }
            : r
        )
      );
    } catch (error) {
      console.error("Failed to send teacher message:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded-[35px] shadow-sm border border-slate-200 overflow-hidden text-slate-700">

      {/* SIDEBAR — DAFTAR ROOM */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-white ${selectedRoom ? "hidden md:flex" : ""}`}>
        <div className="p-6 border-b border-slate-50 bg-white z-10">
          <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">Chat Siswa</h3>
          <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <Search size={17} className="text-slate-300" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari siswa..."
              className="bg-transparent outline-none text-xs font-bold w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="py-16 px-6 text-center text-slate-400 text-sm font-bold">
              Belum ada siswa yang menghubungimu
            </div>
          ) : (
            <>
              {rooms.map((room) => {
                const roomId = room.roomId || room.id || room._id;
                const isActive = String(selectedRoomId) === String(roomId);

                return (
                  <button
                    key={roomId}
                    type="button"
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-left p-5 flex gap-4 cursor-pointer transition-all border-b border-slate-50/50 ${
                      isActive
                        ? "bg-[#00adb5]/5 border-l-4 border-l-[#00adb5]"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[#00adb5] text-lg shrink-0">
                      {room.name?.charAt(0) || "S"}
                      {room.unread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                          {room.unread > 99 ? "99+" : room.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{room.name}</h4>
                        {room.unread > 0 && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-1">{room.lastMsg}</p>
                    </div>
                  </button>
                );
              })}

              {pagination?.hasNextPage && (
                <div className="p-4">
                  <button
                    type="button"
                    onClick={loadMoreRooms}
                    disabled={loadingMore}
                    className="w-full py-3 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-widest text-[#00adb5] disabled:opacity-60"
                  >
                    {loadingMore ? "Memuat..." : "Muat Lagi"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* AREA PESAN */}
      <div className={`flex-1 flex flex-col bg-[#fcfdfe] ${!selectedRoom ? "hidden md:flex" : ""}`}>
        {selectedRoom ? (
          <>
            {/* Header room */}
            <div className="p-5 bg-white border-b border-slate-100 flex items-center gap-4 z-10">
              <button
                onClick={() => setSelectedRoom(null)}
                className="md:hidden p-2 text-slate-400"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {selectedRoom.name?.charAt(0) || "S"}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-800 text-sm truncate">{selectedRoom.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 truncate">{selectedRoom.email}</p>
              </div>
            </div>

            {/* Daftar pesan */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <MessageSquare size={54} />
                  <p className="mt-4 text-xs font-black uppercase">Belum ada pesan</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const myId = session?.user?.id?.toString();
                  const senderId = message.sender_id?.toString();
                  const receiverId = message.receiver_id?.toString();
                  let isMe = senderId === myId;
                  if (!senderId && receiverId && receiverId !== myId) isMe = true;

                  return (
                    <div
                      key={message._id || index}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}>
                        <div
                          className={`p-4 rounded-[22px] shadow-sm text-sm font-semibold ${
                            isMe
                              ? "bg-[#00adb5] text-white rounded-br-none"
                              : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                          }`}
                        >
                          <MarkdownContent>{message.text}</MarkdownContent>
                        </div>
                        <span className="text-[9px] text-slate-300 uppercase">
                          {formatMessageTime(message)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-6 bg-white border-t border-slate-50 flex gap-4"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Tulis balasan..."
                className="flex-1 p-4 bg-slate-50 border-none rounded-2xl outline-none text-sm font-semibold min-w-0"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim()}
                className="bg-[#00adb5] text-white p-4 rounded-2xl shadow-lg shadow-[#00adb5]/20 disabled:opacity-60"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200 bg-slate-50/30">
            <MessageSquare size={64} />
            <p className="mt-4 text-xs font-black uppercase">Pilih Percakapan</p>
          </div>
        )}
      </div>
    </div>
  );
}