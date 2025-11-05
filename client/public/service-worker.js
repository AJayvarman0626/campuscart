// 🧹 CampusCart - safe service worker

self.addEventListener("install", (event) => {
  console.log("✅ Service Worker Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("🔥 Service Worker Activated");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  // If navigating (SPA route), always serve index.html
  if (event.request.mode === "navigate") {
    event.respondWith(fetch("/index.html"));
    return;
  }

  // Otherwise, try cache → network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() =>
          caches.match("/index.html")
        )
      );
    })
  );
});