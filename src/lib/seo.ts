import type { Metadata } from "next";
import {
  CONTACT_EMAIL,
  FACEBOOK_URL,
  LOCATION,
  SHIPPING_COVERAGE,
  WHATSAPP_URL,
} from "@/lib/contact";
import type { Product } from "@/types";

function normalizeSiteUrl(url: string): string {
  return url
    .replace(/\/$/, "")
    .replace("https://jonalparfum.com", "https://www.jonalparfum.com");
}

export const SITE_NAME = "Jon Al Parfum";
export const SITE_TAGLINE = "Perfumes que dejan huella";
export const SITE_DESCRIPTION =
  "Perfumes 100% originales de las mejores casas perfumistas. Tienda de lujo en Nuevo Laredo con envíos a toda la República Mexicana.";
export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_APP_URL || "https://www.jonalparfum.com"
);

export const DEFAULT_KEYWORDS = [
  "perfumes originales",
  "perfumería de lujo",
  "Jon Al Parfum",
  "Nuevo Laredo",
  "perfumes hombre",
  "perfumes mujer",
  "perfumes unisex",
  "envíos México",
  "fragancias auténticas",
];

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveImageUrl(image: string): string {
  if (!image) return absoluteUrl("/logo-jon-al-parfum.png");
  if (image.startsWith("http")) return image;
  return absoluteUrl(image);
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
  image?: string;
};

export function buildPageMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
  keywords,
  image,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const ogImage = resolveImageUrl(image ?? "/logo-jon-al-parfum.png");

  return {
    title,
    description,
    keywords: keywords ?? DEFAULT_KEYWORDS,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "es_MX",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export const NO_INDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: absoluteUrl("/logo-jon-al-parfum.png"),
    image: absoluteUrl("/logo-jon-al-parfum.png"),
    email: CONTACT_EMAIL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nuevo Laredo",
      addressRegion: "Tamaulipas",
      addressCountry: "MX",
    },
    areaServed: {
      "@type": "Country",
      name: "México",
    },
    sameAs: [FACEBOOK_URL, WHATSAPP_URL],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "es-MX",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tienda?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: resolveImageUrl(product.image),
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    category: product.category,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/tienda/${product.id}`),
      priceCurrency: "MXN",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function shopDescription(category?: string) {
  if (category === "hombre") {
    return "Perfumes originales para hombre. Fragancias de lujo con envío a todo México.";
  }
  if (category === "mujer") {
    return "Perfumes originales para mujer. Fragancias exclusivas con envío a todo México.";
  }
  if (category === "unisex") {
    return "Perfumes unisex originales. Descubre fragancias versátiles con envío nacional.";
  }
  return `Catálogo de perfumes 100% originales en ${LOCATION}. ${SHIPPING_COVERAGE}.`;
}
