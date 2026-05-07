import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle, Package, ChevronLeft, LogIn } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

type CheckoutStep = 'cart' | 'details' | 'success';

export const Cart = () => {
  const { items, isCartOpen, toggleCart, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
  const { profile, sessionUserId, sessionEmail, signOut } = useAuthStore();

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState<{ paymentId: string; total: number } | null>(null);
  const [orderError, setOrderError] = useState('');

  // Pre-fill form from saved profile
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        name: profile.full_name || prev.name,
        phone: profile.phone || prev.phone,
        address: profile.default_address || prev.address,
        pincode: profile.default_pincode || prev.pincode,
      }));
    }
  }, [profile]);

  if (!isCartOpen) return null;

  const totalAmount = getTotalPrice();
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const isLoggedIn = !!sessionUserId;

  // ── Checkout with Razorpay ──────────────────────────────────────
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const cartSnapshot = [...items];

    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, receipt: `rcpt_${Date.now()}` }),
      });

      let order;
      try { order = await res.json(); }
      catch { throw new Error('Received invalid response from server.'); }

      if (!res.ok) throw new Error(order.error || 'Order creation failed. Check Vercel Environment Variables.');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Pickle World',
        description: `${totalItems} item(s) — ₹${totalAmount}`,
        order_id: order.id,
        prefill: { name: formData.name, contact: formData.phone, email: sessionEmail || '' },
        handler: async (response: any) => {
          // Clean items — strip image (large blob) before storing/sending
          const cleanItems = cartSnapshot.map(({ image: _img, id: _id, ...rest }) => rest);

          // 1. Save order to Supabase
          const { error: dbError } = await supabase.from('orders').insert([{
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            user_id: sessionUserId || null,
            customer_name: formData.name,
            customer_email: sessionEmail || '',
            customer_phone: formData.phone,
            customer_address: formData.address,
            customer_pincode: formData.pincode,
            total_amount: totalAmount,
            items: cleanItems,
            status: 'paid',
          }]);

          if (dbError) {
            console.error('Supabase insert error:', dbError);
            setOrderError(`Order saved in Razorpay but DB error: ${dbError.message}`);
          } else {
            // Save address back to profile
            if (sessionUserId) {
              await supabase.from('profiles').update({
                default_address: formData.address,
                default_pincode: formData.pincode,
              }).eq('id', sessionUserId);
            }
          }

          // 2. Send order confirmation email via Resend
          try {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerEmail: sessionEmail,
                customerName: formData.name,
                customerPhone: formData.phone,
                items: cleanItems,
                total: totalAmount,
                paymentId: response.razorpay_payment_id,
                address: formData.address,
                pincode: formData.pincode,
              }),
            });
          } catch (err) {
            console.error('Email notification failed (non-critical):', err);
          }

          // 3. Send WhatsApp to admin
          try {
            await fetch('/api/send-whatsapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerName: formData.name,
                customerPhone: formData.phone,
                address: formData.address,
                pincode: formData.pincode,
                total: totalAmount,
                items: cleanItems,
                paymentId: response.razorpay_payment_id,
              }),
            });
          } catch (err) {
            console.error('WhatsApp notification failed (non-critical):', err);
          }

          setLastOrder({ paymentId: response.razorpay_payment_id, total: totalAmount });
          clearCart();
          setStep('success');
        },
        theme: { color: '#F59E0B' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      alert(error.message || 'Could not initialize payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    toggleCart(false);
    setTimeout(() => { setStep('cart'); setLastOrder(null); }, 400);
  };

  const goToCheckout = () => {
    if (!isLoggedIn) {
      // Close cart and go to login, with redirect back
      toggleCart(false);
      window.location.href = `/login?redirect=${encodeURIComponent('/flavours')}`;
      return;
    }
    setStep('details');
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={handleClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-stone-950 border-l border-white/10 shadow-2xl z-[101] flex flex-col overflow-hidden">

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            {step === 'details' && (
              <button onClick={() => setStep('cart')} className="p-1 text-white/50 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-serif text-amber-500 flex items-center gap-2">
              {step === 'cart' && <><ShoppingBag className="w-5 h-5" /> Your Cart</>}
              {step === 'details' && <><Package className="w-5 h-5" /> Delivery Details</>}
              {step === 'success' && <><CheckCircle className="w-5 h-5 text-green-400" /><span className="text-green-400">Order Placed!</span></>}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Auth status in header */}
            {isLoggedIn && profile && step === 'cart' && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-xs text-white/30 truncate max-w-[100px]">{profile.full_name?.split(' ')[0]}</span>
                <button
                  onClick={signOut}
                  className="text-xs text-white/20 hover:text-red-400 transition-colors"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            )}
            <button onClick={handleClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

          {/* STEP 1: Cart Items */}
          {step === 'cart' && (
            items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-4">
                <ShoppingBag className="w-16 h-16 opacity-20" />
                <p className="text-lg">Your cart is empty</p>
                <button onClick={handleClose} className="text-amber-500 border border-amber-500/50 px-6 py-2 rounded-full mt-4 hover:bg-amber-500/10 transition-colors">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Login nudge if not logged in */}
                {!isLoggedIn && (
                  <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <LogIn className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-amber-300 text-sm">
                      <a href="/login" className="font-semibold underline hover:text-amber-200">Sign in</a> to checkout and track your orders.
                    </p>
                  </div>
                )}

                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-black/50 p-2 flex items-center justify-center" style={{width: 72, height: 72}}>
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm leading-tight">{item.name}</h3>
                      <p className="text-white/40 text-xs mt-0.5">{item.variant}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-amber-400 font-bold">₹{item.price * item.quantity}</p>
                        <div className="flex items-center gap-2 bg-black/50 rounded-full px-2 py-1">
                          <button onClick={() => item.quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white text-sm w-4 text-center font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="self-start p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* STEP 2: Delivery Form */}
          {step === 'details' && (
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-5">
              <p className="text-white/40 text-sm -mt-2 mb-4">Confirm your delivery details below.</p>

              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Enter your full name' },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '10-digit mobile number' },
                { label: 'PIN Code', key: 'pincode', type: 'text', placeholder: 'e.g. 600001' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm text-white/60 mb-1.5">{label}</label>
                  <input
                    required
                    type={type}
                    value={formData[key as keyof typeof formData]}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors text-sm"
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Delivery Address</label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none transition-colors text-sm"
                  placeholder="House No, Street, City, District"
                />
              </div>

              {/* Order Summary */}
              <div className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-2">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Order Summary</p>
                {items.map(i => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span className="text-white/60">{i.name} ({i.variant}) × {i.quantity}</span>
                    <span className="text-white">₹{i.price * i.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400">₹{totalAmount}</span>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: Success */}
          {step === 'success' && lastOrder && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-5">
              <div className="w-24 h-24 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle className="w-14 h-14 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Thank You, {formData.name.split(' ')[0]}! 🎉</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Your order for <span className="text-amber-400 font-semibold">₹{lastOrder.total}</span> has been placed.
                  {sessionEmail && (
                    <> Confirmation sent to <span className="text-amber-400">{sessionEmail}</span>.</>
                  )}
                </p>
              </div>

              {/* DB error warning */}
              {orderError && (
                <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-left">
                  <p className="text-red-400 text-xs">⚠️ {orderError}</p>
                  <p className="text-red-300/60 text-xs mt-1">Payment succeeded — contact support with your Payment ID.</p>
                </div>
              )}

              <div className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-left space-y-1">
                <p className="text-xs text-white/30 uppercase tracking-widest">Payment ID</p>
                <p className="text-xs text-white/70 font-mono break-all">{lastOrder.paymentId}</p>
              </div>

              {sessionUserId && (
                <a
                  href="/profile"
                  className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm font-mono text-center transition-colors block"
                >
                  View Order History →
                </a>
              )}

              <button
                onClick={handleClose}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-4 rounded-xl transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        {(step === 'cart' || step === 'details') && items.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-black/50 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/40 text-xs">{totalItems} item{totalItems > 1 ? 's' : ''}</p>
                <p className="text-white font-bold text-xl">₹{totalAmount}</p>
              </div>
              {step === 'cart' && (
                <button
                  onClick={goToCheckout}
                  className={`font-bold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2 ${
                    isLoggedIn
                      ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {isLoggedIn ? 'Checkout →' : <><LogIn className="w-4 h-4" /> Login to Order</>}
                </button>
              )}
              {step === 'details' && (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-stone-950 font-bold px-6 py-3.5 rounded-xl transition-colors"
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${totalAmount}`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
