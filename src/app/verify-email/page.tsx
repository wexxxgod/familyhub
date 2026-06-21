"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="py-8">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Ссылка недействительна — отсутствует токен.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.error || "Ошибка подтверждения");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Ошибка сети. Попробуйте позже.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <div className="py-8">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Подтверждаем email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Email подтверждён!</h2>
            <p className="text-muted-foreground mb-6">Теперь вы можете пользоваться всеми возможностями FamilyHub.</p>
            <button
              onClick={() => router.push("/feed")}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all"
            >
              Перейти в ленту
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Ошибка</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all inline-block"
            >
              На страницу входа
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
