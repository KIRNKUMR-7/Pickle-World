import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { pin } = req.body;
  const ADMIN_PIN = process.env.VITE_ADMIN_PIN || "pickle2024";

  if (pin !== ADMIN_PIN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: "Missing Supabase configuration" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const [ordersRes, profilesRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false })
    ]);

    if (ordersRes.error) {
      console.error("Orders fetch error:", ordersRes.error);
      return res.status(500).json({ error: ordersRes.error.message });
    }

    if (profilesRes.error) {
      console.error("Profiles fetch error:", profilesRes.error);
      return res.status(500).json({ error: profilesRes.error.message });
    }

    return res.status(200).json({
      orders: ordersRes.data || [],
      profiles: profilesRes.data || []
    });
  } catch (error) {
    console.error("Admin data fetch error:", error);
    return res.status(500).json({ error: error.message || error.toString() });
  }
}
