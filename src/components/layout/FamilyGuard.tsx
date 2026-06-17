"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

export function FamilyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === "/family-setup") {
      setReady(true);
      return;
    }
    api.family.info().then((data) => {
      if (!data.family) {
        router.replace("/family-setup");
      } else {
        setReady(true);
      }
    }).catch(() => {
      setReady(true);
    });
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
