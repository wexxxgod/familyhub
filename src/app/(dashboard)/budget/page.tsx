"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", type: "expense" });

  useEffect(() => {
    api.budget.list().then((data) => {
      setTransactions(data.entries || []);
      setGoals(data.goals || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.title.trim() || !form.amount) return;
    try {
      const entry = await api.budget.create({
        title: form.title, amount: parseFloat(form.amount), type: form.type,
      });
      setTransactions([entry, ...transactions]);
      setForm({ title: "", amount: "", type: "expense" });
      setShowAdd(false);
    } catch (e) { console.error(e); }
  };

  const balance = transactions.reduce((acc, t) => acc + (t.type === "income" ? t.amount : -t.amount), 0);
  const income = transactions.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => <div key={i} className="glass-card p-5 animate-pulse"><div className="h-4 bg-accent rounded w-1/2 mb-2" /><div className="h-6 bg-accent rounded w-1/3" /></div>)}
      </div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Семейный бюджет</h1>
        <p className="text-muted-foreground">Общие доходы и расходы</p>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Баланс</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>{balance.toLocaleString()} ₽</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Доходы</p>
          <p className="text-2xl font-bold text-green-600">+{income.toLocaleString()} ₽</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Расходы</p>
          <p className="text-2xl font-bold text-red-600">-{expenses.toLocaleString()} ₽</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Операции</h2>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Добавить
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="space-y-4">
            <input type="text" placeholder="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            <input type="number" placeholder="Сумма" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            <div className="flex gap-2">
              <button onClick={() => setForm({ ...form, type: "income" })} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.type === "income" ? "bg-green-500/20 text-green-600" : "bg-accent"}`}>+ Доход</button>
              <button onClick={() => setForm({ ...form, type: "expense" })} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.type === "expense" ? "bg-red-500/20 text-red-600" : "bg-accent"}`}>- Расход</button>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdd} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all">Сохранить</button>
              <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 rounded-xl bg-accent font-semibold text-sm hover:bg-accent/80 transition-all">Отмена</button>
            </div>
          </div>
        </motion.div>
      )}

      {transactions.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-12 text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Бюджет не заполнен</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Добавьте первую операцию</p>
        </motion.div>
      ) : (
        <div className="glass-card overflow-hidden">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("ru-RU")}</p>
              </div>
              <span className={`font-semibold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString()} ₽
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
