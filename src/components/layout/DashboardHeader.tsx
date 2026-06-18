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
  { label: "Лента", href: "/feed", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></svg> },
  { label: "Архив", href: "/archive", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
  { label: "Семейное древо", href: "/family-tree", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg> },
  { label: "Календарь", href: "/calendar", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
  { label: "Чат", href: "/chat", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
  { label: "Воспоминания", href: "/memories", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
  { label: "Голосования", href: "/polls", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> },
  { label: "Питомцы", href: "/pets", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7c-1 0-2 .5-2 2 0 1.5 1 2 1 4 0 2-1 3-3 3" /><path d="M4 7c1 0 2 .5 2 2 0 1.5-1 2-1 4 0 2 1 3 3 3" /><path d="M12 17c-2 0-4-1-4-3 0-3 2-5 4-5s4 2 4 5c0 2-2 3-4 3z" /></svg> },
  { label: "Профиль", href: "/member", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
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

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4 lg:hidden">
          <button aria-label="Открыть меню" onClick={() => setDrawerOpen(true)} className="p-2 rounded-xl hover:bg-accent">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="font-semibold">FamilyHub</span>
          </Link>
        </div>

        <div className="hidden lg:block" />

        <div className="relative max-w-md w-full mx-4">
          <div className="hidden sm:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="search"
              aria-label="Поиск"
              placeholder="Поиск по сайту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-accent border-none outline-none text-sm focus:ring-1 focus:ring-ring transition-all"
            />
          </div>
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

        <div className="flex items-center gap-1">
          <button onClick={() => setSearchOpen(!searchOpen)} className="sm:hidden p-2 rounded-xl hover:bg-accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </button>

          <ThemeToggle />

          <div className="relative">
            <button aria-label="Уведомления" onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-xl hover:bg-accent transition-colors">
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
                <div className="absolute right-0 top-full mt-2 w-80 glass-card p-2 z-50 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border mb-2">
                    <p className="font-semibold text-sm">Уведомления</p>
                    {unreadCount > 0 && (
                      <button onClick={() => { markAllRead(); }} className="text-xs text-primary hover:underline">Прочитать все</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Нет уведомлений</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => { if (!n.read) markNotificationRead(n.id); }}
                        className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors ${!n.read ? "bg-accent/50" : "hover:bg-accent/30"}`}
                      >
                        <p className="font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.message}</p>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button aria-label="Меню пользователя" onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-accent transition-colors">
              <GradientAvatar name={sessionUser?.name} image={sessionUser?.image} size="md" className="!w-8 !h-8" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 z-50">
                  <div className="px-3 py-2 border-b border-border mb-2">
                    <p className="font-medium text-sm">{sessionUser?.name}</p>
                    <p className="text-xs text-muted-foreground">{sessionUser?.email}</p>
                  </div>
                  <Link href="/member" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors" onClick={() => setMenuOpen(false)}>Мой профиль</Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full">Выйти</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setDrawerOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-[280px] z-50 bg-background border-r border-border shadow-2xl lg:hidden animate-drawer-in overflow-y-auto">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <Link href="/feed" className="flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="font-semibold text-lg">FamilyHub</span>
              </Link>
              <button aria-label="Закрыть меню" onClick={() => setDrawerOpen(false)} className="p-2 rounded-xl hover:bg-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {DRAWER_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px]",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <span className={cn(isActive ? "text-primary" : "text-muted-foreground", "shrink-0")}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
              {sessionUser?.role === "creator" && (
                <Link
                  href="/admin"
                  aria-current={pathname === "/admin" ? "page" : undefined}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px]",
                    pathname === "/admin" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Администрирование
                </Link>
              )}
            </nav>
            <div className="p-3 border-t border-border mt-4">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-muted-foreground">Сменить тему</span>
                <ThemeToggle />
              </div>
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
