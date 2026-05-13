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
  Trash2,
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
      const res = await fetch("/api/admin-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ pin: ADMIN_PIN })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      setOrders(data.orders || []);
      setProfiles(data.profiles || []);
      setLastRefresh(new Date());
      
    } catch (err: any) {
      setFetchError(`Fetch error: ${err?.message || 'Unknown error'}.`);
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

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) {
      alert("Failed to delete order: " + error.message);
    } else {
      setOrders(orders.filter(o => o.id !== orderId));
      if (expandedId === orderId) setExpandedId(null);
    }
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

  // Deduplicate profiles
  const uniqueProfilesMap = new Map<string, Profile>();
  profiles.forEach((p) => {
    // Prefer phone as key, fallback to email. If neither, use ID.
    const key = p.phone || p.email || p.id;
    const existing = uniqueProfilesMap.get(key);
    if (!existing) {
      uniqueProfilesMap.set(key, p);
    } else {
      // If the current profile has a name and the existing one doesn't, prefer the current one
      if (p.full_name && !existing.full_name) {
        uniqueProfilesMap.set(key, p);
      }
    }
  });
  const dedupedProfiles = Array.from(uniqueProfilesMap.values());

  const filteredProfiles = dedupedProfiles.filter((p) => {
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
        
        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: <Users className="w-5 h-5 text-purple-400" />,
              label: "Unique Customers",
              value: uniqueCustomers,
              bg: "bg-purple-500/10",
            },
            {
              icon: <RefreshCw className="w-5 h-5 text-blue-400" />,
              label: "Last Updated",
              value: lastRefresh?.toLocaleTimeString("en-IN") || "Never",
              bg: "bg-blue-500/10",
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
