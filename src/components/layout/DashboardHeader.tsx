"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { GradientAvatar } from "@/components/shared/GradientAvatar";
import { useStore } from "@/store";
import { api } from "@/lib/api";

const DRAWER_ITEMS = [
  { label: "Лента", href: "/feed", icon: "📝" },
  { label: "Архив", href: "/archive", icon: "📦" },
  { label: "Семейное древо", href: "/family-tree", icon: "🌳" },
  { label: "Календарь", href: "/calendar", icon: "📅" },
  { label: "Чат", href: "/chat", icon: "💬" },
  { label: "Воспоминания", href: "/memories", icon: "✨" },
  { label: "Голосования", href: "/polls", icon: "📊" },
  { label: "Питомцы", href: "/pets", icon: "🐾" },
];

export function DashboardHeader() {
  const { user: sessionUser } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const notifications = useStore((s) => s.notifications);
  const unreadCount = useStore((s) => s.unreadCount);
  const fetchNotifications = useStore((s) => s.fetchNotifications);
  const markNotificationRead = useStore((s) => s.markNotificationRead);
  const markAllRead = useStore((s) => s.markAllRead);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  useEffect(() => { const t = setInterval(fetchNotifications, 15000); return () => clearInterval(t); }, [fetchNotifications]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    const t = setTimeout(async () => {
      try { setSearchResults(await api.search.query(searchQuery)); }
      catch { setSearchResults(null); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setNotifOpen(false);
        setSearchOpen(false);
        setDrawerOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-30 glass border-x-0 border-t-0 rounded-none">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4 lg:hidden">
          <button aria-label="Открыть меню" onClick={() => setDrawerOpen(true)} className="p-2.5 rounded-full hover:bg-white/40 dark:hover:bg-white/5 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xs">🏠</span>
            </div>
            <span className="font-semibold text-gradient font-['Fredoka']">FamilyHub</span>
          </Link>
        </div>

        <div className="hidden lg:block" />

          <div className="relative max-w-md w-full mx-4">
            <div className="hidden sm:block">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="search"
                aria-label="Поиск"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/60 dark:bg-white/5 border border-border/30 outline-none text-sm focus:border-amber-300/50 transition-all"
              />
            </div>
            <div className="hidden sm:block">
              {searchResults && searchQuery.trim() && (
                <div className="absolute top-full mt-2 left-0 right-0 glass-card p-2 z-50 max-h-80 overflow-y-auto">
                  {searchResults.posts?.length > 0 && <p className="text-xs text-muted-foreground px-3 pt-2 pb-1">Посты</p>}
                  {searchResults.posts?.slice(0, 3).map((p: any) => (
                    <button key={p.id} onClick={() => { router.push("/feed"); setSearchQuery(""); setSearchResults(null); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors">
                      {p.content?.slice(0, 80)}...
                    </button>
                  ))}
                  {searchResults.users?.length > 0 && <p className="text-xs text-muted-foreground px-3 pt-2 pb-1">Пользователи</p>}
                  {searchResults.users?.slice(0, 3).map((u: any) => (
                    <div key={u.id} className="px-3 py-2 text-sm">{u.name}</div>
                  ))}
                  {searchResults.archive?.length > 0 && <p className="text-xs text-muted-foreground px-3 pt-2 pb-1">Архив</p>}
                  {searchResults.archive?.slice(0, 3).map((a: any) => (
                    <button key={a.id} onClick={() => { router.push("/archive"); setSearchQuery(""); setSearchResults(null); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors">
                      {a.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        <div className="flex items-center gap-0.5">
          <button onClick={() => setSearchOpen(!searchOpen)} className="sm:hidden p-2.5 rounded-full hover:bg-white/40 dark:hover:bg-white/5 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </button>

          <ThemeToggle />

          <div className="relative">
            <button aria-label="Уведомления" onClick={() => setNotifOpen(!notifOpen)} className="relative p-2.5 rounded-full hover:bg-white/40 dark:hover:bg-white/5 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-3 w-80 glass-card p-3 z-50 max-h-96 overflow-y-auto shadow-xl">
                  <div className="flex items-center justify-between px-3 pb-2 border-b border-border/40 mb-2">
                    <p className="font-semibold text-sm">🔔 Уведомления</p>
                    {unreadCount > 0 && (
                      <button onClick={() => { markAllRead(); }} className="text-xs text-primary font-medium hover:opacity-80">Прочитать все</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Нет уведомлений ✨</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => { if (!n.read) markNotificationRead(n.id); }}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all ${
                          !n.read
                            ? "bg-gradient-to-r from-amber-500/8 to-orange-500/5"
                            : "hover:bg-white/40 dark:hover:bg-white/5"
                        }`}
                      >
                        <p className="font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button aria-label="Меню пользователя" onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 p-1 rounded-full hover:bg-white/40 dark:hover:bg-white/5 transition-all ring-1 ring-border/30">
              <GradientAvatar name={sessionUser?.name} image={sessionUser?.image} size="md" className="!w-8 !h-8" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-3 w-56 glass-card p-2 z-50 shadow-xl">
                  <div className="px-4 py-3 border-b border-border/40 mb-1">
                    <p className="font-medium text-sm">{sessionUser?.name}</p>
                    <p className="text-xs text-muted-foreground">{sessionUser?.email}</p>
                  </div>
                  <Link href="/member" className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm hover:bg-white/40 dark:hover:bg-white/5 transition-colors" onClick={() => setMenuOpen(false)}>👤 Мой профиль</Link>
                  <button onClick={handleLogout} disabled={loggingOut} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full disabled:opacity-30 disabled:cursor-not-allowed">🚪 {loggingOut ? "Выход..." : "Выйти"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setDrawerOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-[280px] z-50 glass-sidebar shadow-2xl lg:hidden animate-drawer-in overflow-y-auto flex flex-col">
            {sessionUser && (
              <div className="p-4 shrink-0">
                <div className="flex items-center gap-3 mb-3">
                  <GradientAvatar name={sessionUser.name} image={sessionUser.image} size="md" className="!w-10 !h-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{sessionUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{sessionUser.email}</p>
                  </div>
                  <button aria-label="Закрыть меню" onClick={() => setDrawerOpen(false)} className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/5 transition-all shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
                <Link
                  href="/member"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-primary font-medium text-sm hover:from-amber-500/25 hover:to-orange-500/20 transition-all"
                >
                  👤 Мой профиль
                </Link>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {DRAWER_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "nav-link",
                      isActive ? "nav-link-active" : "nav-link-inactive"
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className={cn(isActive && "font-semibold")}>{item.label}</span>
                  </Link>
                );
              })}
              {sessionUser?.role === "creator" && (
                <Link
                  href="/admin"
                  aria-current={pathname === "/admin" ? "page" : undefined}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "nav-link mt-3 pt-3 border-t border-border/40",
                    pathname === "/admin" ? "nav-link-active" : "nav-link-inactive"
                  )}
                >
                  <span className="shrink-0">⚙️</span>
                  <span className={cn(pathname === "/admin" && "font-semibold")}>Администрирование</span>
                </Link>
              )}
            </nav>

            <div className="p-4 border-t border-border/40 space-y-3 shrink-0">
              <div className="flex items-center justify-between px-4 py-2.5 rounded-full bg-white/30 dark:bg-white/5">
                <span className="text-xs text-muted-foreground font-medium">🌙 Тема</span>
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full text-sm text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
              >
                🚪 {loggingOut ? "Выход..." : "Выйти"}
              </button>
            </div>
          </div>
        </>
      )}

      {searchOpen && (
        <div className="lg:hidden px-4 pb-3 relative">
          <input type="search" placeholder="Поиск..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" autoFocus aria-label="Поиск" />
          {searchResults && searchQuery.trim() && (
            <div className="absolute top-full mt-2 left-4 right-4 glass-card p-2 z-50 max-h-80 overflow-y-auto">
              {searchResults.posts?.length > 0 && <p className="text-xs text-muted-foreground px-3 pt-2 pb-1">Посты</p>}
              {searchResults.posts?.slice(0, 3).map((p: any) => (
                <button key={p.id} onClick={() => { router.push("/feed"); setSearchQuery(""); setSearchResults(null); setSearchOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors">
                  {p.content?.slice(0, 80)}...
                </button>
              ))}
              {searchResults.users?.length > 0 && <p className="text-xs text-muted-foreground px-3 pt-2 pb-1">Пользователи</p>}
              {searchResults.users?.slice(0, 3).map((u: any) => (
                <div key={u.id} className="px-3 py-2 text-sm">{u.name}</div>
              ))}
              {searchResults.archive?.length > 0 && <p className="text-xs text-muted-foreground px-3 pt-2 pb-1">Архив</p>}
              {searchResults.archive?.slice(0, 3).map((a: any) => (
                <button key={a.id} onClick={() => { router.push("/archive"); setSearchQuery(""); setSearchResults(null); setSearchOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors">
                  {a.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
