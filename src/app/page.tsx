"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const FAMILY_MEMBERS = [
  { name: "Александр", role: "Отец", initials: "А" },
  { name: "Елена", role: "Мать", initials: "Е" },
  { name: "Дмитрий", role: "Сын", initials: "Д" },
  { name: "Анна", role: "Дочь", initials: "А" },
  { name: "Мария", role: "Дочь", initials: "М" },
];

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" />
      </svg>
    ),
    title: "Семейная лента",
    desc: "Делитесь событиями, фотографиями и новостями в закрытой ленте",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: "Семейный архив",
    desc: "Храните фото, видео и документы в одном месте",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Семейное древо",
    desc: "Интерактивное дерево с историями и фотографиями",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Семейный календарь",
    desc: "Дни рождения, годовщины и важные даты",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Семейный чат",
    desc: "Общайтесь в реальном времени с push-уведомлениями",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Капсула времени",
    desc: "Отправляйте сообщения в будущее своим близким",
  },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-pink-500/08 blur-[100px] animate-float" style={{ animationDelay: "6s" }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-lg">FamilyHub</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-accent transition-colors"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Присоединиться
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Закрытая семейная сеть
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Ваша семья —
                <br />
                <span className="text-gradient">в цифровом формате</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-8">
                FamilyHub — это закрытая социальная платформа для вашей семьи. 
                Делитесь событиями, храните воспоминания, стройте семейное древо 
                и оставайтесь на связи с близкими, где бы вы ни находились.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all hover-lift"
                >
                  Создать семью
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border hover:bg-accent font-medium transition-all"
                >
                  Войти в аккаунт
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="glass-card p-8 relative">
                <div className="flex -space-x-3 mb-6">
                  {FAMILY_MEMBERS.map((m, i) => (
                    <motion.div
                      key={m.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={mounted ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${i === 0 ? 'from-purple-500 to-pink-500' : i === 1 ? 'from-blue-500 to-teal-500' : i === 2 ? 'from-orange-500 to-red-500' : i === 3 ? 'from-green-500 to-emerald-500' : 'from-indigo-500 to-purple-500'} flex items-center justify-center text-white font-bold text-lg ring-4 ring-background`}
                      style={{ zIndex: FAMILY_MEMBERS.length - i }}
                    >
                      {m.initials}
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="h-3 w-3/4 rounded-full bg-muted shimmer-bg" />
                  <div className="h-3 w-1/2 rounded-full bg-muted shimmer-bg" />
                  <div className="flex gap-3 mt-6">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex-1 h-24 rounded-xl bg-muted shimmer-bg" />
                    ))}
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">💝</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Всё для семьи в одном месте</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              FamilyHub объединяет все важные аспекты семейной жизни в безопасном цифровом пространстве
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover-lift cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-[-50%] right-[-20%] w-[60%] h-[100%] rounded-full bg-purple-500/5 blur-[80px]" />
          <h2 className="text-4xl font-bold mb-4 relative z-10">Готовы объединить семью?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8 relative z-10">
            Создайте FamilyHub для вашей семьи бесплатно. Пригласите близких и начните делиться важными моментами.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all hover-lift relative z-10"
          >
            Создать семейный аккаунт
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="font-semibold text-sm">FamilyHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FamilyHub. Сделано с любовью для семей.
          </p>
        </div>
      </footer>
    </div>
  );
}
