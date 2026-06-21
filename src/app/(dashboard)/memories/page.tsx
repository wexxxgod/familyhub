"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { DeleteButton } from "@/components/shared/DeleteButton";

export default function MemoriesPage() {
  const { user } = useCurrentUser();
  const currentUserId = user?.id;
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingMemory, setEditingMemory] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", year: "" });

  useEffect(() => {
    api.memories.list().then((data) => {
      setMemories(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleOpenEdit = (memory: any) => {
    setEditForm({
      title: memory.title || "",
      content: memory.content || "",
      year: memory.year ? String(memory.year) : "",
    });
    setEditingMemory(memory);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim() || !editingMemory) return;
    try {
      const updated = await api.memories.update(editingMemory.id, {
        title: editForm.title,
        content: editForm.content,
        year: editForm.year ? parseInt(editForm.year) : null,
      });
      setMemories(memories.map((m) => (m.id === editingMemory.id ? updated : m)));
      setEditingMemory(null);
      toast.success("Воспоминание обновлено");
    } catch { toast.error("Ошибка при обновлении"); }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await api.memories.delete(id);
      setMemories(memories.filter((m) => m.id !== id));
      toast.success("Воспоминание удалено");
    } catch { toast.error("Ошибка при удалении"); }
    setDeletingId(null);
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
        <EmptyState icon={<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>} title="Пока нет воспоминаний" description="Публикуйте посты и загружайте фото — через год FamilyHub напомнит о них" />
      ) : (
        <div className="space-y-4">
          {memories.map((memory, i) => (
            <motion.div key={memory.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 relative group">
              {(currentUserId && memory.authorId === currentUserId) && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(memory)}
                    className="p-1.5 rounded-lg bg-white/30 dark:bg-white/10 text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    aria-label="Редактировать"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <DeleteButton onClick={() => handleDelete(memory.id)} disabled={deletingId === memory.id} />
                </div>
              )}
              {memory.image && <img src={memory.image} alt={memory.title} className="w-full rounded-xl mb-4" />}
              <h3 className="font-semibold mb-1">{memory.title}</h3>
              <p className="text-sm text-muted-foreground">{memory.content}</p>
              {memory.year && <p className="text-xs text-muted-foreground mt-2">{memory.year} год</p>}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editingMemory && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditingMemory(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Редактировать воспоминание</h3>
                  <button onClick={() => setEditingMemory(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <input type="text" placeholder="Название *" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
                  <textarea placeholder="Текст" value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm min-h-[80px]" />
                  <input type="number" placeholder="Год" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSaveEdit} disabled={!editForm.title.trim()} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50">Сохранить</button>
                    <button onClick={() => setEditingMemory(null)} className="px-6 py-2.5 rounded-xl bg-accent font-semibold text-sm hover:bg-accent/80 transition-all">Отмена</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
