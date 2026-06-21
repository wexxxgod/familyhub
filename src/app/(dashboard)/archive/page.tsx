"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ImageViewer } from "@/components/shared/ImageViewer";
import { DeleteButton } from "@/components/shared/DeleteButton";
import { FileUpload } from "@/components/shared/FileUpload";
import toast from "react-hot-toast";

const CATEGORIES = ["Все", "PHOTO", "VIDEO", "DOCUMENT", "CERTIFICATE", "HEIRLOOM"];
const CAT_NAMES: Record<string, string> = { PHOTO: "Фото", VIDEO: "Видео", DOCUMENT: "Документы", CERTIFICATE: "Свидетельства", HEIRLOOM: "Реликвии" };
const CAT_ICONS: Record<string, string> = {
  PHOTO: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  VIDEO: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  DOCUMENT: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  CERTIFICATE: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  HEIRLOOM: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
};

export default function ArchivePage() {
  const { user } = useCurrentUser();
  const currentUserId = user?.id;
  const [category, setCategory] = useState("Все");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [form, setForm] = useState({ title: "", description: "", images: [] as string[], url: "", category: "PHOTO", year: "" });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") { setShowModal(false); setEditingItem(null); return; }
    if (e.key !== "Tab" || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, []);

  useEffect(() => {
    if (showModal) {
      document.addEventListener("keydown", handleKeyDown);
      modalRef.current?.querySelector<HTMLElement>('button, input, select, textarea, [href]')?.focus();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal, handleKeyDown]);

  useEffect(() => {
    api.archive.list().then((data) => {
      setItems(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await api.archive.delete(id);
      setItems(items.filter((item) => item.id !== id));
      toast.success("Элемент удалён из архива");
    } catch { toast.error("Ошибка при удалении"); }
    setDeletingId(null);
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm({ title: "", description: "", images: [], url: "", category: "PHOTO", year: "" });
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      images: item.images || [],
      url: item.url || "",
      category: item.category || "PHOTO",
      year: item.year?.toString() || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Введите название"); return; }
    setSubmitting(true);
    try {
      if (editingItem) {
        const updated = await api.archive.update(editingItem.id, {
          title: form.title.trim(),
          description: form.description.trim(),
          images: form.images,
          url: form.url.trim() || undefined,
          category: form.category,
          year: form.year || undefined,
        });
        setItems(items.map((item) => (item.id === editingItem.id ? updated : item)));
        toast.success("Элемент обновлён");
      } else {
        const item = await api.archive.create({
          title: form.title.trim(),
          description: form.description.trim(),
          images: form.images,
          url: form.url.trim() || undefined,
          category: form.category,
          year: form.year || undefined,
        });
        setItems([item, ...items]);
        toast.success("Элемент добавлен в архив");
      }
      setShowModal(false);
      setEditingItem(null);
    } catch {
      toast.error(editingItem ? "Ошибка при обновлении" : "Ошибка при добавлении");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const res = await api.upload.file(file);
        urls.push(res.url);
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      toast.success(`Загружено ${urls.length} файлов`);
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

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
        <div className="flex gap-2 flex-wrap items-center">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${category === cat ? "bg-primary text-primary-foreground" : "bg-accent hover:bg-accent/80"}`}>
              {cat === "Все" ? "Все" : CAT_NAMES[cat] || cat}
            </button>
          ))}
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 transition-all ml-2"
          >
            + Добавить
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Архив пуст</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">Добавьте семейные фото, документы и памятные вещи</p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => {
            const allImages = [...(item.images || []), ...(item.url ? [item.url] : [])];
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 relative group">
                {(currentUserId && item.uploadedById === currentUserId) && (
                  <>
                    <DeleteButton onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} />
                    <button
                      onClick={() => openEdit(item)}
                      className="absolute top-3 right-12 p-1.5 rounded-lg bg-accent hover:bg-accent/80 transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Редактировать"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                  </>
                )}
                {allImages.length > 0 && (
                  <div className="mb-3">
                    <div className={`grid gap-2 ${allImages.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {allImages.slice(0, allImages.length === 1 ? 1 : 4).map((src: string, idx: number) => (
                        <div key={idx} className="rounded-xl overflow-hidden cursor-pointer" onClick={() => setViewImage(src)}>
                          <img src={src} alt="" className="w-full aspect-square object-cover" />
                        </div>
                      ))}
                    </div>
                    {allImages.length > 4 && (
                      <p className="text-xs text-muted-foreground mt-1">+{allImages.length - 4} ещё</p>
                    )}
                  </div>
                )}
                {allImages.length === 0 && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 flex items-center justify-center mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rose-500">
                      <path d={CAT_ICONS[item.category as keyof typeof CAT_ICONS] || "M4 19.5A2.5 2.5 0 0 1 6.5 17H20"} />
                    </svg>
                  </div>
                )}
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                {item.description && <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{item.description}</p>}
                <p className="text-xs text-muted-foreground">{CAT_NAMES[item.category] || item.category}{item.year ? ` • ${item.year}` : ""}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setShowModal(false); setEditingItem(null); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div ref={modalRef} role="dialog" aria-modal="true" aria-label={editingItem ? "Редактировать" : "Добавить в архив"} className="glass-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{editingItem ? "Редактировать" : "Добавить в архив"}</h2>
                  <button onClick={() => { setShowModal(false); setEditingItem(null); }} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Название *</label>
                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                      placeholder="Название элемента" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Описание</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all min-h-[80px] resize-none"
                      placeholder="Краткое описание" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Категория *</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all">
                      {CATEGORIES.filter((c) => c !== "Все").map((cat) => (
                        <option key={cat} value={cat}>{CAT_NAMES[cat]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Год</label>
                    <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                      placeholder="2024" min="1900" max="2099" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">URL ссылка</label>
                    <input type="text" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                      placeholder="URL изображения или документа" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Изображения</label>
                    <button type="button" onClick={() => document.getElementById("archive-file-input")?.click()}
                      disabled={uploading}
                      className="w-full px-4 py-3 rounded-xl bg-accent hover:bg-accent/80 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {uploading ? (
                        <><div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> Загрузка...</>
                      ) : (
                        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg> Загрузить изображения</>
                      )}
                    </button>
                    <input id="archive-file-input" type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                    {form.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {form.images.map((url, i) => (
                          <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-accent">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(i)}
                              className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={submitting || !form.title.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50">
                    {submitting ? "Сохранение..." : editingItem ? "Сохранить" : "Добавить в архив"}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}
    </div>
  );
}
