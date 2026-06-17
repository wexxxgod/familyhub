"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function FamilySetupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.family.info().then((data) => {
      if (data.family) {
        router.push("/feed");
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, [router]);

  const handleCreate = async () => {
    if (!familyName.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const data = await api.family.create({ name: familyName.trim() });
      setGeneratedCode(data.inviteCode);
      setMode("select");
      setTimeout(() => router.push("/feed"), 1500);
    } catch (e: any) {
      setError(e.message || "Ошибка при создании семьи");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await api.family.join({ inviteCode: inviteCode.trim().toUpperCase() });
      router.push("/feed");
    } catch (e: any) {
      setError(e.message || "Неверный код приглашения");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Добро пожаловать!</h1>
          <p className="text-muted-foreground">Создайте свою семью или присоединитесь к существующей</p>
        </div>

        {mode === "select" && (
          <div className="space-y-4">
            <button
              onClick={() => setMode("create")}
              className="w-full glass-card p-6 text-left hover:opacity-80 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <h3 className="font-semibold">Создать новую семью</h3>
              <p className="text-sm text-muted-foreground mt-1">Станьте создателем и пригласите родных</p>
            </button>

            <button
              onClick={() => setMode("join")}
              className="w-full glass-card p-6 text-left hover:opacity-80 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3" />
                </svg>
              </div>
              <h3 className="font-semibold">Присоединиться к семье</h3>
              <p className="text-sm text-muted-foreground mt-1">Введите код приглашения от родных</p>
            </button>

            {generatedCode && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 text-center border-2 border-primary/30">
                <p className="text-sm text-muted-foreground mb-2">Семья создана! Код приглашения:</p>
                <p className="text-3xl font-mono font-bold tracking-widest text-primary">{generatedCode}</p>
                <p className="text-xs text-muted-foreground mt-2">Отправьте этот код родным, чтобы они присоединились</p>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                  className="mt-3 px-4 py-2 rounded-xl bg-accent text-sm font-medium hover:bg-accent/80 transition-all"
                >
                  Скопировать код
                </button>
              </motion.div>
            )}
          </div>
        )}

        {mode === "create" && (
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Создать семью</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Название семьи, например: Ивановы"
                className="w-full px-4 py-3 rounded-xl bg-accent outline-none text-sm"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={submitting || !familyName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {submitting ? "Создание..." : "Создать"}
                </button>
                <button
                  onClick={() => { setMode("select"); setError(""); }}
                  className="px-6 py-2.5 rounded-xl bg-accent font-semibold text-sm hover:bg-accent/80 transition-all"
                >
                  Назад
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === "join" && (
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Присоединиться к семье</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Введите код приглашения"
                className="w-full px-4 py-3 rounded-xl bg-accent outline-none text-sm font-mono tracking-wider text-center text-lg"
                maxLength={8}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleJoin}
                  disabled={submitting || !inviteCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {submitting ? "Присоединение..." : "Присоединиться"}
                </button>
                <button
                  onClick={() => { setMode("select"); setError(""); }}
                  className="px-6 py-2.5 rounded-xl bg-accent font-semibold text-sm hover:bg-accent/80 transition-all"
                >
                  Назад
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
