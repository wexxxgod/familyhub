"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/lib/api";

export default function ChatPage() {
  const { user } = useCurrentUser();
  const currentUserId = user?.id;
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await api.chat.list();
      setMessages(data.reverse());
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const data = await api.members.list();
      setContacts(data.filter((m: any) => m.id !== currentUserId));
    } catch {}
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      fetchMessages();
      fetchContacts();
    }
  }, [currentUserId, fetchMessages, fetchContacts]);

  useEffect(() => {
    if (!currentUserId) return;
    const t = setInterval(fetchMessages, 5000);
    return () => clearInterval(t);
  }, [currentUserId, fetchMessages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedContact) return;
    try {
      const msg = await api.chat.send({ content: input.trim(), receiverId: selectedContact.id });
      setMessages([...messages, { ...msg, sender: { id: currentUserId, name: user?.name }, senderId: currentUserId, receiverId: selectedContact.id }]);
      setInput("");
    } catch (e) { console.error(e); }
  };

  const filteredMessages = selectedContact
    ? messages.filter((m) =>
        (m.senderId === selectedContact.id && m.receiverId === currentUserId) ||
        (m.senderId === currentUserId && m.receiverId === selectedContact.id)
      )
    : messages;

  const isFromMe = (msg: any) => msg.senderId === currentUserId;

  if (!currentUserId || loading) {
    return (
      <div className="h-[calc(100vh-5rem)] max-w-5xl mx-auto px-4 py-4 flex gap-4">
        <div className="w-72 shrink-0 hidden md:flex flex-col glass-card animate-pulse p-4">
          <div className="h-5 bg-accent rounded w-1/2 mb-4" />
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-accent rounded-xl mb-2" />)}
        </div>
        <div className="flex-1 glass-card animate-pulse p-4">
          <div className="h-5 bg-accent rounded w-1/4 mb-4" />
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-8 bg-accent rounded w-2/3" />)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] max-w-5xl mx-auto px-4 py-4 flex gap-4">
      <div className="w-72 shrink-0 hidden md:flex flex-col glass-card">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-semibold">Семейный чат</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contacts.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">В семье пока только вы</p>
            </div>
          ) : (
            contacts.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedContact(c)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                  selectedContact?.id === c.id ? "bg-accent" : "hover:bg-accent/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {(c.name || "U")[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.name || "Пользователь"}</p>
                  <p className="text-xs text-muted-foreground truncate">Член семьи</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col glass-card">
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-border/50 flex items-center gap-3">
              <button onClick={() => setSelectedContact(null)} className="md:hidden p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
                {(selectedContact.name || "U")[0]}
              </div>
              <span className="font-medium">{selectedContact.name}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredMessages.map((msg: any) => {
                const fromMe = isFromMe(msg);
                return (
                  <div key={msg.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                      fromMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-accent rounded-bl-md"
                    }`}>
                      <p className="text-xs text-muted-foreground mb-1">
                        {fromMe ? "Вы" : (msg.sender?.name || "Пользователь")}
                      </p>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
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
                  className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Выберите собеседника</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">Выберите члена семьи слева</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
