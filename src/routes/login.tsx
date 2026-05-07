import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "/flavours",
  }),
});

type Tab = "signin" | "signup" | "forgot";

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const { sessionUserId, setSession, fetchProfile } = useAuthStore();

  const [tab, setTab] = useState<Tab>("signin");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sign-in form
  const [signIn, setSignIn] = useState({ email: "", password: "" });

  // Sign-up form
  const [signUp, setSignUp] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  // If already logged in, redirect
  useEffect(() => {
    if (sessionUserId) {
      navigate({ to: redirect as any });
    }
  }, [sessionUserId, navigate, redirect]);

  // ── Sign In ─────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: signIn.email,
      password: signIn.password,
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setSession(data.user.id, data.user.email ?? null);
      await fetchProfile(data.user.id);
      navigate({ to: redirect as any });
    }
    setLoading(false);
  };

  // ── Reset Password ──────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn.email) {
      setError("Please enter your email address above first.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(signIn.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("If that email is registered, you will receive a password reset link shortly.");
    }
    setLoading(false);
  };

  // ── Sign Up ─────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authErr } = await supabase.auth.signUp({
      email: signUp.email,
      password: signUp.password,
      options: {
        data: { full_name: signUp.full_name, phone: signUp.phone },
      },
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Upsert profile
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: signUp.email,
        full_name: signUp.full_name,
        phone: signUp.phone,
        default_address: "",
        default_pincode: "",
      });

      // If auto-confirmed (no email verification), redirect
      if (data.session) {
        setSession(data.user.id, data.user.email ?? null);
        await fetchProfile(data.user.id);
        navigate({ to: redirect as any });
      } else {
        setSuccess("Account created! Check your email to verify, then sign in.");
        setTab("signin");
        setSignIn({ email: signUp.email, password: "" });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      {/* Back button */}
      <div className="p-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <p className="font-mono text-xs uppercase tracking-[4px] text-amber-500 mb-3">
              🥒 Pickle World
            </p>
            <h1 className="font-black text-4xl text-white leading-tight">
              {tab === "signin" ? "Welcome back." : "Join the"}
              {tab === "signup" && (
                <span className="italic text-amber-500"> spice club.</span>
              )}
            </h1>
            <p className="text-white/40 text-sm mt-3">
              {tab === "signin"
                ? "Sign in to place your order & track deliveries."
                : "Create an account to order pickles & track deliveries."}
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
          >
            {/* Tab Switch */}
            <div className="grid grid-cols-2 border-b border-white/10">
              {(["signin", "signup"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                  className={`py-4 font-semibold text-sm transition-colors ${
                    tab === t
                      ? "bg-amber-500/10 text-amber-400 border-b-2 border-amber-500"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {t === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Success message */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-5"
                  >
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-green-400 text-sm">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5"
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── SIGN IN FORM ── */}
              <AnimatePresence mode="wait">
                {tab === "signin" && (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleSignIn}
                    className="space-y-4"
                  >
                    <InputField
                      icon={<Mail className="w-4 h-4" />}
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      value={signIn.email}
                      onChange={(v) => setSignIn({ ...signIn, email: v })}
                      required
                    />
                    <PasswordField
                      label="Password"
                      value={signIn.password}
                      onChange={(v) => setSignIn({ ...signIn, password: v })}
                      show={showPw}
                      toggleShow={() => setShowPw(!showPw)}
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {loading ? "Signing in…" : "Sign In & Order"}
                    </button>

                    <p className="text-center text-white/30 text-xs">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        className="text-amber-500 hover:text-amber-400 underline"
                      >
                        Create one
                      </button>
                      {" "} | {" "}
                      <button
                        type="button"
                        onClick={() => setTab("forgot")}
                        className="text-amber-500 hover:text-amber-400 underline"
                      >
                        Forgot password?
                      </button>
                    </p>
                  </motion.form>
                )}

                {/* ── FORGOT PASSWORD FORM ── */}
                {tab === "forgot" && (
                  <motion.form
                    key="forgot"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleResetPassword}
                    className="space-y-4"
                  >
                    <InputField
                      icon={<Mail className="w-4 h-4" />}
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      value={signIn.email}
                      onChange={(v) => setSignIn({ ...signIn, email: v })}
                      required
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {loading ? "Sending link…" : "Send Reset Link"}
                    </button>

                    <p className="text-center text-white/30 text-xs">
                      Remembered your password?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("signin")}
                        className="text-amber-500 hover:text-amber-400 underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </motion.form>
                )}

                {/* ── SIGN UP FORM ── */}
                {tab === "signup" && (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSignUp}
                    className="space-y-4"
                  >
                    <InputField
                      icon={<User className="w-4 h-4" />}
                      label="Full Name"
                      type="text"
                      placeholder="Your full name"
                      value={signUp.full_name}
                      onChange={(v) => setSignUp({ ...signUp, full_name: v })}
                      required
                    />
                    <InputField
                      icon={<Mail className="w-4 h-4" />}
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      value={signUp.email}
                      onChange={(v) => setSignUp({ ...signUp, email: v })}
                      required
                    />
                    <InputField
                      icon={<Phone className="w-4 h-4" />}
                      label="Phone Number"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={signUp.phone}
                      onChange={(v) => setSignUp({ ...signUp, phone: v })}
                      required
                    />
                    <PasswordField
                      label="Password"
                      value={signUp.password}
                      onChange={(v) => setSignUp({ ...signUp, password: v })}
                      show={showPw}
                      toggleShow={() => setShowPw(!showPw)}
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {loading ? "Creating account…" : "Create Account & Order"}
                    </button>

                    <p className="text-center text-white/30 text-xs">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("signin")}
                        className="text-amber-500 hover:text-amber-400 underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {["🔒 Secure Checkout", "🥒 100% Homemade", "🚚 Fast Delivery"].map((b) => (
              <span key={b} className="text-white/20 text-xs">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────────────

function InputField({
  icon, label, type, placeholder, value, onChange, required,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-white/50 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-colors text-sm"
        />
      </div>
    </div>
  );
}

function PasswordField({
  label, value, onChange, show, toggleShow,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggleShow: () => void;
}) {
  return (
    <div>
      <label className="block text-sm text-white/50 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
          <Lock className="w-4 h-4" />
        </span>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Min 6 characters"
          required
          minLength={6}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-colors text-sm"
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
