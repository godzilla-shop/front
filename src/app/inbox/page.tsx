"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase"; 
import { collection, query, orderBy, onSnapshot, limit, doc, addDoc, serverTimestamp, where, Timestamp } from "firebase/firestore";
import { useLang } from "@/context/LangContext";
import api from "@/lib/api";
import { MessageCircle, Search, Send, User, ArrowLeft, History, CalendarDays } from "lucide-react";

interface Chat {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  updatedAt: any;
  unreadCount?: number;
}

interface Message {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: any;
  type: "incoming" | "outgoing";
}

export default function InboxPage() {
  const { t } = useLang();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"today" | "all">("today");

  // Load Chats with Filter Optimization
  useEffect(() => {
    setLoading(true);
    
    let q;
    if (filter === "today") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      
      q = query(
        collection(db, "chats"), 
        where("updatedAt", ">=", Timestamp.fromDate(startOfToday)),
        orderBy("updatedAt", "desc"), 
        limit(50)
      );
    } else {
      q = query(
        collection(db, "chats"), 
        orderBy("updatedAt", "desc"), 
        limit(50)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chat[];
      setChats(chatList);
      setLoading(false);
    }, (error) => {
      console.error("🔥 Firestore Chats Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  // Load Messages for Selected Chat
  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, "chats", selectedChat.id, "messages"),
      orderBy("timestamp", "asc"),
      limit(30)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgList);
    }, (error) => {
      console.error("🔥 Firestore Messages Error:", error);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const msgText = newMessage.trim();
      setNewMessage("");

      // 1. Save to Firestore (this will trigger the UI update)
      const chatRef = doc(db, "chats", selectedChat.id);
      await addDoc(collection(chatRef, "messages"), {
        from: "business",
        to: selectedChat.phone,
        body: msgText,
        timestamp: serverTimestamp(),
        type: "outgoing",
      });

      // 2. Call backend to actually send via WhatsApp
      await api.post('/messages/send', { 
        to: selectedChat.phone, 
        message: msgText 
      });

      // 3. Update chat last message
      // Note: Alternatively, we could do this on the backend
      // for better consistency, but it's okay for now.
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredChats = chats.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
  );

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl backdrop-blur-sm">
      {/* Sidebar: Chat List */}
      <div className={`border-r border-slate-800 flex-col bg-slate-900/40 w-full md:w-1/3 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white mb-4">{t.inbox.title}</h1>
          
          {/* Optimization Filters */}
          <div className="flex gap-2 mb-4 p-1 bg-slate-800/50 rounded-xl border border-slate-700">
            <button 
              onClick={() => setFilter("today")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                filter === "today" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {t.inbox.today}
            </button>
            <button 
              onClick={() => setFilter("all")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                filter === "all" ? "bg-slate-700 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              {t.inbox.history}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.inbox.search}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{t.inbox.empty}</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 flex items-center gap-4 transition-all hover:bg-slate-800/50 border-b border-slate-800/50 ${
                  selectedChat?.id === chat.id ? "bg-slate-800/80 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-slate-700">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{chat.name}</h3>
                    <span className="text-[10px] text-slate-500">
                      {chat.updatedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className={`flex-col bg-slate-900/20 relative w-full md:flex-1 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center gap-4 backdrop-blur-md z-10">
              <button 
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Back to chat list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-slate-700 shrink-0">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div className="overflow-hidden">
                <h2 className="text-white font-semibold truncate">{selectedChat.name}</h2>
                <p className="text-xs text-slate-500 truncate">+{selectedChat.phone}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-80">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[70%] rounded-2xl p-3 text-sm shadow-lg ${
                    msg.type === "outgoing"
                      ? "self-end bg-blue-600 text-white rounded-tr-none"
                      : "self-start bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                  }`}
                >
                  <p>{msg.body}</p>
                  <span className={`block text-[10px] mt-1 text-right ${msg.type === "outgoing" ? "text-blue-200" : "text-slate-500"}`}>
                    {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={t.inbox.typeMessage}
                  className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
              <MessageCircle className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t.inbox.selectChat}</h2>
            <p className="max-w-xs">{t.inbox.subtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
}
