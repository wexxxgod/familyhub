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
  const [sending, setSending] = useState(false);
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
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const msg = await api.chat.send({ content: input.trim() });
      setMessages((prev) => [...prev, { ...msg, sender: { id: currentUserId, name: user?.name } }]);
      setInput("");
    } catch { toast.error("Ошибка при отправке"); }
    setSending(false);
  };

  const isFromMe = (msg: any) => msg.senderId === currentUserId;

  return (
    <div className="h-[calc(100vh-5rem)] max-w-3xl mx-auto px-4 py-4 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex flex-col flex-1 overflow-hidden"
      >
        <div className="p-5 border-b border-border/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200/30">
            <span className="text-lg">💬</span>
          </div>
          <div>
            <h2 className="font-semibold font-['Fredoka']">Семейный чат</h2>
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
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 flex items-center justify-center mb-4 shadow-inner">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">В чате пока нет сообщений</p>
              <p className="text-xs text-muted-foreground mt-1">Напишите первое сообщение! ✨</p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const fromMe = isFromMe(msg);
              return (
                <div key={msg.id} className={`flex ${fromMe ? "justify-end" : "justify-start"} animate-message-in`}>
                  <div className={`flex gap-2.5 max-w-[80%] ${fromMe ? "flex-row-reverse" : "flex-row"}`}>
                    {!fromMe && (
                      <div className="mt-1 shrink-0">
                        <GradientAvatar name={msg.sender?.name} size="sm" className="ring-2 ring-amber-200/30 dark:ring-amber-500/20" />
                      </div>
                    )}
                    <div>
                      <p className={`text-xs mb-1 ${fromMe ? "text-right" : "text-left"} text-muted-foreground font-medium`}>
                        {fromMe ? "Вы" : (msg.sender?.name || "Пользователь")}
                      </p>
                      <div className={fromMe ? "chat-bubble-me" : "chat-bubble-other"}>
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

        <div className="p-5 border-t border-border/30">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Напишите сообщение..."
              className="flex-1 px-5 py-3 rounded-full bg-white/60 dark:bg-white/5 border border-border/30 outline-none text-sm focus:border-amber-300/50 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              aria-label="Отправить"
              className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white disabled:opacity-50 transition-all shadow-lg shadow-amber-200/30 hover:shadow-amber-200/50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
