import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <ScrollToTop />
      <Header />
      <main className="min-h-screen bg-luxury-black overflow-x-hidden">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <CookieConsent />
    </CartProvider>
  );
}
