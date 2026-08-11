import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata = {
  title: "Jon Al Parfum | Perfumería de lujo",
  description:
    "Perfumes que dejan huella. Descubre nuestra colección exclusiva de fragancias de autor para hombre, mujer y unisex.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${inter.variable} ${cormorant.variable} font-sans antialiased bg-luxury-black text-cream`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
