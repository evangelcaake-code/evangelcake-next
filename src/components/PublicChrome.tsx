"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CookiesBanner from "@/components/CookiesBanner";
import RevealOnScroll from "@/components/RevealOnScroll";
import NewsletterPopup from "@/components/NewsletterPopup";

export default function PublicChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return <main id="main">{children}</main>;
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <CookiesBanner />
      <RevealOnScroll />
      <NewsletterPopup />
    </>
  );
}
