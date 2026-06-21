"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { GradientAvatar } from "@/components/shared/GradientAvatar";
import toast from "react-hot-toast";

interface CreatePostProps {
  onSubmit: (content: string, image?: string) => void;
}

export function CreatePost({ onSubmit }: CreatePostProps) {
  const { user } = useCurrentUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if ((!content.trim() && !image) || uploading || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(content.trim(), image || undefined);
      setContent("");
      setImage(null);
      setIsExpanded(false);
    } catch {
      toast.error("Ошибка при публикации");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file, 800, 0.7);
      const res = await api.upload.file(compressed);
      setImage(res.url);
      toast.success("Фото загружено");
    } catch {
      toast.error("Ошибка загрузки фото");
    } finally {
      setUploading(false);
    }
  };

async function compressImage(file: File, maxWidth: number, quality: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(objectUrl); reject(new Error("No canvas context")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl);
        if (!blob) { reject(new Error("Compression failed")); return; }
        resolve(new File([blob], file.name, { type: "image/jpeg" }));
      }, "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load failed")); };
    img.src = objectUrl;
  });
}

  return (
    <>
      <div className="bento-card gradient-border">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center gap-3 p-5 text-left active:scale-[0.98] transition-transform"
          >
            <GradientAvatar name={user?.name} image={user?.image} size="md" className="ring-2 ring-amber-200/50 dark:ring-amber-500/20 shrink-0" />
            <span className="text-muted-foreground text-sm sm:text-base">Поделитесь семейной новостью...</span>
            <span className="ml-auto text-lg shrink-0">📝</span>
          </button>
        ) : (
          <div className="hidden sm:block">
            <DesktopForm />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm sm:hidden"
            onClick={() => { setIsExpanded(false); setContent(""); setImage(""); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 sm:hidden"
          >
            <div className="glass rounded-t-3xl rounded-b-none max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 pb-0">
                <div className="flex items-center gap-3">
                  <GradientAvatar name={user?.name} image={user?.image} size="md" className="ring-2 ring-amber-200/50 dark:ring-amber-500/20 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">✍️ Новая публикация</p>
                    <p className="text-xs text-muted-foreground">Доступно только семье</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsExpanded(false); setContent(""); setImage(""); }}
                  className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/5 transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div className="p-5">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Что нового в вашей семье?"
                  className="w-full min-h-[140px] bg-white/50 dark:bg-white/5 rounded-2xl p-4 outline-none resize-none text-sm border border-border/30 focus:border-amber-300/50 transition-all"
                  autoFocus={true}
                />
                {image && (
                  <div className="relative mt-3">
                    <img src={image} alt="preview" className="w-full rounded-2xl shadow-md" />
                    <button
                      onClick={() => setImage(null)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all backdrop-blur-sm"
                      aria-label="Удалить фото"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-3 rounded-full hover:bg-white/40 dark:hover:bg-white/5 text-muted-foreground transition-all disabled:opacity-50 active:scale-95"
                    aria-label="Добавить фото"
                  >
                    {uploading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setIsExpanded(false); setContent(""); setImage(""); }}
                      className="px-5 py-3 rounded-xl bg-accent font-medium text-sm hover:bg-accent/80 transition-all active:scale-95"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={(!content.trim() && !image) || uploading || submitting}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm disabled:opacity-50 transition-all active:scale-95"
                    >
                      {submitting ? "Публикация..." : "Опубликовать"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-[env(safe-area-inset-bottom,0px)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </>
  );

  function DesktopForm() {
    return (
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <GradientAvatar name={user?.name} image={user?.image} size="md" className="ring-2 ring-amber-200/50 dark:ring-amber-500/20" />
          <div>
            <p className="font-medium text-sm">✍️ Новая публикация</p>
            <p className="text-xs text-muted-foreground">Доступно только семье</p>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Что нового в вашей семье?"
          className="w-full min-h-[120px] bg-white/50 dark:bg-white/5 rounded-2xl p-4 outline-none resize-none text-sm border border-border/30 focus:border-amber-300/50 transition-all"
          autoFocus={true}
        />

        {image && (
          <div className="relative mt-3">
            <img src={image} alt="preview" className="w-full rounded-2xl shadow-md" />
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all backdrop-blur-sm"
              aria-label="Удалить фото"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2.5 rounded-full hover:bg-white/40 dark:hover:bg-white/5 text-muted-foreground transition-all disabled:opacity-50"
              aria-label="Добавить фото"
            >
              {uploading ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setIsExpanded(false); setContent(""); setImage(""); }}
              className="btn-ghost px-4 py-2 text-sm"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={(!content.trim() && !image) || uploading || submitting}
              className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
            >
              {submitting ? "Публикация..." : "Опубликовать"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
