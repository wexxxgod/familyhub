"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

export function FamilyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    if (pathname === "/family-setup") {
      setReady(true);
      return;
    }

    let cancelled = false;

    async function check() {
      try {
        const data = await api.family.info();
        if (cancelled) return;
        checkedRef.current = true;
        if (!data.family) {
          router.replace("/family-setup");
        } else {
          setReady(true);
        }
      } catch {
        if (cancelled) return;
        setTimeout(check, 500);
      }
    }

    check();
    return () => { cancelled = true; };
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
