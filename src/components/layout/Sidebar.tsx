"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const NAV_ITEMS = [
  { label: "Лента", href: "/feed", icon: "📝" },
  { label: "Архив", href: "/archive", icon: "📦" },
  { label: "Семейное древо", href: "/family-tree", icon: "🌳" },
  { label: "Календарь", href: "/calendar", icon: "📅" },
  { label: "Чат", href: "/chat", icon: "💬" },
  { label: "Воспоминания", href: "/memories", icon: "✨" },
  { label: "Голосования", href: "/polls", icon: "📊" },
  { label: "Питомцы", href: "/pets", icon: "🐾" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user: sessionUser } = useCurrentUser();
  const [familyName, setFamilyName] = useState("FamilyHub");

  useEffect(() => {
    if (!sessionUser?.familyId) return;
    api.family.info().then((data) => {
      if (data.family?.name) setFamilyName(data.family.name);
    }).catch(() => {});
  }, [sessionUser?.familyId]);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] glass-sidebar hidden lg:flex flex-col z-40">
      <div className="p-5 border-b border-border/40">
        <Link href="/feed" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200/30 group-hover:shadow-amber-200/50 transition-shadow">
            <span className="text-white font-bold text-base">🏠</span>
          </div>
          <span className="font-semibold text-lg truncate text-gradient font-['Fredoka']">{familyName}</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "nav-link",
                isActive ? "nav-link-active" : "nav-link-inactive"
              )}
            >
              <span className="emoji-icon">{item.icon}</span>
              <span className={cn(isActive && "font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
        {sessionUser?.role === "creator" && (
          <Link
            href="/admin"
            aria-current={pathname === "/admin" ? "page" : undefined}
            className={cn(
              "nav-link mt-3 pt-3 border-t border-border/40",
              pathname === "/admin" ? "nav-link-active" : "nav-link-inactive"
            )}
          >
            <span className="emoji-icon">⚙️</span>
            <span className={cn(pathname === "/admin" && "font-semibold")}>Администрирование</span>
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-border/40">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-full bg-white/30 dark:bg-white/5">
          <span className="text-xs text-muted-foreground font-medium">🌙 Тема</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
