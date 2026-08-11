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
  title: "Jon Al Parfum | Tienda de perfumes de lujo",
  description:
    "Perfumes que dejan huella. Tienda de fragancias 100% originales para hombre, mujer y unisex. Envíos a toda la República Mexicana.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload"){document.documentElement.dataset.skipEnterMotion="true";}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} ${cormorant.variable} font-sans antialiased bg-luxury-black text-cream`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
