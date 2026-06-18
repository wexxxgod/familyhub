"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const emojis = ["🏡", "✨", "🌳", "💬", "📸", "🎉", "🐾", "📅", "🎨", "🌟"];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="blob-deco blob-1" />
        <div className="blob-deco blob-2" />
        <div className="blob-deco blob-3" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px'
        }} />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 glass border-x-0 border-t-0 rounded-none">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🏠</span>
            <span className="font-bold text-lg text-gradient font-['Fredoka']">FamilyHub</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="px-5 py-2 text-sm font-medium rounded-full hover:bg-white/40 dark:hover:bg-white/5 transition-all">Войти</Link>
            <Link href="/login" className="btn-primary px-5 py-2 text-sm font-semibold">Присоединиться</Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-36 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm font-medium mb-8 shadow-sm">
              <span className="text-lg">🏠</span>
              Закрытая семейная сеть
              <span className="text-lg">✨</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold leading-tight mb-6 font-['Fredoka']">
              Тёплый дом для семьи <br />
              <span className="text-gradient text-glow">в digital-эпоху</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              FamilyHub — место, где ваша семья делится моментами, хранит воспоминания
              и остаётся на связи, где бы вы ни были.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="btn-primary px-7 py-3 text-base font-semibold inline-flex items-center gap-2"
              >
                Создать семью
                <span className="text-lg">→</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-border/50 hover:bg-white/40 dark:hover:bg-white/5 font-medium transition-all"
              >
                Войти
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="mt-24 grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto"
          >
            {[
              { icon: "📝", title: "Лента", desc: "События семьи", color: "from-amber-500/20 to-orange-500/10" },
              { icon: "💬", title: "Чат", desc: "Общение", color: "from-sky-500/20 to-blue-500/10" },
              { icon: "📸", title: "Моменты", desc: "Фото и видео", color: "from-rose-500/20 to-pink-500/10" },
              { icon: "📅", title: "Календарь", desc: "Планы и даты", color: "from-emerald-500/20 to-teal-500/10" },
              { icon: "🌳", title: "Древо", desc: "История рода", color: "from-amber-500/20 to-yellow-500/10" },
              { icon: "📦", title: "Архив", desc: "Семейные реликвии", color: "from-violet-500/20 to-purple-500/10" },
              { icon: "🎉", title: "События", desc: "Праздники", color: "from-pink-500/20 to-rose-500/10" },
              { icon: "📊", title: "Опросы", desc: "Решения вместе", color: "from-cyan-500/20 to-sky-500/10" },
              { icon: "🐾", title: "Питомцы", desc: "Наши любимцы", color: "from-orange-500/20 to-amber-500/10" },
              { icon: "✨", title: "Воспоминания", desc: "Ностальгия", color: "from-yellow-500/20 to-amber-500/10" },
            ].map((item) => (
              <div key={item.title} className={`bento-card p-4 text-center bg-gradient-to-br ${item.color} dark:bg-none`}>
                <div className="text-2xl mb-1.5">{item.icon}</div>
                <div className="font-semibold text-sm mb-0.5 font-['Fredoka']">{item.title}</div>
                <div className="text-[11px] text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="py-16 px-6 relative"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-['Fredoka']">
              Готовы создать <span className="text-gradient">тёплый дом</span> онлайн?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Присоединяйтесь к FamilyHub и начните делиться семейными моментами уже сегодня.
            </p>
            <Link
              href="/login"
              className="btn-primary px-8 py-3.5 text-base font-semibold inline-flex items-center gap-2"
            >
              Начать бесплатно
              <span className="text-lg">🚀</span>
            </Link>
          </div>
        </div>
      </motion.section>

      <footer className="border-t border-border/40 py-8 px-6 glass border-x-0 border-b-0 rounded-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏠</span>
            <span className="font-bold text-sm text-gradient font-['Fredoka']">FamilyHub</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FamilyHub. Сделано с ❤️ для семей</p>
        </div>
      </footer>
    </div>
  );
}
