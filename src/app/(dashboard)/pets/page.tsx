"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonGrid } from "@/components/shared/SkeletonCard";
import { DeleteButton } from "@/components/shared/DeleteButton";
import { FileUpload } from "@/components/shared/FileUpload";
import { ImageViewer } from "@/components/shared/ImageViewer";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import toast from "react-hot-toast";

const SPECIES_LIST = ["Собака", "Кошка", "Птица", "Рыбка", "Хомяк", "Кролик", "Черепаха", "Другое"];

function getAge(dateOfBirth: string | null): string {
  if (!dateOfBirth) return "";
  const diff = Date.now() - new Date(dateOfBirth).getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  if (years > 0) return `${years} ${years === 1 ? "год" : years < 5 ? "года" : "лет"}`;
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (months > 0) return `${months} ${months === 1 ? "месяц" : months < 5 ? "месяца" : "месяцев"}`;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${days} ${days === 1 ? "день" : days < 5 ? "дня" : "дней"}`;
}

export default function PetsPage() {
  const { user } = useCurrentUser();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    species: "Собака",
    breed: "",
    dateOfBirth: "",
    photo: "",
    notes: "",
  });

  const [albumPet, setAlbumPet] = useState<any | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const albumFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.pets.list().then((data) => {
      setPets(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || creating) return;
    setCreating(true);
    try {
      const pet = await api.pets.create(form);
      setPets([pet, ...pets]);
      setForm({ name: "", species: "Собака", breed: "", dateOfBirth: "", photo: "", notes: "" });
      setShowCreate(false);
      toast.success("Питомец добавлен");
    } catch { toast.error("Ошибка при создании"); }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await api.pets.delete(id);
      setPets(pets.filter((p) => p.id !== id));
      toast.success("Питомец удалён");
    } catch { toast.error("Ошибка при удалении"); }
    setDeletingId(null);
  };

  const openAlbum = async (pet: any) => {
    setAlbumPet(pet);
    setPhotosLoading(true);
    try {
      const data = await api.pets.photos.list(pet.id);
      setPhotos(data);
    } catch { toast.error("Ошибка загрузки фото"); }
    setPhotosLoading(false);
  };

  const closeAlbum = () => {
    setAlbumPet(null);
    setPhotos([]);
    setAddingPhoto(false);
  };

  const handleAlbumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !albumPet) return;
    setAddingPhoto(true);
    try {
      for (const file of files) {
        const res = await api.upload.file(file);
        await api.pets.photos.add(albumPet.id, res.url);
      }
      const updated = await api.pets.photos.list(albumPet.id);
      setPhotos(updated);
      toast.success(`Добавлено ${files.length} фото`);
    } catch { toast.error("Ошибка загрузки"); }
    setAddingPhoto(false);
    if (albumFileRef.current) albumFileRef.current.value = "";
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (deletingPhotoId) return;
    setDeletingPhotoId(photoId);
    try {
      await api.pets.photos.delete(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success("Фото удалено");
    } catch { toast.error("Ошибка удаления"); }
    setDeletingPhotoId(null);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <PageHeader title="Наши любимцы" description="Все питомцы семьи" />
        <SkeletonGrid count={6} lines={2} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageHeader
        title="Наши любимцы"
        description="Все питомцы семьи"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Добавить
          </button>
        }
      />

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card p-6 mb-8 max-w-xl"
          >
            <h3 className="font-semibold mb-4">Новый питомец</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Кличка *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm"
              />
              <select
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm"
              >
                {SPECIES_LIST.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Порода"
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm"
              />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Дата рождения</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm"
                />
              </div>
              <textarea
                placeholder="Заметки"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent outline-none text-sm min-h-[60px]"
              />
              <FileUpload
                onUploadComplete={([url]) => setForm({ ...form, photo: url })}
                label="Загрузить фото"
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={creating || !form.name.trim()}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {creating ? "Добавление..." : "Добавить"}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-6 py-2.5 rounded-xl bg-accent font-semibold text-sm hover:bg-accent/80 transition-all"
                >
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {pets.length === 0 && !showCreate ? (
        <EmptyState
          icon={
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500">
              <path d="M20 7c-1 0-2 .5-2 2 0 1.5 1 2 1 4 0 2-1 3-3 3" />
              <path d="M4 7c1 0 2 .5 2 2 0 1.5-1 2-1 4 0 2 1 3 3 3" />
              <path d="M12 17c-2 0-4-1-4-3 0-3 2-5 4-5s4 2 4 5c0 2-2 3-4 3z" />
            </svg>
          }
          title="Питомцев пока нет"
          description="Добавьте первого питомца в семью"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <motion.div
              key={pet.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card overflow-hidden relative group"
            >
              <DeleteButton onClick={() => handleDelete(pet.id)} disabled={deletingId === pet.id} />
              <div className="h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center overflow-hidden">
                {pet.photo ? (
                  <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                    <path d="M20 7c-1 0-2 .5-2 2 0 1.5 1 2 1 4 0 2-1 3-3 3" />
                    <path d="M4 7c1 0 2 .5 2 2 0 1.5-1 2-1 4 0 2 1 3 3 3" />
                    <path d="M12 17c-2 0-4-1-4-3 0-3 2-5 4-5s4 2 4 5c0 2-2 3-4 3z" />
                  </svg>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-1">{pet.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{pet.species}</span>
                  {pet.breed && <><span>•</span><span>{pet.breed}</span></>}
                </div>
                {pet.dateOfBirth && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {getAge(pet.dateOfBirth)}
                    {pet.dateOfBirth && ` (${new Date(pet.dateOfBirth).toLocaleDateString("ru-RU")})`}
                  </p>
                )}
                {pet.notes && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{pet.notes}</p>
                )}
                {pet.owner && (
                  <p className="text-xs text-muted-foreground mt-3">Владелец: {pet.owner.name || "—"}</p>
                )}
                <button
                  onClick={() => openAlbum(pet)}
                  className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                  Альбом
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {albumPet && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={closeAlbum} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Фотоальбом: {albumPet.name}</h2>
                  <button onClick={closeAlbum} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>

                <div className="mb-4">
                  <button
                    onClick={() => albumFileRef.current?.click()}
                    disabled={addingPhoto}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {addingPhoto ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Добавить фото
                      </>
                    )}
                  </button>
                  <input
                    ref={albumFileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAlbumUpload}
                  />
                </div>

                {photosLoading ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-accent animate-pulse" />
                    ))}
                  </div>
                ) : photos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <svg className="mx-auto mb-3" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p className="text-sm">Фото пока нет</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-accent">
                        <img
                          src={photo.url}
                          alt={photo.caption || ""}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setViewImage(photo.url)}
                        />
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          disabled={deletingPhotoId === photo.id}
                          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm disabled:opacity-30"
                          aria-label="Удалить фото"
                        >
                          {deletingPhotoId === photo.id ? (
                            <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}
    </div>
  );
}
