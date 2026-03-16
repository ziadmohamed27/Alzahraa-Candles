import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import ProductModal from "./components/ProductModal";
import AboutSection from "./components/AboutSection";
import Testimonials from "./components/Testimonials";
import ShippingInfoSection from "./components/ShippingInfoSection";
import FAQ from "./components/FAQ";
import CartSidebar from "./components/CartSidebar";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";
import Footer from "./components/Footer";

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <CartProvider>
      <div className="min-h-screen bg-ivory-100 relative" dir="rtl" lang="ar">
        <a href="#products"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[100]
            focus:bg-olive-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg
            font-arabic text-sm">
          انتقلي إلى المحتوى
        </a>

        <Navbar />

        <main id="main-content">
          {/* 1. Hero — first impression */}
          <Hero />
          {/* 2. Products — primary conversion point */}
          <ProductGrid onViewDetails={setSelectedProduct} />
          {/* 3. Testimonials — social proof */}
          <Testimonials />
          {/* 4. About — brand trust */}
          <AboutSection />
          {/* 5. Shipping info — removes purchase friction */}
          <ShippingInfoSection />
          {/* 6. FAQ — handles objections before they block purchase */}
          <FAQ />
        </main>

        <Footer />

        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}

        <CartSidebar />

        {/* Floating button appears after 2s — doesn't distract on first load */}
        <FloatingWhatsAppButton />
      </div>
    </CartProvider>
  );
}
