"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreatePostProps {
  onSubmit: (content: string) => void;
}

export function CreatePost({ onSubmit }: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent("");
    setIsExpanded(false);
  };

  return (
    <div className="glass-card overflow-hidden">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center gap-3 p-4 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
            В
          </div>
          <span className="text-muted-foreground">Поделитесь семейной новостью...</span>
        </button>
      ) : (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          className="p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
              В
            </div>
            <div>
              <p className="font-medium text-sm">Новая публикация</p>
              <p className="text-xs text-muted-foreground">Доступно только семье</p>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Что нового в вашей семье?"
            className="w-full min-h-[100px] bg-accent rounded-xl p-4 outline-none resize-none text-sm"
            autoFocus
          />

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors" title="Добавить фото">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              </button>
              <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors" title="Добавить видео">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
                </svg>
              </button>
              <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors" title="Добавить документ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setIsExpanded(false); setContent(""); }}
                className="px-4 py-2 rounded-xl text-sm hover:bg-accent transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                Опубликовать
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
