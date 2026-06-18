"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PostCard } from "@/components/feed/PostCard";
import { CreatePost } from "@/components/feed/CreatePost";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import toast from "react-hot-toast";

const POSTS_PER_PAGE = 10;

export default function FeedPage() {
  const { user } = useCurrentUser();
  const currentUserId = user?.id;
  const currentUserRole = user?.role;
  const [posts, setPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const mapPost = useCallback((p: any) => ({
    ...p,
    id: p.id,
    content: p.content,
    tags: p.tags || [],
    visibility: p.visibility,
    image: p.image,
    video: p.video,
    document: p.document,
    createdAt: p.createdAt,
    author: p.author || { name: "Пользователь", role: "FAMILY_MEMBER" },
    comments: p.comments || [],
    commentsCount: p.comments?.length || 0,
    likes: p.likes?.length || 0,
    isLiked: p.likes?.some((l: any) => l.userId === currentUserId) || false,
    authorId: p.authorId,
  }), [currentUserId]);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await api.posts.list();
      const mapped = data.map(mapPost);
      setAllPosts(mapped);
      setPosts(mapped.slice(0, visibleCount));
    } catch (e) {
      console.error("Failed to fetch posts:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mapPost, visibleCount]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    setPosts(allPosts.slice(0, visibleCount));
  }, [visibleCount, allPosts]);

  const handleCreatePost = async (content: string, image?: string) => {
    try {
      const newPost = await api.posts.create({ content, image });
      const mapped = mapPost(newPost);
      setAllPosts((prev) => [mapped, ...prev]);
      setPosts((prev) => [mapped, ...prev]);
      toast.success("Пост опубликован");
    } catch (e) {
      toast.error("Ошибка при публикации");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await api.posts.delete(id);
      setAllPosts((prev) => prev.filter((p) => p.id !== id));
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Пост удалён");
    } catch {
      toast.error("Ошибка при удалении");
    }
  };

  const updatePostInState = (postId: string, updater: (p: any) => any) => {
    setAllPosts((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
    setPosts((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const { liked } = await api.likes.toggle(postId);
      updatePostInState(postId, (p) => ({ ...p, isLiked: liked, likes: liked ? p.likes + 1 : p.likes - 1 }));
    } catch (e) {
      console.error("Failed to toggle like:", e);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      const newComment = await api.comments.create(postId, content);
      updatePostInState(postId, (p) => ({
        ...p,
        comments: [...(p.comments || []), { ...newComment, author: { name: user?.name || "Вы" } }],
        commentsCount: (p.commentsCount || 0) + 1,
      }));
      toast.success("Комментарий добавлен");
    } catch (e) {
      toast.error("Ошибка при добавлении комментария");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await api.comments.delete(commentId);
      updatePostInState(postId, (p) => ({
        ...p,
        comments: p.comments?.filter((c: any) => c.id !== commentId) || [],
        commentsCount: Math.max(0, (p.commentsCount || 0) - 1),
      }));
    } catch {
      toast.error("Ошибка при удалении комментария");
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-accent rounded w-1/3" />
                  <div className="h-2 bg-accent rounded w-1/4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-accent rounded w-full" />
                <div className="h-3 bg-accent rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Семейная лента</h1>
            <p className="text-muted-foreground">Делитесь событиями с близкими</p>
          </div>
          <button
            onClick={() => { setVisibleCount(POSTS_PER_PAGE); fetchPosts(true); }}
            disabled={refreshing}
            className={`p-2.5 rounded-xl hover:bg-accent transition-all ${refreshing ? "opacity-50" : ""}`}
            title="Обновить"
          >
            <svg className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </motion.div>

      <CreatePost onSubmit={handleCreatePost} />

      {posts.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">В ленте пока пусто</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">Опубликуйте первый пост</p>
        </motion.div>
      ) : (
        <div className="space-y-6 mt-8">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <PostCard
                post={post}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onToggleLike={() => handleToggleLike(post.id)}
                onComment={(content) => handleComment(post.id, content)}
                onDelete={handleDeletePost}
                onDeleteComment={(commentId) => handleDeleteComment(post.id, commentId)}
              />
            </motion.div>
          ))}
        </div>
      )}
      {visibleCount < allPosts.length && allPosts.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + POSTS_PER_PAGE)}
            className="px-6 py-3 rounded-xl bg-accent hover:bg-accent/80 text-sm font-medium transition-all"
          >
            Показать ещё
          </button>
        </div>
      )}
    </div>
  );
}
