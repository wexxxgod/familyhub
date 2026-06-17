"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function TimeCapsulePage() {
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", openDate: "" });

  useEffect(() => {
    api.capsules.list().then((data) => {
      setCapsules(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim() || !form.openDate) return;
    try {
      const capsule = await api.capsules.create(form);
      setCapsules([capsule, ...capsules]);
      setForm({ title: "", message: "", openDate: "" });
      setShowCreate(false);
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="glass-card p-6 animate-pulse"><div className="h-4 bg-accent rounded w-1/2 mb-2" /><div className="h-3 bg-accent rounded w-1/3" /></div>)}</div>
    </div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Капсула времени</h1>
          <p className="text-muted-foreground">Отправьте послание в будущее своей семье</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Создать
        </button>
      </motion.div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <h3 className="font-semibold mb-4">Новое послание</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            <textarea placeholder="Ваше сообщение семье..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm resize-none" />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Дата открытия</label>
              <input type="date" value={form.openDate} onChange={(e) => setForm({ ...form, openDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all">Сохранить</button>
              <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 rounded-xl bg-accent font-semibold text-sm hover:bg-accent/80 transition-all">Отмена</button>
            </div>
          </div>
        </motion.div>
      )}

      {capsules.length === 0 && !showCreate ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-12 text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Капсула времени пуста</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Напишите письмо своей семье в будущее</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {capsules.map((capsule, i) => {
            const isOpen = new Date(capsule.openDate) <= new Date();
            return (
              <motion.div key={capsule.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`glass-card p-6 ${!isOpen ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{capsule.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${isOpen ? "bg-green-500/20 text-green-600" : "bg-amber-500/20 text-amber-600"}`}>{isOpen ? "Открыто" : "Закрыто"}</span>
                </div>
                <p className="text-xs text-muted-foreground">Откроется: {new Date(capsule.openDate).toLocaleDateString("ru-RU")}</p>
                {isOpen && <p className="text-sm mt-3">{capsule.message}</p>}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
