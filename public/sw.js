// Axis Service Worker — handles Web Push notifications for price alerts.
// Scope: / (root), registered from layout.tsx.

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Axis 가격 알림", body: event.data.text() };
  }

  const { title, body, icon, badge, data } = payload;

  event.waitUntil(
    self.registration.showNotification(title ?? "Axis 가격 알림", {
      body,
      icon: icon ?? "/icon.png",
      badge: badge ?? "/icon.png",
      data,
      vibrate: [200, 100, 200],
      requireInteraction: false,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.buyUrl ?? event.notification.data?.url ?? "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Keep the SW alive — no-op fetch handler.
self.addEventListener("fetch", () => {});
