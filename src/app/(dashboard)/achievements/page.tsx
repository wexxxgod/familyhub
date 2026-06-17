"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const GOAL_TEMPLATES = [
  { title: "Создать семейное древо", description: "Добавьте первого члена семьи", icon: "tree", xp: 100 },
  { title: "Первый пост", description: "Опубликуйте запись в семейной ленте", icon: "post", xp: 50 },
  { title: "Общий бюджет", description: "Добавьте первую операцию в бюджет", icon: "wallet", xp: 75 },
  { title: "Капсула времени", description: "Создайте послание в будущее", icon: "capsule", xp: 150 },
  { title: "Семейный опрос", description: "Создайте первый опрос", icon: "poll", xp: 50 },
  { title: "Пригласить родных", description: "Добавьте 5 членов семьи", icon: "users", xp: 200 },
];

const ACHIEVEMENTS_LIST = [
  { title: "Первые шаги", description: "Зарегистрироваться в FamilyHub", xp: 50, unlocked: true },
  { title: "Главный летописец", description: "Опубликовать 10 постов", xp: 100, unlocked: false },
  { title: "Финансист", description: "Вести бюджет 30 дней подряд", xp: 200, unlocked: false },
  { title: "Хранитель истории", description: "Заполнить архив", xp: 100, unlocked: false },
  { title: "Душа компании", description: "Создать 5 опросов", xp: 150, unlocked: false },
  { title: "Объединитель", description: "Пригласить 10 членов семьи", xp: 250, unlocked: false },
];

export default function AchievementsPage() {
  const [achievements] = useState(ACHIEVEMENTS_LIST);
  const [goals] = useState(GOAL_TEMPLATES);

  const totalXp = achievements.filter((a) => a.unlocked).reduce((s, a) => s + a.xp, 0);
  const totalAvailable = achievements.reduce((s, a) => s + a.xp, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Достижения</h1>
        <p className="text-muted-foreground">Зарабатывайте XP и открывайте достижения</p>
      </motion.div>

      <div className="glass-card p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">Ваш уровень</p>
          <span className="text-sm font-semibold">{totalXp} XP</span>
        </div>
        <div className="w-full bg-accent rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
            style={{ width: `${totalAvailable > 0 ? Math.min((totalXp / totalAvailable) * 100, 100) : 0}%` }}
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Достижения</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {achievements.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-5 ${!a.unlocked ? "opacity-50" : ""}`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.unlocked ? "from-purple-500/20 to-pink-500/20" : "from-gray-500/10 to-gray-500/10"} flex items-center justify-center mb-3`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={a.unlocked ? "text-purple-500" : "text-muted-foreground"}>
                <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm">{a.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
            <p className="text-xs text-primary mt-2">+{a.xp} XP</p>
          </motion.div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Цели на будущее</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g, i) => (
          <motion.div
            key={g.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm">{g.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{g.description}</p>
            <p className="text-xs text-amber-600 mt-2">+{g.xp} XP</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
