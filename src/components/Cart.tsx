import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle, Package, ChevronLeft } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { supabase } from '../lib/supabase';

type CheckoutStep = 'cart' | 'details' | 'success';

export const Cart = () => {
  const { items, isCartOpen, toggleCart, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState<{ paymentId: string; total: number } | null>(null);

  if (!isCartOpen) return null;

  const totalAmount = getTotalPrice();
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const cartSnapshot = [...items]; // snapshot before clearing

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
        prefill: { name: formData.name, contact: formData.phone },
        handler: async (response: any) => {
          // Save order to Supabase
          try {
            await supabase.from('orders').insert([{
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              customer_name: formData.name,
              customer_phone: formData.phone,
              customer_address: formData.address,
              customer_pincode: formData.pincode,
              total_amount: totalAmount,
              items: cartSnapshot,
              status: 'paid',
            }]);
          } catch (err) {
            console.error('Failed to save order to Supabase:', err);
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
    // Reset step after a short delay so animation plays
    setTimeout(() => { setStep('cart'); setLastOrder(null); }, 400);
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
          <button onClick={handleClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
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
              <p className="text-white/40 text-sm -mt-2 mb-4">We'll ship your order to this address.</p>

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
            <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-6">
              <div className="w-24 h-24 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle className="w-14 h-14 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Thank You, {formData.name.split(' ')[0]}! 🎉</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Your order for <span className="text-amber-400 font-semibold">₹{lastOrder.total}</span> has been placed successfully. We'll ship it to your address shortly!
                </p>
              </div>
              <div className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-left space-y-2">
                <p className="text-xs text-white/30 uppercase tracking-widest">Payment ID</p>
                <p className="text-xs text-white/70 font-mono break-all">{lastOrder.paymentId}</p>
              </div>
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
                  onClick={() => setStep('details')}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2"
                >
                  Checkout →
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
