"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR =
  ".feature, .step, .card, .blog-card, .press-item, .moment, .v, .why";

export default function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) return;

    const els = document.querySelectorAll<HTMLElement>(SELECTOR);
    if (els.length === 0) return;

    els.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const t = entry.target as HTMLElement;
            t.style.opacity = "1";
            t.style.transform = "translateY(0)";
            observer.unobserve(t);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );

    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
