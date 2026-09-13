self.addEventListener("push", event => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      body: event.data?.text() || "Đơn hàng đã được cập nhật."
    };
  }

  const title = data.title || "UnNo Tea";

  const options = {
    body: data.body || "Đơn hàng của bạn đã được cập nhật.",
    icon: "/logo.jpg",
    badge: "/logo.jpg",
    data: {
      url: data.url || "/online"
    },
    tag: data.tag || "unno-order",
    renotify: true,
    vibrate: [200, 80, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const url = event.notification.data?.url || "/online";

  event.waitUntil((async () => {
    const windows = await clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    for (const client of windows) {
      if ("focus" in client) {
        await client.navigate(url);
        return client.focus();
      }
    }

    if (clients.openWindow) {
      return clients.openWindow(url);
    }
  })());
});
