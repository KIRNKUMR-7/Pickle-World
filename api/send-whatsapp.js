export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {
    WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID,
    ADMIN_WHATSAPP_NUMBER,
  } = process.env;

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !ADMIN_WHATSAPP_NUMBER) {
    console.warn("WhatsApp env vars not configured. Skipping notification.");
    return res.status(200).json({ skipped: true, reason: "WhatsApp not configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
  }

  const { customerName, customerPhone, address, pincode, total, items, paymentId } = body || {};

  // Build items list string
  const itemLines = (items || [])
    .map((i) => `  • ${i.name} (${i.variant}) × ${i.quantity} = ₹${i.price * i.quantity}`)
    .join("\n");

  const messageText =
    `🥒 *New Pickle World Order!*\n\n` +
    `👤 *Customer:* ${customerName}\n` +
    `📞 *Phone:* ${customerPhone}\n` +
    `📍 *Address:* ${address}, ${pincode}\n\n` +
    `🛒 *Items:*\n${itemLines}\n\n` +
    `💰 *Total:* ₹${total}\n` +
    `🔖 *Payment ID:* ${paymentId}\n` +
    `🕐 *Time:* ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: ADMIN_WHATSAPP_NUMBER, // e.g. "919876543210" (no + sign)
          type: "text",
          text: { body: messageText },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API error:", data);
      return res.status(500).json({ error: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("WhatsApp send error:", err);
    return res.status(500).json({ error: err.message });
  }
}
