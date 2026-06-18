"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { GradientAvatar } from "@/components/shared/GradientAvatar";
import { useStore } from "@/store";
import { api } from "@/lib/api";

export function DashboardHeader() {
  const { user: sessionUser } = useCurrentUser();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
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
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl hover:bg-accent">
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
