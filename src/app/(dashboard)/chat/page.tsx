"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/lib/api";
import { GradientAvatar } from "@/components/shared/GradientAvatar";
import toast from "react-hot-toast";

export default function ChatPage() {
  const { user } = useCurrentUser();
  const currentUserId = user?.id;
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await api.chat.list();
      setMessages([...data].reverse());
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  useEffect(() => {
    if (currentUserId) fetchMessages();
  }, [currentUserId, fetchMessages]);

  useEffect(() => {
    if (!currentUserId) return;
    const t = setInterval(() => {
      if (!document.hidden) fetchMessages();
    }, 5000);
    return () => { clearInterval(t); };
  }, [currentUserId, fetchMessages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      const msg = await api.chat.send({ content: input.trim() });
      setMessages((prev) => [...prev, { ...msg, sender: { id: currentUserId, name: user?.name } }]);
      setInput("");
    } catch { toast.error("Ошибка при отправке"); }
  };

  const isFromMe = (msg: any) => msg.senderId === currentUserId;

  return (
    <div className="h-[calc(100vh-5rem)] max-w-3xl mx-auto px-4 py-4 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex flex-col flex-1 overflow-hidden"
      >
        <div className="p-4 border-b border-border/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </div>
          <div>
            <h2 className="font-semibold">Семейный чат</h2>
            <p className="text-xs text-muted-foreground">Общий чат для всей семьи</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                  <div className="h-12 bg-accent rounded-2xl w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">В чате пока нет сообщений</p>
              <p className="text-xs text-muted-foreground mt-1">Напишите первое сообщение!</p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const fromMe = isFromMe(msg);
              return (
                <div key={msg.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[75%] ${fromMe ? "flex-row-reverse" : "flex-row"}`}>
                    {!fromMe && (
                      <div className="mt-1 shrink-0">
                        <GradientAvatar name={msg.sender?.name} size="sm" className="rounded-full" />
                      </div>
                    )}
                    <div>
                      <p className={`text-xs mb-0.5 ${fromMe ? "text-right" : "text-left"} text-muted-foreground`}>
                        {fromMe ? "Вы" : (msg.sender?.name || "Пользователь")}
                      </p>
                      <div className={`p-3 rounded-2xl text-sm animate-message-in ${
                        fromMe ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-tr-md" : "bg-accent rounded-tl-md"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Напишите сообщение..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-accent outline-none text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Отправить"
              className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white disabled:opacity-50 transition-all shadow-sm shadow-amber-200/30"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
