"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-15%] left-[-5%] w-[45%] h-[45%] rounded-full bg-amber-300/15 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[45%] h-[45%] rounded-full bg-rose-300/15 blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-orange-200/10 blur-[100px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🏡</span>
            <span className="font-bold text-lg" style={{ fontFamily: "Fredoka, sans-serif" }}>FamilyHub</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-accent transition-colors">Войти</Link>
            <Link href="/login" className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm shadow-amber-200/30">Присоединиться</Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/50 text-amber-700 text-sm font-medium mb-6 dark:bg-amber-900/20 dark:border-amber-700/30 dark:text-amber-300">
              <span className="text-base">🏠</span>
              Закрытая семейная сеть
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
              Тёплый дом для вашей семьи <br />
              <span className="text-gradient">в digital-эпоху</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              FamilyHub — уютное место, где ваша семья делится событиями,
              хранит воспоминания и остаётся на связи, где бы вы ни были.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all hover-lift shadow-sm shadow-amber-300/30"
              >
                Создать семью
                <span className="text-lg">→</span>
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
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {[
              { icon: "📸", title: "Моменты", desc: "Делитесь фото и событиями" },
              { icon: "💬", title: "Общение", desc: "Чат для всей семьи" },
              { icon: "📅", title: "Память", desc: "Календарь семейных дат" },
            ].map((item) => (
              <div key={item.title} className="glass-card p-4 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="font-semibold text-sm mb-1">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏡</span>
            <span className="font-bold text-sm" style={{ fontFamily: "Fredoka, sans-serif" }}>FamilyHub</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FamilyHub.</p>
        </div>
      </footer>
    </div>
  );
}
