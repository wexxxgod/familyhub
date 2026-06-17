"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

export default function CalendarPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", type: "CUSTOM" });

  useEffect(() => {
    api.calendar.list().then((data) => {
      setEvents(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.date) return;
    try {
      const evt = await api.calendar.create({ title: form.title, date: form.date, type: form.type });
      setEvents([...events, evt]);
      setForm({ title: "", date: "", type: "CUSTOM" });
      setShowCreate(false);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.calendar.delete(id);
      setEvents(events.filter((e) => e.id !== id));
      toast.success("Событие удалено");
    } catch { toast.error("Ошибка при удалении"); }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const monthEvents = events.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const eventDays = new Set(monthEvents.map((e) => new Date(e.date).getDate()));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Семейный календарь</h1>
          <p className="text-muted-foreground">Дни рождения, годовщины и важные даты</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">+ Событие</button>
      </motion.div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="space-y-3">
            <input type="text" placeholder="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
            <div className="flex gap-3">
              <button onClick={handleCreate} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all">Сохранить</button>
              <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 rounded-xl bg-accent font-semibold text-sm hover:bg-accent/80 transition-all">Отмена</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else setCurrentMonth(currentMonth - 1); }} className="p-2 rounded-xl hover:bg-accent transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <h2 className="text-lg font-semibold">{MONTHS[currentMonth]} {currentYear}</h2>
            <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else setCurrentMonth(currentMonth + 1); }} className="p-2 rounded-xl hover:bg-accent transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasEvent = eventDays.has(day);
              const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
              return (
                <div key={day} className={`relative text-center py-2.5 text-sm rounded-xl transition-colors ${isToday ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-accent"} ${hasEvent && !isToday ? "font-semibold" : ""}`}>
                  {day}
                  {hasEvent && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">События месяца</h3>
          {monthEvents.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>
              </div>
              <p className="text-sm text-muted-foreground">Нет событий</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthEvents.map((event) => (
                <div key={event.id} className="p-3 rounded-xl bg-accent relative group">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</p>
                  {(currentUserId && event.createdById === currentUserId) && (
                    <button onClick={() => handleDelete(event.id)} className="absolute top-1 right-1 p-1 rounded-md bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
