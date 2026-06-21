"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

type Mode = "select" | "login" | "create" | "join";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("select");

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] rounded-full bg-amber-400/15 blur-[150px]" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-400/15 blur-[150px]" />
      </div>

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="font-semibold text-2xl">FamilyHub</span>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {mode === "select" && <ModeSelect onSelect={setMode} key="select" />}
          {mode === "login" && <LoginForm onBack={() => setMode("select")} key="login" />}
          {mode === "create" && <CreateFamilyForm onBack={() => setMode("select")} key="create" />}
          {mode === "join" && <JoinFamilyForm onBack={() => setMode("select")} key="join" />}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ModeSelect({ onSelect }: { onSelect: (mode: Mode) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-center">Добро пожаловать!</h1>
      <p className="text-muted-foreground text-center mb-8">Выберите действие</p>

      <div className="glass-card p-6 space-y-4">
        <button
          onClick={() => onSelect("login")}
          className="w-full p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-amber-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">Войти в аккаунт</div>
              <div className="text-sm text-muted-foreground">Уже зарегистрированы? Войдите</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:translate-x-1 transition-transform">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => onSelect("create")}
          className="w-full p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" /><path d="M5 12h14" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">Создать семью</div>
              <div className="text-sm text-muted-foreground">Зарегистрируйтесь и станьте администратором</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:translate-x-1 transition-transform">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => onSelect("join")}
          className="w-full p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 hover:border-teal-500/40 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">Войти в семью</div>
              <div className="text-sm text-muted-foreground">Есть код приглашения? Присоединяйтесь</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:translate-x-1 transition-transform">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

function LoginForm({ onBack }: { onBack: () => void }) {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = "/feed";
      } else {
        const data = await res.json();
        setError(data.error || "Ошибка входа. Попробуйте позже.");
      }
    } catch {
      setError("Ошибка сети. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Назад
      </button>

      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold mb-1">Войти в аккаунт</h2>
        <p className="text-muted-foreground text-sm mb-6">Войдите, чтобы продолжить</p>

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
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function CreateFamilyForm({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", familyName: "" });
  const [error, setError] = useState("");
  const [step, setStep] = useState<"register" | "creating" | "done">("register");
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    if (form.password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }
    if (!form.familyName.trim()) {
      setError("Введите название семьи");
      return;
    }

    setLoading(true);
    setStep("register");

    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      if (!regRes.ok) {
        const data = await regRes.json();
        setError(data.error || "Ошибка регистрации");
        setStep("register");
        return;
      }

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (!loginRes.ok) {
        setError("Аккаунт создан, но не удалось выполнить вход. Попробуйте войти.");
        setStep("register");
        return;
      }

      setStep("creating");

      const familyRes = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.familyName.trim() }),
      });

      if (!familyRes.ok) {
        const data = await familyRes.json();
        setError(data.error || "Ошибка создания семьи");
        setStep("register");
        return;
      }

      const familyData = await familyRes.json();
      setInviteCode(familyData.inviteCode || "");
      setStep("done");
      setTimeout(() => { window.location.href = "/feed"; }, 600);
    } catch {
      setError("Ошибка сети. Попробуйте позже.");
      setStep("register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Назад
      </button>

      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold mb-1">Создать семью</h2>
        <p className="text-muted-foreground text-sm mb-6">Зарегистрируйтесь и создайте свою семейную сеть</p>

        {step === "done" ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">Семья создана!</h3>
            {inviteCode && (
              <div className="mt-3 mb-2">
                <p className="text-sm text-muted-foreground mb-2">Код для приглашения родных:</p>
                <div className="inline-block px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono tracking-widest text-xl font-bold text-amber-400">
                  {inviteCode}
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-3">Перенаправляем...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Имя</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                placeholder="Иван Иванов"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                placeholder="family@example.com"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Пароль</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                  placeholder="Минимум 6 символов"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Подтвердите</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                  placeholder="Повторите"
                  required
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-2">
              <label className="block text-sm font-medium mb-2">Название семьи</label>
              <input
                type="text"
                value={form.familyName}
                onChange={(e) => setForm({ ...form, familyName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                placeholder="Например: Ивановы"
                required
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (step === "creating" ? "Создаём семью..." : "Регистрация...") : "Создать семью"}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}

function JoinFamilyForm({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", inviteCode: "" });
  const [error, setError] = useState("");
  const [step, setStep] = useState<"register" | "joining" | "done">("register");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    if (form.password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }
    if (!form.inviteCode.trim()) {
      setError("Введите код приглашения");
      return;
    }

    setLoading(true);
    setStep("register");

    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      if (!regRes.ok) {
        const data = await regRes.json();
        setError(data.error || "Ошибка регистрации");
        setStep("register");
        return;
      }

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (!loginRes.ok) {
        setError("Аккаунт создан, но не удалось выполнить вход. Попробуйте войти.");
        setStep("register");
        return;
      }

      setStep("joining");

      const joinRes = await fetch("/api/family/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: form.inviteCode.trim() }),
      });

      if (!joinRes.ok) {
        const data = await joinRes.json();
        setError(data.error || "Ошибка при вступлении в семью");
        setStep("register");
        return;
      }

      setStep("done");
      setTimeout(() => { window.location.href = "/feed"; }, 600);
    } catch {
      setError("Ошибка сети. Попробуйте позже.");
      setStep("register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Назад
      </button>

      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold mb-1">Войти в семью</h2>
        <p className="text-muted-foreground text-sm mb-6">Введите код приглашения, чтобы присоединиться</p>

        {step === "done" ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">Вы в семье!</h3>
            <p className="text-sm text-muted-foreground">Перенаправляем...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Имя</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                placeholder="Иван Иванов"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                placeholder="family@example.com"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Пароль</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                  placeholder="Минимум 6 символов"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Подтвердите</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                  placeholder="Повторите"
                  required
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-2">
              <label className="block text-sm font-medium mb-2">Код приглашения</label>
              <input
                type="text"
                value={form.inviteCode}
                onChange={(e) => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all font-mono tracking-widest text-center text-lg"
                placeholder="XXXXXXX"
                required
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (step === "joining" ? "Вступление..." : "Регистрация...") : "Присоединиться"}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
