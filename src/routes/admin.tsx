import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  IndianRupee,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Lock,
  LogOut,
  Package,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  CreditCard,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type OrderItem = {
  name: string;
  variant: string;
  quantity: number;
  price: number;
};

interface Order {
  id: string;
  created_at: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_pincode: string;
  total_amount: number;
  items: any;
  status: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  default_address: string;
  default_pincode: string;
  created_at: string;
}

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || "pickle2024";

function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("pw_admin") === "true");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'customers'>('orders');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const [ordersRes, profilesRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false })
      ]);

      if (ordersRes.error) {
        setFetchError(`Orders Error: ${ordersRes.error.message}`);
      } else {
        setOrders((ordersRes.data as Order[]) || []);
      }

      if (profilesRes.error) {
        console.error('Profiles fetch error:', profilesRes.error);
      } else {
        setProfiles((profilesRes.data as Profile[]) || []);
      }
      
      if (!ordersRes.error) {
        setLastRefresh(new Date());
      }
    } catch (err: any) {
      setFetchError(`Network error: ${err?.message || 'Unknown error'}. Check Supabase URL and anon key.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchOrders();
  }, [authed, fetchOrders]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem("pw_admin", "true");
      setAuthed(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("pw_admin");
    setAuthed(false);
    setOrders([]);
  };

  // ── Derived stats ────────────────────────────────────────────
  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const todayOrders = orders.filter(
    (o) => new Date(o.created_at).toDateString() === new Date().toDateString()
  );
  const uniqueCustomers = new Set(orders.map((o) => o.customer_phone)).size;

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      o.customer_name?.toLowerCase().includes(s) ||
      o.customer_phone?.includes(s) ||
      o.razorpay_payment_id?.toLowerCase().includes(s)
    );
  });

  const filteredProfiles = profiles.filter((p) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(s) ||
      p.email?.toLowerCase().includes(s) ||
      p.phone?.includes(s)
    );
  });

  // ── CSV export ───────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ["Date", "Customer", "Phone", "Address", "Pincode", "Total", "Payment ID", "Status"],
      ...orders.map((o) => [
        new Date(o.created_at).toLocaleString("en-IN"),
        o.customer_name,
        o.customer_phone,
        o.customer_address,
        o.customer_pincode,
        o.total_amount,
        o.razorpay_payment_id,
        o.status,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pickle-orders-${Date.now()}.csv`;
    a.click();
  };

  // ══════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ══════════════════════════════════════════════════════════════
  if (!authed) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-white">Pickle World</h1>
            <p className="text-white/40 text-sm mt-1">Admin Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-white/50 mb-2">Admin PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError(false); }}
                placeholder="Enter PIN"
                className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-white text-center text-2xl tracking-widest outline-none transition-colors ${pinError ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-amber-500"
                  }`}
                autoFocus
              />
              {pinError && <p className="text-red-400 text-xs mt-2 text-center">Incorrect PIN. Try again.</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3.5 rounded-xl transition-colors"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-50 bg-stone-950/95 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="font-black text-white leading-none">Pickle World</h1>
            <p className="text-white/30 text-[10px] uppercase tracking-widest">Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="hidden md:block text-white/30 text-xs">
              Updated {lastRefresh.toLocaleTimeString("en-IN")}
            </span>
          )}
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={exportCSV}
            className="hidden md:flex items-center gap-2 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3 h-3" /> Export CSV
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="w-3 h-3" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        
        {/* ── Tabs ── */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 w-max">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'orders' 
                ? 'bg-amber-500 text-stone-950 shadow-md' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'customers' 
                ? 'bg-amber-500 text-stone-950 shadow-md' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            Customers ({profiles.length})
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: <ShoppingBag className="w-5 h-5 text-amber-400" />,
              label: "Total Orders",
              value: orders.length,
              bg: "bg-amber-500/10",
            },
            {
              icon: <IndianRupee className="w-5 h-5 text-green-400" />,
              label: "Total Revenue",
              value: `₹${totalRevenue.toLocaleString("en-IN")}`,
              bg: "bg-green-500/10",
            },
            {
              icon: <Clock className="w-5 h-5 text-blue-400" />,
              label: "Today's Orders",
              value: todayOrders.length,
              bg: "bg-blue-500/10",
            },
            {
              icon: <Users className="w-5 h-5 text-purple-400" />,
              label: "Unique Customers",
              value: uniqueCustomers,
              bg: "bg-purple-500/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white/5 border border-white/5 p-5 flex items-start gap-4"
            >
              <div className={`p-2.5 rounded-xl ${stat.bg} shrink-0`}>{stat.icon}</div>
              <div>
                <p className="text-white/40 text-xs">{stat.label}</p>
                <p className="text-white text-xl font-black mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {activeTab === 'orders' && (
        {/* ── Orders Table ── */}
        <div className="rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
          {/* Table Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border-b border-white/5 gap-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              Orders ({filteredOrders.length})
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Search name, phone, payment ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm placeholder-white/20 focus:border-amber-500 outline-none w-full md:w-64 transition-colors"
              />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16 text-white/30">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading orders…
            </div>
          )}

          {/* Error */}
          {!loading && fetchError && (
            <div className="m-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
              <p className="text-red-400 font-semibold text-sm">⚠️ Could not load orders</p>
              <p className="text-red-300/70 text-xs font-mono break-all">{fetchError}</p>
              <div className="mt-3 pt-3 border-t border-red-500/10 text-xs text-red-300/50 space-y-1">
                <p><strong>Fix:</strong> Go to Supabase → Settings → API → copy the <code>anon public</code> key</p>
                <p>Then add it to <strong>Vercel → Settings → Env Vars</strong> as <code>VITE_SUPABASE_ANON_KEY</code> and redeploy.</p>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && !fetchError && filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-white/30 gap-3">
              <ShoppingBag className="w-10 h-10 opacity-20" />
              <p>{search ? "No orders match your search." : "No orders yet. Place a test order to see it here! 🥒"}</p>
              <p className="text-xs text-white/20 max-w-xs text-center">Orders appear here after a successful Razorpay payment. Make sure the SQL schema is created in Supabase.</p>
            </div>
          )}

          {/* Rows */}
          {!loading && filteredOrders.map((order, idx) => (
            <div key={order.id} className={`border-b border-white/5 last:border-none ${idx % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
              {/* Summary Row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                {/* Status dot */}
                <div className="shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>

                {/* Customer info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{order.customer_name || 'Unknown Customer'}</p>
                  <p className="text-white/40 text-xs">{order.customer_phone}</p>
                </div>

                {/* Items count */}
                <div className="hidden md:block text-white/40 text-xs shrink-0">
                  {Array.isArray(order.items)
                    ? `${order.items.reduce((s, i) => s + i.quantity, 0)} items`
                    : "–"}
                </div>

                {/* Total */}
                <div className="text-amber-400 font-bold text-sm shrink-0">
                  ₹{order.total_amount?.toLocaleString("en-IN")}
                </div>

                {/* Date */}
                <div className="hidden md:block text-white/30 text-xs shrink-0 text-right">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                  <br />
                  {new Date(order.created_at).toLocaleTimeString("en-IN", {
                    hour: "2-digit", minute: "2-digit"
                  })}
                </div>

                {/* Expand toggle */}
                <div className="text-white/30 shrink-0">
                  {expandedId === order.id
                    ? <ChevronUp className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Expanded Detail */}
              {expandedId === order.id && (
                <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white/[0.03] border-t border-white/5">
                  {/* Left: customer + payment */}
                  <div className="space-y-3 pt-4">
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Customer Details</p>

                    <div className="flex items-start gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-white/40 text-xs">Phone</p>
                        <p className="text-white text-sm">{order.customer_phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-white/40 text-xs">Delivery Address</p>
                        <p className="text-white text-sm">{order.customer_address}</p>
                        <p className="text-white/50 text-xs">PIN: {order.customer_pincode}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CreditCard className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-white/40 text-xs">Payment ID</p>
                        <p className="text-white text-xs font-mono break-all">{order.razorpay_payment_id}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-white/40 text-xs">Order ID</p>
                      <p className="text-white/60 text-xs font-mono break-all">{order.razorpay_order_id}</p>
                    </div>
                  </div>

                  {/* Right: items */}
                  <div className="pt-4">
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Items Ordered</p>
                    <div className="space-y-2">
                      {Array.isArray(order.items) && order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
                          <div>
                            <p className="text-white text-sm font-medium">{item.name}</p>
                            <p className="text-white/40 text-xs">{item.variant} × {item.quantity}</p>
                          </div>
                          <p className="text-amber-400 font-bold text-sm">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-white/10 px-1">
                        <span className="text-white/50 text-sm">Total</span>
                        <span className="text-amber-400 font-black">₹{order.total_amount?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}

        {/* ── Customers Table ── */}
        {activeTab === 'customers' && (
        <div className="rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border-b border-white/5 gap-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Signed Up Users ({filteredProfiles.length})
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Search name, email, phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm placeholder-white/20 focus:border-amber-500 outline-none w-full md:w-64 transition-colors"
              />
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 text-white/30">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading customers…
            </div>
          )}

          {!loading && filteredProfiles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-white/30 gap-3">
              <Users className="w-10 h-10 opacity-20" />
              <p>{search ? "No customers match your search." : "No signed up users yet."}</p>
            </div>
          )}

          {!loading && filteredProfiles.map((p, idx) => (
            <div key={p.id} className={`border-b border-white/5 last:border-none px-5 py-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${idx % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  {p.full_name ? p.full_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <p className="font-semibold text-white">{p.full_name || 'No Name Provided'}</p>
                  <p className="text-white/50 text-xs">{p.email || 'No Email'}</p>
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-1 text-sm text-white/60">
                <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {p.phone || 'No Phone'}</p>
                <p className="text-xs text-white/30">Joined: {new Date(p.created_at).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
        )}
      </main>
    </div>
  );
}
