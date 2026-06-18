"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const MOBILE_ITEMS = [
  { href: "/feed", icon: "📝", label: "Лента" },
  { href: "/chat", icon: "💬", label: "Чат" },
  { href: "/calendar", icon: "📅", label: "Календарь" },
  { href: "/family-tree", icon: "🌳", label: "Древо" },
  { href: "/memories", icon: "✨", label: "Воспоминания" },
  { href: "/polls", icon: "📊", label: "Опросы" },
  { href: "/archive", icon: "📦", label: "Архив" },
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
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden glass border-x-0 border-b-0 rounded-none z-40">
      <div className="flex items-center overflow-x-auto flex-nowrap py-2 px-2 gap-0.5 scrollbar-hide">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[56px]",
                isActive
                  ? "bg-gradient-to-b from-amber-500/15 to-orange-500/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
