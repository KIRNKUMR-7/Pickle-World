import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Leaf, Flame, Package, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/why")({
  component: Why,
  head: () => ({
    meta: [
      { title: "Why Pickle World — Tiny batches, huge flavour" },
      { name: "description", content: "Four reasons our pickles taste like nothing else: cold-pressed oils, slow-cure, hand-pound, ethical sourcing." },
    ],
  }),
});

const pillars = [
  { icon: Leaf, title: "Nothing fake", body: "Cold-pressed sesame and mustard oils. Hand-picked spices. No colours, no preservatives, no shortcuts.", num: "01" },
  { icon: Flame, title: "Slow-cured", body: "Every batch matures for ten days minimum. The chili doesn't shout — it sings.", num: "02" },
  { icon: Package, title: "Honest packaging", body: "Glass, not plastic. A jar that earns a second life on your shelf, not a landfill.", num: "03" },
  { icon: HeartHandshake, title: "Fair to the source", body: "Coastal fishermen, hill goat-herders, organic farmers. We pay above market — always.", num: "04" },
];

function Why() {
  return (
    <div className="relative min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-16 md:pt-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-turmeric">Why Us</p>
        <h1 className="font-display text-6xl font-black leading-[0.9] md:text-9xl">
          Four <span className="italic text-chili">non-negotiables.</span>
        </h1>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 md:grid-cols-2">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-10 transition-colors hover:border-chili"
            >
              <span className="absolute right-6 top-6 font-display text-7xl font-black text-muted opacity-30 transition-colors group-hover:text-chili">
                {p.num}
              </span>
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-chili text-cream">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-black md:text-4xl">{p.title}</h2>
              <p className="mt-4 max-w-md text-lg text-muted-foreground">{p.body}</p>
            </motion.div>
          );
        })}
      </section>
      <SiteFooter />
    </div>
  );
}
