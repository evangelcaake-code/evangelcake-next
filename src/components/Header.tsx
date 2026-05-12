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

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // En home enlazamos al juego incrustado; fuera de home redirigimos a la home + ancla
  const ctaHref = pathname === "/" ? "#juego" : "/#juego";

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
          <Link className="btn nav-cta-game" href={ctaHref}>
            <span className="nav-cta-icon" aria-hidden="true">🎂</span>
            Gana tu tarta gratis
          </Link>
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
      {/* Banner permanente debajo del nav — visible siempre, en todas las
          páginas, en todos los tamaños. Está dentro del <header> sticky
          para que viaje con él al hacer scroll. */}
      <a className="home-promo-banner" href={ctaHref} aria-label="Juega y gana una tarta gratis">
        <span className="home-promo-banner-icon" aria-hidden="true">🎂</span>
        <span className="home-promo-banner-text">
          Juega y <strong>gana una tarta personalizada gratis</strong>
        </span>
        <span className="home-promo-banner-arrow" aria-hidden="true">→</span>
      </a>
    </header>
  );
}
