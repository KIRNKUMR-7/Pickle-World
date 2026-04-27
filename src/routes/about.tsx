import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import heroJars from "@/assets/hero-jars.jpg";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "Our Story — Pickle World" },
      { name: "description", content: "How a tiny South Indian kitchen turned into a cult of seven hand-pounded pickles." },
    ],
  }),
});

function About() {
  return (
    <div className="relative min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-5xl px-6 pb-12 pt-16 md:pt-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-turmeric">The Origin</p>
        <h1 className="font-display text-6xl font-black leading-[0.9] md:text-8xl">
          A grandmother,<br />
          a stone mortar,<br />
          and a <span className="italic text-chili">stubborn</span> idea.
        </h1>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 md:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-7 md:pt-8"
        >
          <p className="font-display text-2xl font-bold leading-snug md:text-3xl">
            We don't make a thousand pickles. We make <span className="text-chili italic">seven.</span>
          </p>
          <div className="mt-6 space-y-5 text-lg text-muted-foreground">
            <p>
              Pickle World started in a kitchen the size of a closet, with a recipe scribbled on the back of a temple receipt. One pickle. One stove. One very loud grandmother who refused shortcuts.
            </p>
            <p>
              Six years later, we still pound our spices in stone. We still cure each batch for ten days before it touches a jar. And we still throw out anything that isn't perfect — even if it costs us the day's run.
            </p>
            <p>
              We picked seven flavours and stopped. Because a small menu means we obsess over every single one. No fillers. No "natural identical." No oil that hasn't been pressed this week.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8">
            {[
              { n: "07", l: "Flavours" },
              { n: "10d", l: "Cure time" },
              { n: "0", l: "Preservatives" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-4xl font-black text-chili md:text-5xl">{s.n}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative md:col-span-5"
        >
          <img src={heroJars} alt="Pickle jars" width={800} height={800} loading="lazy" className="rounded-2xl" />
          <div className="absolute -bottom-5 -left-5 rotate-[-6deg] rounded-full bg-turmeric px-5 py-3 font-display text-lg font-black text-ink shadow-sticker">
            ★ Small batch
          </div>
        </motion.div>
      </section>
      <SiteFooter />
    </div>
  );
}
