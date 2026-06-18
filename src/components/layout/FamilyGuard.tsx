"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export function FamilyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    if (pathname === "/family-setup") {
      setReady(true);
      return;
    }

    startedRef.current = true;
    let cancelled = false;
    let retries = 0;
    const fallbackTimer = setTimeout(() => { if (!cancelled) setReady(true); }, 3000);

    async function check() {
      try {
        const res = await fetch("/api/family");
        if (cancelled) return;

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        if (!data.family) {
          router.replace("/family-setup");
        } else {
          setReady(true);
        }
      } catch {
        if (cancelled) return;
        retries++;
        if (retries >= 15) {
          setReady(true);
        } else {
          setTimeout(check, Math.min(1000 * Math.pow(1.5, retries - 1), 10000));
        }
      }
    }

    check();
    return () => { cancelled = true; clearTimeout(fallbackTimer); };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
