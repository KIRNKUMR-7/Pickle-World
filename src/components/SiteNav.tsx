import { Link } from "@tanstack/react-router";
import { Menu, X, ShoppingBag } from "lucide-react";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";

export function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, toggleCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="group flex items-center gap-2">
          <img src={logo} alt="Pickle World Logo" className="h-12 scale-[1.3] md:h-12 w-auto object-contain rounded-md origin-left md:scale-[2]" />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { to: "/", label: "Home" },
            { to: "/flavours", label: "Flavours" },
            { to: "/about", label: "Story" },
            { to: "/why", label: "Why Us" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-4 py-2 font-mono text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "rounded-full px-4 py-2 font-mono text-sm uppercase tracking-widest bg-chili text-cream" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <button
            id="cart-toggle-btn"
            onClick={() => toggleCart()}
            className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-cream"
            aria-label="Open Cart"
          >
            <ShoppingBag className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-amber-500 text-stone-950 text-[10px] font-black">
                {totalItems}
              </span>
            )}
          </button>
          <a
            href="#order"
            className="rounded-full bg-cream px-4 py-1.5 md:px-5 md:py-2 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest text-ink transition-transform hover:scale-105"
          >
            Order ↗
          </a>
          <button className="md:hidden p-1" onClick={() => setIsOpen(true)}>
            <Menu className="h-6 w-6 text-cream" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 h-screen bg-background z-50 flex flex-col p-6 border-b border-border/40"
          >
            <div className="flex justify-between items-center mb-12">
              <Link to="/" className="group flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <img src={logo} alt="Pickle World Logo" className="h-10 scale-110 w-auto object-contain rounded-md origin-left" />
              </Link>
              <button className="p-1" onClick={() => setIsOpen(false)}>
                <X className="h-8 w-8 text-cream" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6 text-center mt-8">
              {[
                { to: "/", label: "Home" },
                { to: "/flavours", label: "Flavours" },
                { to: "/about", label: "Story" },
                { to: "/why", label: "Why Us" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setIsOpen(false)}
                  className="text-3xl font-display font-black uppercase tracking-widest text-muted-foreground hover:text-cream"
                  activeProps={{ className: "text-3xl font-display font-black uppercase tracking-widest text-turmeric" }}
                  activeOptions={{ exact: true }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            
            <div className="mt-auto mb-10 flex justify-center">
              <a
                href="#order"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-chili px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-cream shadow-glow"
              >
                Taste the Seven
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
