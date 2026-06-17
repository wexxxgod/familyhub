"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function MemoriesPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.memories.list().then((data) => {
      setMemories(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="glass-card p-6 animate-pulse"><div className="h-4 bg-accent rounded w-1/2 mb-2" /><div className="h-3 bg-accent rounded w-2/3" /></div>)}</div>
    </div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Воспоминания</h1>
        <p className="text-muted-foreground">«В этот день» из истории вашей семьи</p>
      </motion.div>

      {memories.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-12 text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Пока нет воспоминаний</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Публикуйте посты и загружайте фото — через год FamilyHub напомнит о них</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {memories.map((memory, i) => (
            <motion.div key={memory.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
              {memory.image && <img src={memory.image} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />}
              <h3 className="font-semibold mb-1">{memory.title}</h3>
              <p className="text-sm text-muted-foreground">{memory.content}</p>
              {memory.year && <p className="text-xs text-muted-foreground mt-2">{memory.year} год</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
