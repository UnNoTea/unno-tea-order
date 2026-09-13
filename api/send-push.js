const webpush = require("web-push");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const ANON = process.env.SUPABASE_ANON_KEY;
    const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
    const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

    if (!SUPABASE_URL || !ANON || !SERVICE ||
        !VAPID_PUBLIC || !VAPID_PRIVATE) {
      return res.status(500).json({
        error: "Missing environment variables"
      });
    }

    const auth = req.headers.authorization || "";

    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Kiểm tra tài khoản Admin Supabase
    const userResp = await fetch(
      `${SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          apikey: ANON,
          Authorization: auth
        }
      }
    );

    if (!userResp.ok) {
      return res.status(401).json({
        error: "Invalid admin session"
      });
    }

    const { orderId, status } = req.body || {};

    if (
      !orderId ||
      !["Đang làm", "Hoàn thành"].includes(status)
    ) {
      return res.status(400).json({
        error: "Invalid order/status"
      });
    }

    // Lấy thiết bị khách đã đăng ký nhận thông báo
    const subResp = await fetch(
      `${SUPABASE_URL}/rest/v1/push_subscriptions` +
      `?order_id=eq.${encodeURIComponent(orderId)}` +
      `&select=endpoint,p256dh,auth`,
      {
        headers: {
          apikey: SERVICE,
          Authorization: `Bearer ${SERVICE}`
        }
      }
    );

    if (!subResp.ok) {
      return res.status(500).json({
        error: "Could not load subscriptions"
      });
    }

    const subscriptions = await subResp.json();

    webpush.setVapidDetails(
      "mailto:unnotea@example.com",
      VAPID_PUBLIC,
      VAPID_PRIVATE
    );

    const payload = JSON.stringify({
      title:
        status === "Đang làm"
          ? "👨‍🍳 UnNo Tea đang làm đơn"
          : "✅ Đơn UnNo Tea đã hoàn thành",

      body:
        status === "Đang làm"
          ? "Quán đang chuẩn bị món của bạn."
          : "Món của bạn đã hoàn thành!",

      url: "/online",
      tag: `unno-order-${orderId}`
    });

    let sent = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          payload
        );

        sent++;
      } catch (err) {
        console.error("Push error:", err);
      }
    }

    return res.status(200).json({
      ok: true,
      sent
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
};
