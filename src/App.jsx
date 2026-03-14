import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import ProductModal from "./components/ProductModal";
import AboutSection from "./components/AboutSection";
import ShippingInfoSection from "./components/ShippingInfoSection";
import CartSidebar from "./components/CartSidebar";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";
import Footer from "./components/Footer";

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <CartProvider>
      <div className="min-h-screen bg-ivory-100 relative" dir="rtl" lang="ar">
        <a
          href="#products"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[100]
            focus:bg-olive-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg
            font-arabic text-sm"
        >
          انتقل إلى المحتوى
        </a>

        <Navbar />

        <main id="main-content">
          <Hero />
          <ProductGrid onViewDetails={setSelectedProduct} />
          <AboutSection />
          <ShippingInfoSection />
        </main>

        <Footer />

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}

        <CartSidebar />
        <FloatingWhatsAppButton />
      </div>
    </CartProvider>
  );
}
