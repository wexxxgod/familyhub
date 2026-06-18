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

      if (!publicKey || typeof publicKey !== "string") return;

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
      .then(async (registration) => {
        if (Notification.permission === "granted") {
          subscribe(registration);
        } else if (Notification.permission === "default") {
          const result = await Notification.requestPermission();
          if (result === "granted") {
            subscribe(registration);
          }
        }
      })
      .catch(() => {});
  }, [subscribe]);

  return null;
}
