"use client";

import { useState } from "react";
import { formatRelativeDate, formatNumber } from "@/lib/utils";
import { ImageViewer } from "@/components/shared/ImageViewer";
import { GradientAvatar } from "@/components/shared/GradientAvatar";
import { DeleteButton } from "@/components/shared/DeleteButton";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  currentUserRole?: string;
  onToggleLike: () => void;
  onComment: (content: string) => Promise<void>;
  onDelete?: (id: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

export function PostCard({ post, currentUserId, currentUserRole, onToggleLike, onComment, onDelete, onDeleteComment }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [likeAnim, setLikeAnim] = useState(false);

  const canDelete = currentUserId && (post.authorId === currentUserId || post.author?.id === currentUserId || currentUserRole === "PARENT");

  const handleComment = async () => {
    if (!commentText.trim() || sending) return;
    setSending(true);
    await onComment(commentText.trim());
    setCommentText("");
    setSending(false);
  };

  return (
    <>
      <div className="glass-card overflow-hidden relative group">
        {canDelete && onDelete && (
          <DeleteButton onClick={() => onDelete(post.id)} className="z-10 top-3 right-3" />
        )}
        <div className="flex items-center gap-3 p-4 pb-0">
          <GradientAvatar name={post.author?.name} image={post.author?.image} size="md" />
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{post.author?.name || "Пользователь"}</p>
            <p className="text-xs text-muted-foreground">{formatRelativeDate(post.createdAt)}</p>
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {post.image && (
          <div className="px-4 pb-0 cursor-pointer" onClick={() => setViewImage(post.image)}>
            <img src={post.image} alt="Изображение поста" className="w-full rounded-xl transition-opacity hover:opacity-90" loading="lazy" />
          </div>
        )}

        <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
          <button
            onClick={() => { setLikeAnim(true); setTimeout(() => setLikeAnim(false), 300); onToggleLike(); }}
            aria-label="Лайк"
            aria-pressed={post.isLiked}
            className={`flex items-center gap-1.5 text-sm transition-colors ${post.isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={likeAnim ? "animate-like" : ""}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {post.likes > 0 && <span>{formatNumber(post.likes)}</span>}
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {post.commentsCount > 0 && <span>{formatNumber(post.commentsCount)}</span>}
          </button>
        </div>

        {showComments && (
          <div className="p-4 pt-3 space-y-3">
            {post.comments?.length > 0 && (
              <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                {post.comments.map((c: any) => (
                  <div key={c.id} className="flex gap-2 items-start group/comment">
                    <GradientAvatar name={c.author?.name} image={c.author?.image} size="sm" className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{c.author?.name}</span>
                        <span className="text-[10px] text-muted-foreground">{formatRelativeDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                    {onDeleteComment && currentUserId === c.authorId && (
                      <button onClick={() => onDeleteComment(c.id)} className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-red-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleComment()} placeholder="Напишите комментарий..." className="flex-1 px-4 py-2 rounded-xl bg-accent outline-none text-sm" />
              <button onClick={handleComment} disabled={!commentText.trim() || sending} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">Отправить</button>
            </div>
          </div>
        )}
      </div>

      {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}
    </>
  );
}
