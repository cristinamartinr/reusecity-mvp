self.addEventListener("push", (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || "ReUseCity ♻️";

  const options = {
    body: data.body || "Hay un nuevo objeto disponible cerca de ti.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = new URL(
    event.notification.data?.url || "/",
    self.location.origin
  );

  if (url.origin !== self.location.origin) {
    return;
  }

  event.waitUntil(
    clients.openWindow(url.href)
  );
});