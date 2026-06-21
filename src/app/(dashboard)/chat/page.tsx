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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Файл слишком большой (макс 50MB)");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || sending) return;
    setSending(true);

    try {
      let imageUrl: string | null = null;
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;

      if (selectedFile) {
        const uploaded = await api.upload.file(selectedFile);
        if (selectedFile.type.startsWith("image/")) {
          imageUrl = uploaded.url;
        } else {
          fileUrl = uploaded.url;
          fileName = uploaded.name;
          fileType = selectedFile.type;
        }
      }

      const msg = await api.chat.send({
        content: input.trim(),
        ...(imageUrl && { image: imageUrl }),
        ...(fileUrl && { file: fileUrl, fileName, fileType }),
      });

      setMessages((prev) => [...prev, { ...msg, sender: { id: currentUserId, name: user?.name } }]);
      setInput("");
      clearFile();
    } catch { toast.error("Ошибка при отправке"); }
    setSending(false);
  };

  const isFromMe = (msg: any) => msg.senderId === currentUserId;

  function FileAttachment({ msg }: { msg: any }) {
    if (msg.image) {
      return (
        <img
          src={msg.image}
          alt="image"
          className="max-w-full rounded-lg mt-1 cursor-pointer"
          loading="lazy"
          onClick={() => window.open(msg.image, "_blank")}
        />
      );
    }

    if (msg.file) {
      const f = typeof msg.file === "string" ? JSON.parse(msg.file) : msg.file;
      const url = f.url || f;
      const name = f.name || "file";
      const type = f.type || "";

      if (type.startsWith("audio/")) {
        return (
          <div className="mt-1">
            <p className="text-xs text-muted-foreground mb-1">{name}</p>
            <audio controls className="max-w-full h-10 rounded-lg">
              <source src={url} type={type} />
            </audio>
          </div>
        );
      }

      if (type.startsWith("video/")) {
        return (
          <div className="mt-1">
            <p className="text-xs text-muted-foreground mb-1">{name}</p>
            <video controls className="max-w-full max-h-64 rounded-lg" preload="metadata">
              <source src={url} type={type} />
            </video>
          </div>
        );
      }

      if (type === "application/pdf") {
        return (
          <div className="mt-1">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-sm font-medium truncate">{name}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto shrink-0">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        );
      }

      return (
        <div className="mt-1">
          <a href={url} target="_blank" rel="noopener noreferrer" download={name}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="text-sm font-medium truncate">{name}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto shrink-0">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="h-[calc(100dvh-4rem)] sm:h-[calc(100vh-5rem)] max-w-3xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-2 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex flex-col flex-1 overflow-hidden"
      >
        <div className="p-4 sm:p-5 border-b border-border/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200/30">
            <span className="text-lg">💬</span>
          </div>
          <div>
            <h2 className="font-semibold font-['Fredoka'] text-sm sm:text-base">Семейный чат</h2>
            <p className="text-xs text-muted-foreground">Общий чат для всей семьи</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
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
                        {msg.content && <p className="break-words">{msg.content}</p>}
                        <FileAttachment msg={msg} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 sm:p-5 border-t border-border/30">
          {selectedFile && (
            <div className="flex items-center gap-2 mb-3 px-4 py-2 rounded-xl bg-accent/50">
              {filePreview ? (
                <img src={filePreview} alt="preview" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-lg">
                  📎
                </div>
              )}
              <span className="text-sm truncate flex-1">{selectedFile.name}</span>
              <button onClick={clearFile} className="p-1 hover:bg-accent rounded-full transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z,.txt,.csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="p-3.5 sm:p-3 rounded-full bg-accent/50 hover:bg-accent transition-colors disabled:opacity-50 shrink-0"
              aria-label="Прикрепить файл"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Напишите сообщение..."
              className="flex-1 px-5 py-3 sm:py-2.5 rounded-full bg-white/60 dark:bg-white/5 border border-border/30 outline-none text-sm focus:border-amber-300/50 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedFile) || sending}
              aria-label="Отправить"
              className="p-3.5 sm:p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white disabled:opacity-50 transition-all shadow-lg shadow-amber-200/30 hover:shadow-amber-200/50 active:scale-95 shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
