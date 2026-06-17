"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Неверный email или пароль");
      } else {
        router.push("/feed");
        router.refresh();
      }
    } catch {
      setError("Ошибка входа. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[150px]" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="font-semibold text-2xl">FamilyHub</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">С возвращением!</h1>
          <p className="text-muted-foreground">Войдите в свою семейную сеть</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                placeholder="family@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Ещё нет аккаунта?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Присоединиться
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
