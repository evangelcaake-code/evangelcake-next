import type { Metadata, Viewport } from "next";
import "./globals.css";
import PublicChrome from "@/components/PublicChrome";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default:
      "EvangelCake | Tartas Personalizadas Zaragoza · Pastelería Artesanal Brasileña",
    template: "%s | EvangelCake Zaragoza",
  },
  description:
    "Tartas personalizadas en Zaragoza, hechas a mano con chantilly y alma brasileña. Andreia y Tiago, 20 años de oficio.",
  keywords: [
    "tartas personalizadas zaragoza",
    "pastelería brasileña zaragoza",
    "evangelcake",
    "tartas chantilly zaragoza",
    "paseo maría agustín",
    "andreia evangelista",
  ],
  authors: [{ name: "EvangelCake — Andreia & Tiago Evangelista" }],
  icons: { icon: "/images/logo.png", apple: "/images/logo.png" },
  openGraph: {
    type: "website",
    siteName: "EvangelCake",
    locale: "es_ES",
    url: SITE,
    images: [{ url: "/images/gallery/boda-rosas.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/gallery/boda-rosas.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF3DF",
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: "EvangelCake",
  description:
    "Pastelería artesanal especializada en tartas personalizadas con tradición brasileña.",
  image: `${SITE}/images/logo.png`,
  logo: `${SITE}/images/logo.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Paseo María Agustín 13",
    addressLocality: "Zaragoza",
    addressRegion: "Aragón",
    postalCode: "50004",
    addressCountry: "ES",
  },
  geo: { "@type": "GeoCoordinates", latitude: "41.6503262", longitude: "-0.8892718" },
  telephone: "+34624131348",
  email: "hola@evangelcake.com",
  url: SITE,
  priceRange: "€€",
  servesCuisine: ["Repostería Brasileña", "Pastelería Artesanal"],
  founder: [
    { "@type": "Person", name: "Andreia Evangelista", nationality: "Brazilian" },
    { "@type": "Person", name: "Tiago Evangelista" },
  ],
  sameAs: [
    "https://instagram.com/evangelcake",
    "https://instagram.com/evangelcake_andreia",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Great+Vibes&family=Fraunces:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body>
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}
