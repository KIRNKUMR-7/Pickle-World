import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import {
  User, Phone, MapPin, Mail, Save, LogOut, ShoppingBag,
  ChevronDown, ChevronUp, CheckCircle2, Package, Clock,
  CreditCard, Edit3, ArrowLeft, Loader2, IndianRupee,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

type OrderItem = {
  name: string;
  variant: string;
  quantity: number;
  price: number;
  image?: string;
};

type Order = {
  id: string;
  created_at: string;
  razorpay_payment_id: string;
  customer_name: string;
  customer_address: string;
  customer_pincode: string;
  total_amount: number;
  items: OrderItem[];
  status: string;
};

function ProfilePage() {
  const navigate = useNavigate();
  const { profile, sessionUserId, sessionEmail, signOut, fetchProfile } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    default_address: "",
    default_pincode: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (sessionUserId === null) {
      navigate({ to: "/", replace: true });
    }
  }, [sessionUserId, navigate]);

  // Sync form from profile
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        default_address: profile.default_address || "",
        default_pincode: profile.default_pincode || "",
      });
    }
  }, [profile]);

  const fetchOrders = useCallback(async () => {
    if (!sessionUserId) return;
    setOrdersLoading(true);
    try {
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ data: null, error: new Error("Network timeout") }), 10000));
      const fetchPromise = supabase
        .from("orders")
        .select("*")
        .eq("user_id", sessionUserId)
        .order("created_at", { ascending: false });

      const { data, error } = (await Promise.race([fetchPromise, timeoutPromise])) as any;

      if (error) {
        console.error("Error fetching profile orders:", error);
        setOrders([]);
      } else if (data) {
        setOrders(data as Order[]);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Network error fetching orders:", err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [sessionUserId]);

  useEffect(() => {
    if (sessionUserId) {
      fetchOrders();
    }
  }, [sessionUserId, fetchOrders]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUserId) return;
    setSaving(true);
    setSaveMsg("");

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: sessionUserId, email: sessionEmail, ...form });

    if (!error) {
      await fetchProfile(sessionUserId);
      setEditing(false);
      setSaveMsg("Profile updated successfully!");
      setTimeout(() => setSaveMsg(""), 3000);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    // Redirect will be handled by the useEffect above
  };

  if (!sessionUserId) return null;

  // Stats
  const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : sessionEmail?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="font-mono text-xs uppercase tracking-widest text-amber-500">🥒 My Account</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-white/40 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ── Profile Card ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
        >
          {/* Avatar row */}
          <div className="bg-gradient-to-br from-amber-500/20 to-red-500/10 px-6 py-8 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center font-black text-2xl text-stone-950 shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-white truncate">
                {profile?.full_name || "Welcome!"}
              </h1>
              <p className="text-white/50 text-sm truncate">{sessionEmail}</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 text-xs text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5">
            {[
              { label: "Orders", value: orders.length },
              {
                label: "Total Spent",
                value: `₹${totalSpent.toLocaleString("en-IN")}`,
              },
              {
                label: "Member Since",
                value: profile
                  ? new Date(
                      (profile as any).created_at || Date.now()
                    ).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                  : "—",
              },
            ].map((s) => (
              <div key={s.label} className="py-4 text-center">
                <p className="text-white font-black text-lg">{s.value}</p>
                <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Save success */}
          <AnimatePresence>
            {saveMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 bg-green-500/10 border-t border-green-500/20 px-6 py-3"
              >
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <p className="text-green-400 text-sm">{saveMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit form */}
          <AnimatePresence>
            {editing && (
              <motion.form
                key="edit-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSave}
                className="p-6 border-t border-white/5 space-y-4"
              >
                <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
                  Edit Profile
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "full_name", label: "Full Name", icon: <User className="w-4 h-4" />, type: "text", placeholder: "Your full name" },
                    { key: "phone", label: "Phone", icon: <Phone className="w-4 h-4" />, type: "tel", placeholder: "10-digit number" },
                    { key: "default_pincode", label: "PIN Code", icon: <MapPin className="w-4 h-4" />, type: "text", placeholder: "e.g. 600001" },
                  ].map(({ key, label, icon, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">{icon}</span>
                        <input
                          type={type}
                          value={form[key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          placeholder={placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:border-amber-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Default Delivery Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-white/30"><MapPin className="w-4 h-4" /></span>
                    <textarea
                      rows={2}
                      value={form.default_address}
                      onChange={(e) => setForm({ ...form, default_address: e.target.value })}
                      placeholder="House No, Street, City, District"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:border-amber-500 outline-none resize-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Order History ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-xl flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              Order History
            </h2>
            <span className="text-white/30 text-sm">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
          </div>

          {ordersLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-white/30 gap-2">
              <Loader2 className="w-6 h-6 animate-spin" /> 
              <p className="text-sm">Loading orders…</p>
            </div>
          )}

          {!ordersLoading && orders.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center py-16 gap-4 text-center"
            >
              <ShoppingBag className="w-12 h-12 text-white/10" />
              <p className="text-white/40 text-sm">No orders yet.</p>
              <Link
                to="/flavours"
                className="text-amber-500 border border-amber-500/30 px-5 py-2 rounded-full text-sm hover:bg-amber-500/10 transition-colors"
              >
                Shop Pickles →
              </Link>
            </motion.div>
          )}

          <div className="space-y-4">
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-2xl bg-white/5 border border-white/5 overflow-hidden"
              >
                {/* Order summary row */}
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                >
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">
                      {Array.isArray(order.items)
                        ? order.items
                            .slice(0, 2)
                            .map((i) => i.name)
                            .join(", ") +
                          (order.items.length > 2
                            ? ` +${order.items.length - 2} more`
                            : "")
                        : "Order"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-white/30 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                        {order.status || "paid"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-amber-400 font-black">
                      ₹{order.total_amount?.toLocaleString("en-IN")}
                    </p>
                    <p className="text-white/20 text-xs mt-0.5">
                      {Array.isArray(order.items)
                        ? order.items.reduce((s, i) => s + i.quantity, 0)
                        : 0}{" "}
                      item(s)
                    </p>
                  </div>

                  {expandedId === order.id ? (
                    <ChevronUp className="w-4 h-4 text-white/30 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />
                  )}
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {expandedId === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/5"
                    >
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Items list */}
                        <div>
                          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
                            Items
                          </p>
                          <div className="space-y-2">
                            {Array.isArray(order.items) &&
                              order.items.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5"
                                >
                                  <div>
                                    <p className="text-white text-sm font-medium">
                                      {item.name}
                                    </p>
                                    <p className="text-white/40 text-xs">
                                      {item.variant} × {item.quantity}
                                    </p>
                                  </div>
                                  <p className="text-amber-400 font-bold text-sm">
                                    ₹{item.price * item.quantity}
                                  </p>
                                </div>
                              ))}
                            <div className="flex justify-between pt-2 border-t border-white/10 px-1">
                              <span className="text-white/40 text-sm">Total</span>
                              <span className="text-amber-400 font-black">
                                ₹{order.total_amount?.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery + Payment */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-white/30 text-xs uppercase tracking-widest mb-2">
                              Delivered To
                            </p>
                            <div className="flex items-start gap-2.5">
                              <MapPin className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-white text-sm">
                                  {order.customer_address}
                                </p>
                                <p className="text-white/40 text-xs">
                                  PIN: {order.customer_pincode}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-white/30 text-xs uppercase tracking-widest mb-2">
                              Payment ID
                            </p>
                            <div className="flex items-start gap-2.5">
                              <CreditCard className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                              <p className="text-white/60 text-xs font-mono break-all">
                                {order.razorpay_payment_id}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
