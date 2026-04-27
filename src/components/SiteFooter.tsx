import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, Globe, Phone, Instagram, Facebook, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import shopFront from "@/assets/shop-front.png";

export function SiteFooter() {
  return (
    <footer className="relative z-10 bg-background text-cream border-t border-border/40">

      {/* About & Location Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-border/40 min-h-[400px]">
        
        {/* Left Side: Shop Image */}
        <div className="relative h-64 md:h-auto border-r border-border/40">
          <img src={shopFront} alt="Pickle World Shop Front" className="absolute inset-0 w-full h-full object-cover" />
        </div>

        {/* Right Side: Content & Map */}
        <div className="bg-ink p-8 md:p-12 flex flex-col justify-between">
          <div className="mb-12">
            <h4 className="font-display italic text-3xl text-chili mb-6">Our Promise</h4>
            <div className="space-y-6 font-display text-xl text-cream/90 leading-snug">
              <p>
                <span className="text-chili block mb-1 text-sm tracking-widest uppercase">Tradition</span>
                Hand-pounded using age-old recipes.
              </p>
              <p>
                <span className="text-chili block mb-1 text-sm tracking-widest uppercase">Hygiene</span>
                Small batches, strict standards, 100% pure.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-display italic text-2xl text-chili mb-4">Shop Location:</h4>
            <div className="h-64 w-full rounded-xl overflow-hidden border border-border/40">
              <iframe
                src="https://maps.google.com/maps?q=Nedunchezhian+St,+Tiruchirappalli,+Tamil+Nadu+620021&t=&z=18&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                className="border-0 grayscale contrast-125 opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

      </div>
      
      {/* Top Banner */}
      <a href="https://wa.me/919842298461?text=hi%20i%20wanna%20place%20an%20order" target="_blank" rel="noopener noreferrer" className="block border-b border-border/40 px-6 py-10 md:py-16 bg-ink flex justify-between items-center group cursor-pointer transition-colors hover:bg-black">
        <h2 className="font-display text-5xl sm:text-6xl md:text-[8rem] font-black leading-none uppercase text-chili tracking-tighter">
          PLACE AN ORDER
        </h2>
        <ArrowUpRight className="block h-12 w-12 md:h-32 md:w-32 text-chili transition-transform duration-500 group-hover:translate-x-4 group-hover:-translate-y-4" strokeWidth={1} />
      </a>

      {/* Main Footer Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
        
        {/* Column 1: Brand Info (Red background) */}
        <div className="md:col-span-1 bg-chili p-8 flex flex-col justify-between text-ink border-b md:border-b-0 md:border-r border-border/40">
          <div>
            <img src={logo} alt="Pickle World" className="h-16 w-auto mb-16 rounded-md shadow-lg" />
            <h3 className="font-display text-5xl font-black uppercase tracking-tight mb-2">
              PICKLE<br />WORLD
            </h3>
            <p className="font-mono text-sm leading-relaxed font-semibold max-w-[200px] mt-4">
              Hand-pounded Indian pickles & podis. 
              <br /><br />
              Made in tiny batches.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-12">
            <Globe className="h-6 w-6" />
            <Phone className="h-6 w-6" />
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="md:col-span-1 bg-ink flex flex-col border-b md:border-b-0 md:border-r border-border/40">
          {[
            { to: "/", label: "Works" },
            { to: "/flavours", label: "Flavours" },
            { to: "/about", label: "Story" },
            { to: "/why", label: "Why Us" },
          ].map((link) => (
            <Link 
              key={link.label}
              to={link.to}
              className="flex-1 flex items-center justify-between px-8 py-6 md:py-0 border-b border-border/40 last:border-0 hover:bg-white/5 transition-colors group"
            >
              <span className="font-display text-2xl font-bold">{link.label}</span>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-cream transition-colors" />
            </Link>
          ))}
        </div>

        {/* Column 3: Social & Contact */}
        <div className="md:col-span-1 bg-ink p-8 flex flex-col justify-between">
          <div className="space-y-12">
            <div>
              <h4 className="font-display italic text-3xl text-chili mb-6">Follow Us</h4>
              <div className="flex flex-col gap-3 font-mono text-sm text-cream/80">
                <a href="https://www.instagram.com/pickleworld_homemade?igsh=MXNmcDd3cGpubzBtNQ==" target="_blank" rel="noopener noreferrer" className="hover:text-chili transition-colors flex items-center gap-2">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
                <a href="#" className="hover:text-chili transition-colors flex items-center gap-2">
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
                <a href="https://wa.me/919842298461?text=hi%20i%20wanna%20place%20an%20order" target="_blank" rel="noopener noreferrer" className="hover:text-chili transition-colors flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-display italic text-3xl text-chili mb-6">Reach Out</h4>
              <div className="flex flex-col gap-3 font-mono text-sm text-cream/80">
                <a href="mailto:Pickleworldhomemadenonvegpickl@gmail.com" className="hover:text-chili transition-colors break-all flex items-start gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0 mt-0.5" /> <span>Pickleworldhomemadenonvegpickl@gmail.com</span>
                </a>
                <a href="tel:+919842298461" className="hover:text-chili transition-colors flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" /> +91 98422 98461
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              © {new Date().getFullYear()} PICKLE WORLD
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
