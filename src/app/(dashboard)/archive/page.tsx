"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const CATEGORIES = ["Все", "PHOTO", "VIDEO", "DOCUMENT", "CERTIFICATE", "HEIRLOOM"];
const CAT_NAMES: Record<string, string> = { PHOTO: "Фото", VIDEO: "Видео", DOCUMENT: "Документы", CERTIFICATE: "Свидетельства", HEIRLOOM: "Реликвии" };

export default function ArchivePage() {
  const [category, setCategory] = useState("Все");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.archive.list().then((data) => {
      setItems(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    const matchCategory = category === "Все" || item.category === category;
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="glass-card p-5 animate-pulse"><div className="h-4 bg-accent rounded w-2/3 mb-2" /><div className="h-3 bg-accent rounded w-1/3" /></div>)}
      </div>
    </div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Семейный архив</h1>
        <p className="text-muted-foreground">Фото, видео и документы вашей семьи</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="search" placeholder="Поиск в архиве..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-accent outline-none text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${category === cat ? "bg-primary text-primary-foreground" : "bg-accent hover:bg-accent/80"}`}>
              {cat === "Все" ? "Все" : CAT_NAMES[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Архив пуст</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">Добавьте семейные фото, документы и памятные вещи</p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 hover-lift cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              </div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{CAT_NAMES[item.category] || item.category}{item.year ? ` • ${item.year}` : ""}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
