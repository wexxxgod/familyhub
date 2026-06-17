"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PostCard } from "@/components/feed/PostCard";
import { CreatePost } from "@/components/feed/CreatePost";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function FeedPage() {
  const { data: session } = useSession();
  const currentUser = (session?.user as any);
  const currentUserId = currentUser?.id;
  const currentUserRole = currentUser?.role;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const data = await api.posts.list();
      setPosts(data.map((p: any) => ({
        ...p,
        id: p.id,
        content: p.content,
        tags: p.tags || [],
        visibility: p.visibility,
        image: p.image,
        video: p.video,
        document: p.document,
        createdAt: p.createdAt,
        author: p.author || { name: "РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ", role: "FAMILY_MEMBER" },
        comments: p.comments || [],
        commentsCount: p.comments?.length || 0,
        likes: p.likes?.length || 0,
        isLiked: p.likes?.some((l: any) => l.userId === currentUserId) || false,
        authorId: p.authorId,
      })));
    } catch (e) {
      console.error("Failed to fetch posts:", e);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleCreatePost = async (content: string, image?: string) => {
    try {
      const newPost = await api.posts.create({ content, image });
      setPosts([{
        ...newPost,
        author: newPost.author || { name: "Р’С‹", role: "FAMILY_MEMBER" },
        comments: [],
        commentsCount: 0,
        likes: 0,
        isLiked: false,
        authorId: newPost.authorId,
      }, ...posts]);
      toast.success("РџРѕСЃС‚ РѕРїСѓР±Р»РёРєРѕРІР°РЅ");
    } catch (e) {
      toast.error("РћС€РёР±РєР° РїСЂРё РїСѓР±Р»РёРєР°С†РёРё");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await api.posts.delete(id);
      setPosts(posts.filter((p) => p.id !== id));
      toast.success("РџРѕСЃС‚ СѓРґР°Р»С‘РЅ");
    } catch {
      toast.error("РћС€РёР±РєР° РїСЂРё СѓРґР°Р»РµРЅРёРё");
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const { liked } = await api.likes.toggle(postId);
      setPosts(posts.map((p) =>
        p.id === postId
          ? { ...p, isLiked: liked, likes: liked ? p.likes + 1 : p.likes - 1 }
          : p
      ));
    } catch (e) {
      console.error("Failed to toggle like:", e);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      const newComment = await api.comments.create(postId, content);
      setPosts(posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [...(p.comments || []), {
                ...newComment,
                author: { name: session?.user?.name || "Р’С‹" },
              }],
              commentsCount: (p.commentsCount || 0) + 1,
            }
          : p
      ));
      toast.success("РљРѕРјРјРµРЅС‚Р°СЂРёР№ РґРѕР±Р°РІР»РµРЅ");
    } catch (e) {
      toast.error("РћС€РёР±РєР° РїСЂРё РґРѕР±Р°РІР»РµРЅРёРё РєРѕРјРјРµРЅС‚Р°СЂРёСЏ");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await api.comments.delete(commentId);
      setPosts(posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments?.filter((c: any) => c.id !== commentId) || [],
              commentsCount: Math.max(0, (p.commentsCount || 0) - 1),
            }
          : p
      ));
    } catch {
      toast.error("РћС€РёР±РєР° РїСЂРё СѓРґР°Р»РµРЅРёРё РєРѕРјРјРµРЅС‚Р°СЂРёСЏ");
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
        <h1 className="text-3xl font-bold mb-1">РЎРµРјРµР№РЅР°СЏ Р»РµРЅС‚Р°</h1>
        <p className="text-muted-foreground">Р”РµР»РёС‚РµСЃСЊ СЃРѕР±С‹С‚РёСЏРјРё СЃ Р±Р»РёР·РєРёРјРё</p>
      </motion.div>

      <CreatePost onSubmit={handleCreatePost} />

      {posts.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Р’ Р»РµРЅС‚Рµ РїРѕРєР° РїСѓСЃС‚Рѕ</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">РћРїСѓР±Р»РёРєСѓР№С‚Рµ РїРµСЂРІС‹Р№ РїРѕСЃС‚</p>
        </motion.div>
      ) : (
        <div className="space-y-6 mt-8">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <PostCard
                post={post}
                currentUserId={currentUserId} currentUserRole={currentUserRole}
                onToggleLike={() => handleToggleLike(post.id)}
                onComment={(content) => handleComment(post.id, content)}
                onDelete={handleDeletePost}
                onDeleteComment={(commentId) => handleDeleteComment(post.id, commentId)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

