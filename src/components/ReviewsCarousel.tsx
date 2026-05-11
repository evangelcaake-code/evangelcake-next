"use client";

import { useEffect, useMemo, useState } from "react";

type Review = {
  initial: string;
  author: string;
  meta: string;
  when: string;
  text: string;
  localGuide?: boolean;
};

const REVIEWS: Review[] = [
  {
    initial: "A",
    author: "Ana Morales Callaghan",
    meta: "16 reseñas",
    when: "hace 3 meses",
    localGuide: true,
    text: "«Encargamos la tarta para el 18 cumpleaños de mi hija; Red Velvet con queso crema para 30-35 personas; un éxito!! Tarta suave y de muy buena calidad. Encantó a todo el mundo y la presencia tb muy bonita. No es barato pero para ocasiones especiales merece la pena.»",
  },
  {
    initial: "M",
    author: "Mihaela Geanina Toma",
    meta: "1 reseña · 1 foto",
    when: "hace 2 meses",
    text: "«Encargué una tarta de motos para mi hermano y quedó espectacular, hicieron la figura de un motorista y una moto en fondant que quedaron preciosas. En cuanto al bizcocho elegí el de chocolate con relleno de nutella y oreo, es lo más sabroso…»",
  },
  {
    initial: "a",
    author: "Anabel Ochoa",
    meta: "3 reseñas · 3 fotos",
    when: "hace 3 meses",
    text: "«Muy recomendable 👌 La tarta preciosa, el diseño espectacular tal como lo quería y mejor. Y el sabor exquisito 😋. Los invitados encantados.»",
  },
  {
    initial: "L",
    author: "LaBegui",
    meta: "16 reseñas · 1 foto",
    when: "hace 3 meses",
    text: "«Le pongo un 10!! En otro sitio me dejaron tirada sin tarta a 4 días del cumpleaños y ellos me solucionaron el problema, todo a mi gusto y sin ponerme pegas. El viernes a las 11 y media en punto tenía mi tarta…»",
  },
  {
    initial: "L",
    author: "Laura Quintero Osorio",
    meta: "5 reseñas · 6 fotos",
    when: "hace 3 meses",
    text: "«Primero resaltar la buena atención y disposición para asesorarnos, además de una torta espectacular, tanto en decoración, como en bizcocho y relleno. Muchas gracias por elaborarla tal cual como queríamos. Recomendados!!!»",
  },
  {
    initial: "N",
    author: "Nati Montesinos",
    meta: "54 reseñas · 118 fotos",
    when: "hace 9 meses",
    localGuide: true,
    text: "«Espectacular!!! Sus propietarios son encantadores, te tratan con mucha paciencia y amabilidad y te aconsejan y explican cada producto. Pedí dos postres para tomármelos en casa y estaban buenísimos…»",
  },
  {
    initial: "L",
    author: "Lei",
    meta: "2 reseñas",
    when: "hace 4 meses",
    text: "«La mejor tarta sin azúcar que he probado, y ya van muchas!! Se nota la calidad de los ingredientes, y el cariño que le ponen. El bizcocho era muy esponjoso y la nata deliciosa, y con fresas naturales, sin sabores artificiales…»",
  },
  {
    initial: "M",
    author: "Marisol Rivas",
    meta: "1 reseña",
    when: "hace 6 meses",
    text: "«Quedamos encantados con el lugar, habíamos pasado por la tienda para probar los \"wow que sabor\" y estaban tan ricos que decidimos pedir la tarta de nuestra boda. Estamos muy contentos con el resultado porque estaba muy rica y todos los invitados nos lo hicieron saber. Los recomiendo a ojos cerrados.»",
  },
];

function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

interface Props {
  autoplay?: number;
}

export default function ReviewsCarousel({ autoplay = 6000 }: Props) {
  const total = REVIEWS.length;
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1000 ? 2 : 3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, total - perView);
  const pageCount = maxIndex + 1;

  useEffect(() => {
    if (index > maxIndex) setIndex(maxIndex);
  }, [maxIndex, index]);

  useEffect(() => {
    if (!autoplay || paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1 > maxIndex ? 0 : i + 1));
    }, autoplay);
    return () => clearInterval(t);
  }, [autoplay, paused, maxIndex]);

  const offset = useMemo(
    () => -(index * (100 / perView)),
    [index, perView],
  );

  return (
    <div
      className="reviews-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="rc-viewport">
        <div
          className="rc-track"
          style={{ transform: `translateX(${offset}%)` }}
        >
          {REVIEWS.map((r, i) => (
            <article className="rc-card" key={i}>
              <div className="rc-head">
                <div className="rc-google">
                  <GoogleG size={20} />
                </div>
                <div className="rc-stars">★★★★★</div>
                <span className="rc-when">{r.when}</span>
              </div>
              <p className="rc-text">{r.text}</p>
              <div className="rc-author">
                <div className="rc-av">{r.initial}</div>
                <div className="rc-author-meta">
                  <b>{r.author}</b>
                  <span>
                    {r.localGuide && (
                      <span className="rc-badge">Local Guide</span>
                    )}
                    {r.localGuide ? " · " : ""}
                    {r.meta}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="rc-arrow rc-prev"
        aria-label="Reseña anterior"
        onClick={() => setIndex((i) => Math.max(0, i - 1))}
        disabled={index === 0}
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        className="rc-arrow rc-next"
        aria-label="Siguiente reseña"
        onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
        disabled={index >= maxIndex}
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <div className="rc-dots" aria-label="Selector de reseñas">
        {Array.from({ length: pageCount }, (_, i) => (
          <button
            key={i}
            type="button"
            className={i === index ? "active" : ""}
            onClick={() => setIndex(i)}
            aria-label={`Ir a reseña ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function ReviewsRating() {
  return (
    <div className="reviews-rating">
      <div className="g-logo" aria-hidden="true">
        <GoogleG size={32} />
      </div>
      <div>
        <div className="rating-row">
          <strong>5,0</strong>
          <span className="stars">★★★★★</span>
        </div>
        <span className="rating-count">+47 reseñas verificadas en Google</span>
      </div>
    </div>
  );
}
