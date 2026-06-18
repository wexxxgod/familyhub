"use client";

import { useState } from "react";
import { formatRelativeDate, formatNumber } from "@/lib/utils";
import { ImageViewer } from "@/components/shared/ImageViewer";
import { GradientAvatar } from "@/components/shared/GradientAvatar";
import toast from "react-hot-toast";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  currentUserRole?: string;
  onToggleLike: () => void;
  onComment: (content: string) => Promise<void>;
  onDelete?: (id: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onEdit?: (id: string, data: { content: string; tags?: string[] }) => Promise<void>;
  isLiking?: boolean;
  isDeleting?: boolean;
}

export function PostCard({ post, currentUserId, currentUserRole, onToggleLike, onComment, onDelete, onDeleteComment, onEdit, isLiking, isDeleting }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [likeAnim, setLikeAnim] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [editTags, setEditTags] = useState(post.tags?.join(", ") || "");
  const [editSaving, setEditSaving] = useState(false);

  const canDelete = currentUserId && (post.authorId === currentUserId || post.author?.id === currentUserId || currentUserRole === "PARENT");
  const canEdit = currentUserId && (post.authorId === currentUserId || post.author?.id === currentUserId);

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editSaving || !onEdit) return;
    setEditSaving(true);
    try {
      const tags = editTags.split(",").map((t: string) => t.trim()).filter(Boolean);
      await onEdit(post.id, { content: editContent.trim(), tags: tags.length ? tags : undefined });
      setEditing(false);
      toast.success("Пост обновлён");
    } catch {
      toast.error("Ошибка при обновлении");
    } finally {
      setEditSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(post.content || "");
    setEditTags(post.tags?.join(", ") || "");
    setEditing(false);
  };

  const handleComment = async () => {
    if (!commentText.trim() || sending) return;
    setSending(true);
    try {
      await onComment(commentText.trim());
      setCommentText("");
    } catch {
      toast.error("Ошибка при отправке комментария");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="bento-card gradient-border">
        <div className="flex items-center gap-3 p-5 pb-3">
          <GradientAvatar name={post.author?.name} image={post.author?.image} size="md" className="ring-2 ring-amber-200/50 dark:ring-amber-500/20" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{post.author?.name || "Пользователь"}</p>
            <p className="text-xs text-muted-foreground">{formatRelativeDate(post.createdAt)}</p>
          </div>
          <div className="flex items-center gap-1">
            {canEdit && onEdit && (
              <button onClick={() => setEditing(!editing)} className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5 transition-colors" aria-label="Редактировать">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
            {canDelete && onDelete && (
              <button onClick={() => onDelete(post.id)} disabled={isDeleting} className="p-2 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Удалить">
                {isDeleting ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="px-5 pb-3">
          {editing ? (
            <div className="space-y-3">
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-accent outline-none text-sm resize-none min-h-[100px]" placeholder="Текст поста..." />
              <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full px-4 py-2.5 rounded-full bg-accent outline-none text-sm" placeholder="Теги через запятую" />
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} disabled={!editContent.trim() || editSaving} className="btn-primary px-5 py-2 text-sm disabled:opacity-50">Сохранить</button>
                <button onClick={handleCancelEdit} className="btn-ghost px-5 py-2 text-sm">Отмена</button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="tag-pill">#{tag}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {post.image && (
          <div className="px-5 pb-1 cursor-pointer" onClick={() => setViewImage(post.image)}>
            <img src={post.image} alt="Изображение поста" className="w-full rounded-2xl transition-all duration-300 hover:opacity-90 hover:shadow-lg" loading="lazy" />
          </div>
        )}

        <div className="flex items-center gap-1 px-5 py-3 border-t border-border/40">
          <button
            onClick={() => { if (isLiking) return; setLikeAnim(true); setTimeout(() => setLikeAnim(false), 300); onToggleLike(); }}
            disabled={isLiking}
            aria-label="Лайк"
            aria-pressed={post.isLiked}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200 disabled:opacity-50 ${
              post.isLiked
                ? "text-red-500 bg-red-500/10"
                : "text-muted-foreground hover:text-red-500 hover:bg-red-500/5"
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={likeAnim ? "animate-like" : ""}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {post.likes > 0 && <span>{formatNumber(post.likes)}</span>}
          </button>
          <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
            showComments
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
          }`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {post.commentsCount > 0 && <span>{formatNumber(post.commentsCount)}</span>}
          </button>
        </div>

        {showComments && (
          <div className="px-5 pb-5 pt-1 space-y-3 bg-gradient-to-b from-transparent via-amber-50/30 to-amber-50/50 dark:via-amber-500/3 dark:to-amber-500/5 rounded-b-3xl">
            {post.comments?.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
                {post.comments.map((c: any) => (
                  <div key={c.id} className="flex gap-2.5 items-start group/comment">
                    <GradientAvatar name={c.author?.name} image={c.author?.image} size="sm" className="mt-0.5 ring-1 ring-amber-200/30 dark:ring-amber-500/20 shrink-0" />
                    <div className="flex-1 min-w-0 bg-white/50 dark:bg-white/5 rounded-2xl px-3.5 py-2.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold">{c.author?.name}</span>
                        <span className="text-[10px] text-muted-foreground">{formatRelativeDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                    {onDeleteComment && currentUserId === c.authorId && (
                      <button onClick={() => onDeleteComment(c.id)} className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1.5 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 self-start mt-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-center pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Написать комментарий..."
                className="flex-1 px-4 py-2.5 rounded-full bg-white/70 dark:bg-white/5 outline-none text-sm border border-border/30 focus:border-amber-300/50 transition-all"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || sending}
                className="p-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white disabled:opacity-50 transition-all shadow-sm shadow-amber-200/30 hover:shadow-amber-200/50 shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}
    </>
  );
}
