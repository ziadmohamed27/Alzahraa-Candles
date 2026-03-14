import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { storeInfo } from "../data/products";

function HamburgerIcon({ open }) {
  return (
    <div className="flex flex-col gap-[5px] w-5 cursor-pointer" aria-hidden="true">
      <span
        className={`block h-0.5 bg-charcoal-700 rounded-full transition-all duration-300 origin-center
          ${open ? "rotate-45 translate-y-[7px]" : ""}`}
      />
      <span
        className={`block h-0.5 bg-charcoal-700 rounded-full transition-all duration-300
          ${open ? "opacity-0 scale-x-0" : ""}`}
      />
      <span
        className={`block h-0.5 bg-charcoal-700 rounded-full transition-all duration-300 origin-center
          ${open ? "-rotate-45 -translate-y-[7px]" : ""}`}
      />
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, setIsOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "الرئيسية", href: "#hero" },
    { label: "المنتجات", href: "#products" },
    { label: "عن المتجر", href: "#about" },
    { label: "تواصل معنا", href: "#footer" },
  ];

  return (
    <>
      <header
        role="banner"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled
            ? "bg-ivory-100/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)]"
            : "bg-ivory-100/80 backdrop-blur-sm"
          }`}
      >
        <div className="max-w-lg mx-auto px-4 h-[60px] flex items-center justify-between">
          {/* Right: Hamburger */}
          <button
            aria-label="فتح القائمة"
            aria-expanded={menuOpen}
            className="nav-icon-btn"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <HamburgerIcon open={menuOpen} />
          </button>

          {/* Center: Brand */}
          <a
            href="#hero"
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none group"
            aria-label={storeInfo.name}
          >
            <span className="font-display text-xl font-semibold text-olive-700 group-hover:text-olive-600 transition-colors">
              {storeInfo.name}
            </span>
            <span className="text-[9px] font-arabic text-charcoal-400 tracking-widest uppercase mt-0.5">
              Natural Soap
            </span>
          </a>

          {/* Left: Cart */}
          <button
            aria-label={`سلة التسوق، ${totalItems} منتج`}
            className="nav-icon-btn relative"
            onClick={() => setIsOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && (
              <span
                className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1
                  flex items-center justify-center
                  bg-price text-white text-[10px] font-bold rounded-full
                  cart-badge-pulse"
                aria-live="polite"
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile drawer menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300
          ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-charcoal-900/40 modal-backdrop transition-opacity duration-300
            ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer */}
        <nav
          role="navigation"
          aria-label="القائمة الرئيسية"
          className={`absolute top-0 right-0 h-full w-72 bg-ivory-100 shadow-modal
            flex flex-col pt-20 pb-8 px-6
            transition-transform duration-300 ease-spring
            ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Close */}
          <button
            aria-label="إغلاق القائمة"
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 left-4 nav-icon-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Brand in drawer */}
          <div className="mb-8 pb-6 border-b border-ivory-300">
            <p className="font-display text-2xl text-olive-700">{storeInfo.name}</p>
            <p className="font-arabic text-sm text-charcoal-400 mt-1">{storeInfo.tagline}</p>
          </div>

          {/* Nav links */}
          <ul className="flex flex-col gap-1">
            {navLinks.map((link, i) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-arabic text-base
                    text-charcoal-700 hover:bg-olive-50 hover:text-olive-700
                    transition-all duration-200
                    opacity-0 animate-fade-up`}
                  style={{ animationDelay: `${i * 60 + 100}ms`, animationFillMode: "forwards" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-olive-400 flex-shrink-0" aria-hidden="true" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Bottom CTA */}
          <div className="mt-auto">
            <a
              href="#products"
              onClick={() => setMenuOpen(false)}
              className="btn-primary w-full text-center"
            >
              تسوق الآن
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
