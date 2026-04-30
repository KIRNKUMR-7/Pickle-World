import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { flavours } from "@/data/flavours";
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/flavours")({
  component: Flavours,
});

function Flavours() {
  return (
    <div className="relative min-h-screen">
      <SiteNav />
      <section className="relative mx-auto max-w-7xl px-6 pb-12 pt-16 md:pt-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-turmeric">The Lineup</p>
        <h1 className="font-display text-6xl font-black leading-[0.9] md:text-9xl">
          The <span className="italic text-chili">Seven.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Each one is a tiny rebellion against bland. Pick your fight.
        </p>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-6 pb-24">
        {flavours.map((f, i) => (
          <motion.article
            key={f.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`group grid overflow-hidden rounded-2xl border border-white/5 glass-card transition-all duration-500 hover:shadow-glow hover:-translate-y-1 md:grid-cols-12 ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}
          >
            <div className="relative aspect-[4/3] md:col-span-5 md:aspect-auto">
              <img
                src={f.image}
                alt={f.name}
                loading="lazy"
                width={800}
                height={800}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute left-4 top-4 rounded-full bg-ink/80 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-cream backdrop-blur">
                №&nbsp;0{i + 1}
              </div>
            </div>
            <div className="flex flex-col justify-between p-8 md:col-span-7 md:p-12">
              <div>
                <p className="mb-3 font-mono text-xs uppercase tracking-widest text-chili">{f.tagline}</p>
                <h2 className="font-display text-4xl font-black leading-none md:text-6xl">{f.name}</h2>
                <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">{f.story}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {f.notes.map((n) => (
                    <span key={n} className="rounded-full border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex items-end justify-between border-t border-border pt-6">
                <div>
                  <p className="font-display text-4xl font-black">
                    {f.weight}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm(`Proceed to order ${f.name} via WhatsApp?`)) {
                      window.open(`https://wa.me/919842298461?text=I%20wanna%20order%20${encodeURIComponent(f.name.toLowerCase())}`, '_blank');
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-chili px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream transition-transform hover:scale-105"
                >
                  <ShoppingBag className="h-4 w-4" /> Add
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}
