"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function FamilyTreePage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", middleName: "", dateOfBirth: "", parentId: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.familyTree.list().then((data) => {
      setMembers(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || submitting) return;
    setSubmitting(true);
    try {
      const member = await api.familyTree.create(form);
      setMembers([...members, member]);
      setForm({ firstName: "", lastName: "", middleName: "", dateOfBirth: "", parentId: "" });
      setShowAdd(false);
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить ${name} из древа?`)) return;
    try {
      await api.familyTree.delete(id);
      setMembers(members.filter((m) => m.id !== id));
      toast.success(`${name} удалён(а)`);
    } catch {
      toast.error("Ошибка при удалении");
    }
  };

  const rootNodes = members.filter((m: any) => !m.parentId);
  const childrenOf = (parentId: string) => members.filter((m: any) => m.parentId === parentId);

  const renderTree = (nodes: any[], level = 0) => (
    <div className="flex flex-col items-center gap-4">
      {nodes.map((node) => {
        const children = childrenOf(node.id);
        return (
          <div key={node.id} className="flex flex-col items-center group">
            <div className="glass-card px-6 py-3 text-center hover-lift cursor-pointer min-w-[140px] relative">
              <p className="font-semibold text-sm">{node.firstName} {node.lastName}</p>
              {node.dateOfBirth && <p className="text-xs text-muted-foreground">{new Date(node.dateOfBirth).toLocaleDateString("ru-RU")}</p>}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(node.id, `${node.firstName} ${node.lastName}`); }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            {children.length > 0 && (
              <>
                <div className="w-px h-6 bg-border" />
                <div className="flex gap-4 relative">
                  {children.length > 1 && <div className="absolute top-0 left-[10%] right-[10%] h-px bg-border" />}
                  {renderTree(children, level + 1)}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="glass-card p-12 animate-pulse text-center">
        <div className="w-24 h-24 rounded-2xl bg-accent mx-auto mb-4" />
        <div className="h-4 bg-accent rounded w-1/3 mx-auto" />
      </div>
    </div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Семейное древо</h1>
          <p className="text-muted-foreground">Постройте интерактивное дерево вашей семьи</p>
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
            <input type="text" placeholder="Отчество" value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} className="px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            <input type="date" placeholder="Дата рождения" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
          </div>
          {members.length > 0 && (
            <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="w-full mt-4 px-4 py-2.5 rounded-xl bg-accent outline-none text-sm">
              <option value="">Нет родителя (корень)</option>
              {members.map((m: any) => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
          )}
          <button onClick={handleAdd} disabled={submitting || !form.firstName.trim() || !form.lastName.trim()} className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50">Сохранить</button>
        </motion.div>
      )}

      {members.length === 0 && !showAdd ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-12 text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Древо ещё не создано</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Добавьте первого члена семьи</p>
        </motion.div>
      ) : (
        <div className="glass-card p-8 overflow-x-auto">
          <div className="min-w-[600px] flex justify-center">
            {renderTree(rootNodes)}
          </div>
        </div>
      )}
    </div>
  );
}
