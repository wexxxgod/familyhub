const CACHE_NAME = "familyhub-v1";

const STATIC_PAGES = [
  "/",
  "/feed",
  "/login",
  "/register",
  "/offline",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PAGES);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (STATIC_PAGES.includes(new URL(event.request.url).pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "FamilyHub", body: "Новое уведомление", link: "/feed" };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {}
  }

  const options = {
    body: data.body,
    tag: data.tag || "familyhub",
    data: { link: data.link || "/feed" },
    actions: [
      { action: "open", title: "Открыть" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const link = event.notification.data?.link || "/feed";

  if (event.action === "open" || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
        const existing = windowClients.find((c) => c.url.includes(link) || c.url.includes("/feed"));
        if (existing) {
          existing.focus();
          if (existing.url !== self.location.origin + link) {
            existing.navigate(link);
          }
        } else {
          clients.openWindow(link);
        }
      })
    );
  }
});
