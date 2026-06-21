"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { motion, AnimatePresence } from "framer-motion";

const MOBILE_ITEMS = [
  { href: "/feed", icon: "📝", label: "Лента" },
  { href: "/chat", icon: "💬", label: "Чат" },
  { href: "/calendar", icon: "📅", label: "Календарь" },
  { href: "/family-tree", icon: "🌳", label: "Древо" },
  { href: "/archive", icon: "📦", label: "Архив" },
  { href: "/memories", icon: "✨", label: "Воспоминания" },
  { href: "/polls", icon: "📊", label: "Опросы" },
  { href: "/pets", icon: "🐾", label: "Питомцы" },
  { href: "/member", icon: "👤", label: "Профиль" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useCurrentUser();

  const items = user?.role === "creator"
    ? [...MOBILE_ITEMS, { href: "/admin", icon: "⚙️", label: "Админ" }]
    : MOBILE_ITEMS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-40">
      <div className="relative glass border-x-0 border-b-0 rounded-none">
        <div className="flex items-stretch justify-between overflow-x-auto flex-nowrap scrollbar-hide">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1.5 transition-all duration-200",
                  "active:scale-95"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-1 rounded-2xl bg-gradient-to-b from-amber-500/15 to-orange-500/10 shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={cn(
                  "relative z-10 text-lg transition-transform duration-200",
                  isActive && "scale-110"
                )}>
                  {item.icon}
                </span>
                <span className={cn(
                  "relative z-10 text-[10px] font-medium leading-tight truncate max-w-full px-0.5 transition-colors duration-200",
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)] bg-background" />
    </nav>
  );
}
