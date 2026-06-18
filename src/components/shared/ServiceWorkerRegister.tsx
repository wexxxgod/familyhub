"use client";

import { useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function ServiceWorkerRegister() {
  const subscribe = useCallback(async (registration: ServiceWorkerRegistration) => {
    try {
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
      }

      const response = await fetch("/api/notifications/public-key");
      const { publicKey } = await response.json();

      if (!publicKey) return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: new Uint8Array(
          atob(publicKey.replace(/-/g, "+").replace(/_/g, "/")).split("").map((c) => c.charCodeAt(0))
        ),
      });

      const keys = subscription.toJSON().keys as unknown as { p256dh: string; auth: string };
      await api.notifications.subscribe(subscription.endpoint, keys);
    } catch {
      // Permission denied or push not supported
    }
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    navigator.serviceWorker.register("/sw.js")
      .then((registration) => {
        if (Notification.permission === "granted") {
          subscribe(registration);
        }
      })
      .catch(() => {
        console.warn("Service worker registration failed");
      });
  }, [subscribe]);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const handler = () => {
      if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then(subscribe);
      }
    };

    const btn = document.getElementById("enable-push-btn");
    btn?.addEventListener("click", handler);
    return () => btn?.removeEventListener("click", handler);
  }, [subscribe]);

  return null;
}
