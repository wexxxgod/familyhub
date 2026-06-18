"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

export default function MemoriesPage() {
  const { user } = useCurrentUser();
  const currentUserId = user?.id;
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.memories.list().then((data) => {
      setMemories(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.memories.delete(id);
      setMemories(memories.filter((m) => m.id !== id));
      toast.success("Воспоминание удалено");
    } catch { toast.error("Ошибка при удалении"); }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="space-y-4">{Array.from({length:2}).map((_,i)=><SkeletonCard key={i} lines={2}/>)}</div>
    </div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <PageHeader title="Воспоминания" description="«В этот день» из истории вашей семьи" />

      {memories.length === 0 ? (
        <EmptyState icon={<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>} title="Пока нет воспоминаний" description="Публикуйте посты и загружайте фото — через год FamilyHub напомнит о них" />
      ) : (
        <div className="space-y-4">
          {memories.map((memory, i) => (
            <motion.div key={memory.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 relative group">
              {(currentUserId && memory.authorId === currentUserId) && (
                <button onClick={() => handleDelete(memory.id)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              )}
              {memory.image && <img src={memory.image} alt={memory.title} className="w-full rounded-xl mb-4" />}
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
