"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import toast from "react-hot-toast";

export default function PollsPage() {
  const { user } = useCurrentUser();
  const currentUserId = user?.id;
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ question: "", options: ["", ""] });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.polls.list().then((data) => {
      setPolls(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleVote = async (pollId: string, option: string) => {
    try {
      await api.polls.vote(pollId, option);
      setPolls(polls.map((p) =>
        p.id === pollId
          ? { ...p, votes: [...(p.votes || []), { option, pollId, userId: currentUserId }] }
          : p
      ));
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!form.question.trim() || form.options.some((o) => !o.trim()) || creating) return;
    setCreating(true);
    try {
      const poll = await api.polls.create({ question: form.question, options: form.options.filter((o) => o.trim()) });
      setPolls([{ ...poll, votes: [] }, ...polls]);
      setForm({ question: "", options: ["", ""] });
      setShowCreate(false);
    } catch (e) { console.error(e); }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.polls.delete(id);
      setPolls(polls.filter((p) => p.id !== id));
      toast.success("Опрос удалён");
    } catch { toast.error("Ошибка при удалении"); }
  };

  const hasVoted = (poll: any) => poll.votes?.some((v: any) => v.userId === currentUserId);
  const canDelete = (poll: any) => currentUserId && poll.authorId === currentUserId;

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="Семейные опросы" description="Принимайте решения вместе" />
      <div className="space-y-4">{[1, 2].map((i) => <SkeletonCard key={i} lines={3} />)}</div>
    </div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="Семейные опросы" description="Принимайте решения вместе" action={<button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Создать</button>} />

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <h3 className="font-semibold mb-4">Новый опрос</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Вопрос..." value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" placeholder={`Вариант ${i + 1}`} value={opt} onChange={(e) => setForm({ ...form, options: form.options.map((o, j) => j === i ? e.target.value : o) })} className="flex-1 px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
                {form.options.length > 2 && (
                  <button onClick={() => setForm({ ...form, options: form.options.filter((_, j) => j !== i) })} className="p-2 text-muted-foreground hover:text-red-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setForm({ ...form, options: [...form.options, ""] })} className="text-sm text-primary hover:underline">+ Добавить вариант</button>
            <div className="flex gap-3 pt-2">
              <button onClick={handleCreate} disabled={creating || !form.question.trim() || form.options.some((o) => !o.trim())} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50">
                {creating ? "Создание..." : "Создать"}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 rounded-xl bg-accent font-semibold text-sm hover:bg-accent/80 transition-all">Отмена</button>
            </div>
          </div>
        </motion.div>
      )}

      {polls.length === 0 && !showCreate ? (
        <EmptyState icon={<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>} title="Опросов пока нет" description="Создайте первый опрос" />
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => {
            const totalVotes = poll.votes?.length || 0;
            const voted = hasVoted(poll);
            const isAuthor = canDelete(poll);
            return (
              <motion.div key={poll.id} className="glass-card p-6 relative group">
                {isAuthor && (
                  <button onClick={() => handleDelete(poll.id)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                )}
                <h3 className="font-semibold mb-4">{poll.question}</h3>
                <div className="space-y-3">
                  {(poll.options || []).map((option: string, idx: number) => {
                    const votesForOption = poll.votes?.filter((v: any) => v.option === option).length || 0;
                    const pct = totalVotes > 0 ? Math.round((votesForOption / totalVotes) * 100) : 0;
                    return (
                      <button key={idx} onClick={() => handleVote(poll.id, option)} disabled={voted} className="relative w-full p-3 rounded-xl bg-accent text-left disabled:opacity-90 transition-all overflow-hidden">
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-sm font-medium">{option}</span>
                          <span className="text-xs text-muted-foreground">{votesForOption} ({pct}%)</span>
                        </div>
                        <div className="absolute inset-0 bg-primary/10 transition-all" style={{ width: `${pct}%` }} />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Всего голосов: {totalVotes}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
