"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Banner promocional "Juega y gana una tarta gratis" que se muestra
 * permanentemente justo debajo del header en todas las páginas públicas.
 * En la home apunta al ancla #juego; en cualquier otra ruta redirige a
 * /game (la página dedicada con el juego embebido).
 */
export default function GameCtaBanner() {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";
  const href = isHome ? "#juego" : "/game";

  return (
    <a className="home-promo-banner" href={href} aria-label="Juega y gana una tarta gratis">
      <span className="home-promo-banner-icon" aria-hidden="true">🎂</span>
      <span className="home-promo-banner-text">
        Juega y <strong>gana una tarta personalizada gratis</strong>
      </span>
      <span className="home-promo-banner-arrow" aria-hidden="true">→</span>
    </a>
  );
}
