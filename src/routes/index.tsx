import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { flavours } from "@/data/flavours";
import jarStraight from "@/assets/jar-straight.png";
import jarTilted from "@/assets/jar-tilted.png";
import chatgptImg from "@/assets/chatgpt.png";
import welcomeMobile from "@/assets/welcome-mobile.png";
import aboutImage from "@/assets/about-image.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-black pointer-events-none"
          >
            <motion.img
              src={chatgptImg}
              alt="Welcome to Pickle World"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="hidden md:block w-full h-full object-cover"
            />
            <motion.img
              src={welcomeMobile}
              alt="Welcome to Pickle World Mobile"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="block md:hidden w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <SiteNav />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-ember opacity-90" />
        <div className="relative mx-auto max-w-7xl gap-2 md:gap-10 px-6 pb-24 pt-2 md:grid md:grid-cols-12 md:pt-24 flex flex-col">
          <div className="md:col-span-7 flex flex-col z-20">
            {/* Top Badges Area */}
            <div className="flex justify-start items-start mb-2 md:mb-6 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 font-mono text-[10px] md:text-xs uppercase tracking-widest text-turmeric backdrop-blur"
              >
                <Sparkles className="h-3 w-3" /> Seven flavours · Zero shortcuts
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-[16vw] md:text-[8.5rem] font-black leading-[0.85] tracking-tight"
            >
              Pickle
              <br />
              <span className="italic text-chili">World.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3 md:mt-6 max-w-md text-sm md:text-xl text-muted-foreground"
            >
              Not a pickle shop. A small, loud universe of hand-pounded, slow-cured non-veg pickles & podis from the deep South.
            </motion.p>

            {/* Desktop Buttons (Hidden on mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="hidden md:flex mt-8 flex-wrap items-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link
                  to="/flavours"
                  className="group inline-flex items-center gap-2 rounded-full bg-chili px-7 py-4 font-mono text-sm font-bold uppercase tracking-widest text-cream shadow-glow"
                >
                  Taste the Seven
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
              <Link to="/about" className="font-mono text-sm uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-cream hover:underline">
                Our story →
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative md:col-span-5 h-[195px] sm:h-[380px] md:h-auto w-full max-w-sm mx-auto md:max-w-none -mt-8 md:mt-0 z-10"
          >
            {/* Animated Ambient Blobs */}
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-10 top-0 left-0 rounded-full bg-chili/30 blur-3xl w-72 h-72 mix-blend-screen"
            />
            <motion.div
              animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-20 right-0 rounded-full bg-turmeric/20 blur-3xl w-64 h-64 mix-blend-screen"
            />

            <img
              src={jarStraight}
              alt="Chicken Pickle"
              className="absolute top-0 left-0 z-10 w-[65%] drop-shadow-2xl"
            />
            <img
              src={jarTilted}
              alt="Fish Pickle"
              className="absolute right-0 top-6 z-20 w-[65%] drop-shadow-2xl rotate-12"
            />

            {/* Mobile "No Preservatives" Badge Removed */}

            {/* Desktop Badges (Hidden on mobile) */}
            <div className="hidden md:block absolute -bottom-6 -left-6 rotate-[-8deg] rounded-full bg-turmeric px-5 py-3 font-display text-xl font-black text-ink shadow-sticker z-30">
              ★ EST. 2021
            </div>
          </motion.div>

          {/* Mobile Text Links & Action (Hidden on desktop) */}
          <div className="md:hidden flex flex-col items-center w-full z-40 mt-36 mb-4">
            <Link
              to="/flavours"
              className="mb-6 flex w-full max-w-[280px] justify-center items-center gap-2 rounded-full bg-chili px-7 py-4 font-mono text-sm font-bold uppercase tracking-widest text-cream shadow-glow"
            >
              Taste the Seven
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/about" className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-cream hover:underline">
              Our story →
            </Link>
            <div className="w-full flex justify-start pl-2 mt-8">
              <div className="rotate-[-6deg] rounded-full bg-turmeric px-6 py-2.5 font-display text-xl font-black text-ink shadow-sticker">
                ★ EST. 2021
              </div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-y border-border/40 bg-cream py-3">
          <div className="flex animate-marquee whitespace-nowrap font-display text-2xl font-black uppercase text-ink">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="mx-6 flex items-center gap-6">
                Country chicken
                <span className="text-chili">●</span>
                Andhra fish
                <span className="text-chili">●</span>
                Konkan dry fish
                <span className="text-chili">●</span>
                Tiger prawn
                <span className="text-chili">●</span>
                Hill goat
                <span className="text-chili">●</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* THE SEVEN */}
      <section id="order" className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-turmeric">01 — The Lineup</p>
            <h2 className="font-display text-5xl font-black leading-none md:text-7xl">
              <span className="text-gradient-fire">Seven flavours.</span><br />
              <span className="text-stroke-chili">Zero filler.</span>
            </h2>
          </div>
          <Link to="/flavours" className="hidden font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-cream md:block">
            See all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {flavours.slice(0, 7).map((f, i) => (
            <motion.div
              key={f.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05 }}
              onClick={async () => {
                try {
                  const res = await fetch("/api/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: f.price, receipt: `rcpt_${f.slug}_${Date.now()}` })
                  });
                  
                  let order;
                  try {
                    order = await res.json();
                  } catch (e) {
                    throw new Error("Received invalid response from server. Vercel API might be broken.");
                  }

                  if (!res.ok) {
                    throw new Error(order.error || "Order creation failed. Check Vercel Environment Variables.");
                  }
                  
                  const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: "Pickle World",
                    description: `Order for ${f.name}`,
                    order_id: order.id,
                    handler: function (response: any) {
                      alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
                    },
                    prefill: {
                      name: "Guest User",
                      email: "guest@example.com",
                      contact: "9999999999"
                    },
                    theme: { color: "#F37254" }
                  };
                  const rzp1 = new (window as any).Razorpay(options);
                  rzp1.open();
                } catch (error) {
                  alert(error.message || "Could not initialize Razorpay.");
                }
              }}
              className="group relative overflow-hidden rounded-2xl glass-card border border-white/5 transition-all duration-500 hover:shadow-glow hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative aspect-[4/3] sm:aspect-[4/3] overflow-hidden bg-black/20">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={f.image}
                  alt={f.name}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-3 md:p-6 relative z-20">
                <p className="mb-1 font-mono text-[8px] md:text-xs uppercase tracking-widest text-chili line-clamp-1">{f.tagline}</p>
                <h3 className="mb-2 font-display text-base md:text-2xl font-black uppercase leading-tight group-hover:text-turmeric transition-colors line-clamp-2">{f.name}</h3>
                <div className="flex items-center justify-between mt-3 md:mt-6">
                  <div className="flex flex-col gap-1 md:gap-2">
                    <div className="flex flex-wrap gap-2 md:gap-4 font-mono text-xs md:text-sm items-center">
                      <span className="text-muted-foreground">{f.weight}</span>
                      <span className="font-bold text-cream">₹{f.price}</span>
                      {f.price300g && (
                        <>
                          <span className="text-muted-foreground ml-1 md:ml-2">300g</span>
                          <span className="font-bold text-cream">₹{f.price300g}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:block rounded-full bg-white/10 p-3 opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <ArrowRight className="h-4 w-4 text-turmeric" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ABOUT US */}
      <section className="relative overflow-hidden border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col"
            >
              <p className="mb-4 font-mono text-xs uppercase tracking-widest text-turmeric">02 — Our Story</p>
              <h2 className="font-display text-4xl md:text-6xl font-black leading-tight mb-6">
                Rooted in <br className="hidden lg:block" />
                <span className="italic text-chili">tradition.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                What started as a small family recipe has grown into a fiery passion for bringing the true taste of the South to your table. We believe in hand-pounding spices, slow-curing our ingredients, and never, ever taking shortcuts.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Every jar of Pickle World is a testament to our dedication to quality, authenticity, and flavor that refuses to be ignored. From our kitchen to yours.
              </p>
              <div>
                <Link to="/about" className="inline-flex items-center gap-2 rounded-full border border-chili px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-chili transition-colors hover:bg-chili hover:text-cream">
                  Read Full Story
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative mt-8 md:mt-0"
            >
              <div className="absolute -inset-4 bg-chili/20 blur-3xl rounded-full" />
              <img
                src={aboutImage}
                alt="Woman making authentic pickle"
                className="relative z-10 max-h-[350px] md:max-h-[500px] w-auto mx-auto rounded-2xl drop-shadow-2xl border border-white/10"
              />
              <div className="absolute -bottom-6 -left-6 md:-left-12 z-20 rotate-[-6deg] rounded-full bg-turmeric px-6 py-3 font-display text-lg md:text-xl font-black text-ink shadow-sticker">
                ★ 100% Homemade
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="relative overflow-hidden border-y border-border bg-chili">
        <div className="mx-auto max-w-6xl px-6 py-24 text-cream">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-turmeric">03 — The Manifesto</p>
          <p className="font-display text-4xl font-black leading-tight md:text-6xl">
            We refuse to be polite.<br />
            <span className="italic">Pickles should</span><br />
            <span className="text-stroke">make you sweat,</span><br />
            grin, and reach for one more spoon.
          </p>
        </div>
        <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-turmeric opacity-30 blur-3xl" />
      </section>

      <SiteFooter />
    </div>
  );
}
