"use client";

/**
 * Grid de fotos de /galeria con lightbox.
 *
 * El caption de cada foto NO se muestra encima del thumbnail (taparía la
 * imagen). En su lugar, al pulsar el thumbnail se abre un overlay con la
 * imagen a tamaño completo y el caption como pie debajo.
 */
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export type GalPhoto = {
  src: string;
  alt: string;
  caption: string;
  wide?: boolean;
};

interface Props {
  photos: GalPhoto[];
}

export default function GalGridClient({ photos }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  // Navegación con teclado en el lightbox
  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? null : Math.min(photos.length - 1, i + 1)));
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? null : Math.max(0, i - 1)));
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, photos.length, close]);

  const current = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <div className="gal-grid gal-grid-3">
        {photos.map((p, i) => (
          <button
            type="button"
            key={p.src}
            className={`gal-item gal-item-button${p.wide ? " gal-item-wide" : ""}`}
            onClick={() => setOpenIndex(i)}
            aria-label={`Ampliar ${p.caption}`}
          >
            <Image
              src={p.src}
              alt={p.alt}
              width={800}
              height={1000}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </button>
        ))}
      </div>

      {current && (
        <div
          className="gal-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.caption}
          onClick={close}
        >
          <button
            type="button"
            className="gal-lightbox-close"
            onClick={close}
            aria-label="Cerrar"
          >
            ✕
          </button>

          {openIndex !== null && openIndex > 0 && (
            <button
              type="button"
              className="gal-lightbox-nav gal-lightbox-prev"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((i) => (i === null ? null : Math.max(0, i - 1)));
              }}
              aria-label="Anterior"
            >
              ‹
            </button>
          )}
          {openIndex !== null && openIndex < photos.length - 1 && (
            <button
              type="button"
              className="gal-lightbox-nav gal-lightbox-next"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((i) => (i === null ? null : Math.min(photos.length - 1, i + 1)));
              }}
              aria-label="Siguiente"
            >
              ›
            </button>
          )}

          <figure
            className="gal-lightbox-figure"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.src}
              alt={current.alt}
              width={1600}
              height={2000}
              priority
              style={{
                maxWidth: "100%",
                maxHeight: "calc(100vh - 120px)",
                width: "auto",
                height: "auto",
                display: "block",
                margin: "0 auto",
                borderRadius: 12,
                background: "var(--paper-2)",
              }}
            />
            <figcaption className="gal-lightbox-caption">
              {current.caption}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
