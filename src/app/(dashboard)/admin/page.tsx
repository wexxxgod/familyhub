"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const TABS = ["Обзор", "Пользователи", "Настройки", "Бэкап"];

export default function AdminPage() {
  const [tab, setTab] = useState("Обзор");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.stats().then((data) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats
    ? [
        { label: "Члены семьи", value: String(stats.users || 0), color: "from-purple-500/20 to-pink-500/20" },
        { label: "Посты", value: String(stats.posts || 0), color: "from-blue-500/20 to-cyan-500/20" },
        { label: "События", value: String(stats.events || 0), color: "from-green-500/20 to-emerald-500/20" },
        { label: "Сообщения", value: String(stats.messages || 0), color: "from-amber-500/20 to-orange-500/20" },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Панель администратора</h1>
        <p className="text-muted-foreground">Управление семейным пространством</p>
      </motion.div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-accent hover:bg-accent/80"}`}>{t}</button>
        ))}
      </div>

      {tab === "Обзор" && (
        loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="glass-card p-5 animate-pulse"><div className="h-10 bg-accent rounded w-12 mb-2" /><div className="h-3 bg-accent rounded w-2/3" /></div>)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS.map((stat) => (
              <div key={stat.label} className="glass-card p-5">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "Пользователи" && (
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Управление пользователями появится в следующем обновлении</p>
        </div>
      )}

      {tab === "Настройки" && (
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Настройки пространства</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Название семьи</p>
                <p className="text-xs text-muted-foreground">Как будет называться ваше семейное пространство</p>
              </div>
              <input type="text" placeholder="Семья" className="px-4 py-2 rounded-xl bg-accent outline-none text-sm w-48" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Видимость ленты</p>
                <p className="text-xs text-muted-foreground">Кто может видеть посты</p>
              </div>
              <select className="px-4 py-2 rounded-xl bg-accent outline-none text-sm">
                <option>Только семья</option>
                <option>Только родители</option>
              </select>
            </div>
            <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all">Сохранить</button>
          </div>
        </div>
      )}

      {tab === "Бэкап" && (
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Резервное копирование</h3>
          <p className="text-sm text-muted-foreground mb-6">Создайте резервную копию всех данных семьи</p>
          <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all">Создать бэкап</button>
        </div>
      )}
    </div>
  );
}
