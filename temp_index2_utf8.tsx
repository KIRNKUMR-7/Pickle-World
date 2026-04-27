import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { HeatMeter } from "@/components/HeatMeter";
import { flavours } from "@/data/flavours";
import heroJars from "@/assets/hero-jars.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Pickle World — Hand-pounded Indian pickles & podis" },
      { name: "description", content: "Seven small-batch, fire-forward Indian pickles and podis. Slow-cured, never compromised. Order from Pickle World." },
      { property: "og:title", content: "Pickle World — Stir the soul" },
      { property: "og:description", content: "Seven hand-pounded flavours. Country chicken, Andhra fish, Konkan dry fish & more." },
    ],
  }),
});

function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteNav />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-ember opacity-90" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-24 pt-16 md:grid-cols-12 md:pt-24">
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-turmeric backdrop-blur"
            >
              <Sparkles className="h-3 w-3" /> Seven flavours · Zero shortcuts
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-[14vw] font-black leading-[0.85] tracking-tight md:text-[8.5rem]"
            >
              Pickle
              <br />
              <span className="italic text-chili">World.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 max-w-md text-lg text-muted-foreground md:text-xl"
            >
              Not a pickle shop. A small, loud universe of hand-pounded, slow-cured non-veg pickles & podis from the deep South.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/flavours"
                className="group inline-flex items-center gap-2 rounded-full bg-chili px-7 py-4 font-mono text-sm font-bold uppercase tracking-widest text-cream shadow-glow transition-transform hover:scale-105"
              >
                Taste the Seven
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/about" className="font-mono text-sm uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-cream hover:underline">
                Our story →
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative md:col-span-5"
          >
            <div className="absolute -inset-10 rounded-full bg-chili/20 blur-3xl" />
            <img
              src={heroJars}
              alt="Pickle World jars splashing with chili oil and curry leaves"
              width={1024}
              height={1024}
              className="relative w-full rounded-2xl"
            />
            <div className="absolute -bottom-6 -left-6 rotate-[-8deg] rounded-full bg-turmeric px-5 py-3 font-display text-xl font-black text-ink shadow-sticker">
              ★ EST. 2019
            </div>
            <div className="absolute -right-4 top-6 rotate-[12deg] rounded-full bg-cream px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink shadow-sticker">
              No preservatives
            </div>
          </motion.div>
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
              Seven flavours.<br />
              <span className="text-stroke-chili">Zero filler.</span>
            </h2>
          </div>
          <Link to="/flavours" className="hidden font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-cream md:block">
            See all →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {flavours.slice(0, 6).map((f, i) => (
            <motion.div
              key={f.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-chili"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={f.image}
                  alt={f.name}
                  loading="lazy"
                  width={800}
                  height={800}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 font-mono text-xs uppercase tracking-widest text-turmeric backdrop-blur">
                  ₹{f.price}
                </div>
              </div>
              <div className="p-6">
                <p className="mb-1 font-mono text-xs uppercase tracking-widest text-chili">{f.tagline}</p>
                <h3 className="mb-3 font-display text-2xl font-black leading-tight">{f.name}</h3>
                <div className="flex items-center justify-between">
                  <HeatMeter level={f.heat} />
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{f.weight}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="relative overflow-hidden border-y border-border bg-chili">
        <div className="mx-auto max-w-6xl px-6 py-24 text-cream">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-turmeric">02 — The Manifesto</p>
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
