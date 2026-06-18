"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/tartas-personalizadas", label: "Tartas personalizadas" },
  { href: "/galeria", label: "Galería" },
  // TEMP: link a /encargos desactivado — reactivar cuando vuelva la página
  // { href: "/encargos", label: "Encargos" },
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/blog", label: "Hoy aprende" },
  { href: "/contacto", label: "Contacto" },
];

// CTA del nav: WhatsApp para pedir presupuesto. Antes de esto fue el botón
// del juego "Gana tu tarta gratis" — retirado al cerrarse la campaña.
const NAV_CTA_HREF =
  "https://wa.me/34624131348?text=Hola!%20Quiero%20pedir%20presupuesto%20para%20una%20tarta%20personalizada";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="site-header" role="banner">
      <nav className="nav" aria-label="Navegación principal">
        <Link
          href="/"
          className="nav-brand"
          aria-label="EvangelCake — Inicio"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/logo.png"
            alt="EvangelCake"
            width={72}
            height={72}
            priority
          />
        </Link>
        <ul className={`nav-links${open ? " is-open" : ""}`} id="navMenu">
          {links.map((l) => {
            const isActive =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={isActive ? "act" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="nav-cta">
          <a
            className="btn"
            href={NAV_CTA_HREF}
            target="_blank"
            rel="noopener noreferrer"
          >
            Encarga ahora →
          </a>
        </div>
        <button
          className="hamburger"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="navMenu"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </header>
  );
}
