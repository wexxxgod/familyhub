"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function MapPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", location: "", latitude: "", longitude: "" });

  useEffect(() => {
    api.family.list().then((data) => {
      setMembers((data.members || []).filter((m: any) => m.location || (m.latitude && m.longitude)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    try {
      await api.family.create(form);
      setForm({ firstName: "", lastName: "", location: "", latitude: "", longitude: "" });
      setShowAdd(false);
      const data = await api.family.list();
      setMembers((data.members || []).filter((m: any) => m.location || (m.latitude && m.longitude)));
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="glass-card p-12 animate-pulse text-center">
        <div className="w-24 h-24 rounded-2xl bg-accent mx-auto mb-4" />
      </div>
    </div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Карта семьи</h1>
          <p className="text-muted-foreground">Отметьте на карте, где живут ваши близкие</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          {showAdd ? "Отмена" : "Добавить"}
        </button>
      </motion.div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Имя" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            <input type="text" placeholder="Фамилия" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            <input type="text" placeholder="Город / место" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="px-4 py-2.5 rounded-xl bg-accent outline-none text-sm sm:col-span-2" />
            <input type="text" placeholder="Широта (lat)" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            <input type="text" placeholder="Долгота (lng)" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
          </div>
          <button onClick={handleAdd} className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all">Сохранить</button>
        </motion.div>
      )}

      {members.length === 0 && !showAdd ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-12 text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Карта ещё не заполнена</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Добавьте места, где живут члены семьи</p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-500">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <h3 className="font-semibold text-sm">{m.firstName} {m.lastName}</h3>
              {m.location && <p className="text-xs text-muted-foreground mt-1">{m.location}</p>}
              {m.latitude && m.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${m.latitude},${m.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  Открыть на карте →
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
