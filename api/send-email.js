export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set. Skipping email.");
    return res.status(200).json({ skipped: true, reason: "RESEND_API_KEY not configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
  }

  const { customerEmail, customerName, customerPhone, items = [], total, paymentId, address, pincode } = body || {};

  const safeName = customerName || 'Customer';
  const safeAddress = address || 'Address not provided';
  const safePincode = pincode || '';
  const safePhone = customerPhone || '';
  const safePaymentId = paymentId || 'N/A';

  if (!customerEmail) {
    return res.status(400).json({ error: 'customerEmail is required' });
  }

  const itemsRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #2c1a0e;font-size:14px;color:#d6d3d1;">${i.name} <span style="color:#78716c;font-size:12px;">(${i.variant})</span></td>
        <td style="padding:12px 16px;border-bottom:1px solid #2c1a0e;text-align:center;color:#d6d3d1;font-size:14px;">×${i.quantity}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #2c1a0e;text-align:right;color:#f59e0b;font-weight:700;font-size:14px;">₹${i.price * i.quantity}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmed — Pickle World</title>
</head>
<body style="margin:0;padding:0;background:#0c0a09;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0a09;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c2d12,#c2410c);border-radius:16px 16px 0 0;padding:36px 32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;color:#fed7aa;text-transform:uppercase;font-weight:600;">Pickle World</p>
            <h1 style="margin:0;font-size:32px;font-weight:900;color:#fff;letter-spacing:-1px;">Order Confirmed! 🥒</h1>
            <p style="margin:12px 0 0;font-size:15px;color:#fcd9b5;opacity:0.85;">Your pickles are on their way, ${safeName.split(' ')[0]}! 🎉</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#1c1917;padding:32px;">

            <!-- Payment Badge -->
            <div style="background:#052e16;border:1px solid #166534;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0;font-size:12px;color:#86efac;text-transform:uppercase;letter-spacing:2px;">✅ Payment Successful</p>
              <p style="margin:6px 0 0;font-size:11px;color:#4ade80;font-family:monospace;word-break:break-all;">${safePaymentId}</p>
            </div>

            <!-- Customer Details -->
            <p style="margin:0 0 12px;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:3px;">Customer Details</p>
            <div style="background:#292524;border:1px solid #2c1a0e;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;font-size:12px;color:#78716c;width:80px;">Name</td>
                  <td style="padding:4px 0;font-size:14px;color:#fff;font-weight:600;">${safeName}</td>
                </tr>
                ${safePhone ? `<tr><td style="padding:4px 0;font-size:12px;color:#78716c;">Phone</td><td style="padding:4px 0;font-size:14px;color:#d6d3d1;">${safePhone}</td></tr>` : ''}
                <tr>
                  <td style="padding:4px 0;font-size:12px;color:#78716c;vertical-align:top;">Address</td>
                  <td style="padding:4px 0;font-size:14px;color:#d6d3d1;line-height:1.5;">${safeAddress}${safePincode ? ` — ${safePincode}` : ''}</td>
                </tr>
              </table>
            </div>

            <!-- Order Items -->
            <p style="margin:0 0 12px;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:3px;">Items Ordered</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #2c1a0e;">
              <thead>
                <tr style="background:#292524;">
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Item</th>
                  <th style="padding:10px 16px;text-align:center;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Qty</th>
                  <th style="padding:10px 16px;text-align:right;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsRows}</tbody>
              <tfoot>
                <tr style="background:#292524;">
                  <td colspan="2" style="padding:14px 16px;font-weight:700;color:#fff;font-size:14px;">Total</td>
                  <td style="padding:14px 16px;text-align:right;font-size:20px;font-weight:900;color:#f59e0b;">₹${total}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Delivery Info -->
            <p style="margin:28px 0 12px;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:3px;">Delivery Address</p>
            <div style="background:#292524;border:1px solid #2c1a0e;border-radius:10px;padding:16px 20px;">
              <p style="margin:0;font-size:14px;color:#d6d3d1;line-height:1.6;">${safeAddress}</p>
              ${safePincode ? `<p style="margin:4px 0 0;font-size:13px;color:#78716c;">PIN: ${safePincode}</p>` : ''}
            </div>

            <!-- Note -->
            <p style="margin:28px 0 0;font-size:13px;color:#57534e;text-align:center;line-height:1.7;">
              We'll pack your order with love and ship it soon. 🌶️<br/>
              For queries, message us on WhatsApp or reply to this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0c0a09;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;border-top:1px solid #1c1917;">
            <p style="margin:0;font-size:12px;color:#44403c;">© 2024 Pickle World · Made with 🔥 in South India</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Pickle World <${FROM_EMAIL}>`,
        to: [customerEmail],
        subject: `Order Confirmed 🥒 — ₹${total} | Pickle World`,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Resend error:", data);
      return res.status(500).json({ error: data });
    }

    // Send a separate ADMIN ALERT email to prevent Gmail from deduplicating the BCC during testing
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Pickle World <${FROM_EMAIL}>`,
        to: ["kiran2006bgkr@gmail.com", "bokudakira07@gmail.com", "PICKLEWORLDHOMEMADENONVEGPICKL@GMAIL.COM"],
        subject: `🚨 ADMIN: New Order from ${safeName} (₹${total})`,
        html: html.replace('Order Confirmed!', 'New Order Received!'),
      }),
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ error: err.message });
  }
}
