"use client";

import Script from "next/script";

/**
 * Feed de Instagram con el widget oficial de Behold.so. Sincroniza solo
 * con la cuenta @evangelcake — cuando publicamos en IG, aparece aquí
 * sin tocar nada.
 *
 * Feed ID configurado en Behold: C24vAwzkLN9Mcj2RBJua
 *
 * El widget es un custom element (web component). Tipado declarado abajo
 * para que TypeScript no se queje al usarlo en JSX.
 */

// Declaración del custom element para TypeScript
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "behold-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { "feed-id": string },
        HTMLElement
      >;
    }
  }
}

const FEED_ID = "C24vAwzkLN9Mcj2RBJua";

export default function BeholdInstagramFeed() {
  return (
    <>
      {/* Script del widget — solo se carga una vez */}
      <Script
        id="behold-widget-script"
        src="https://w.behold.so/widget.js"
        type="module"
        strategy="afterInteractive"
      />

      <section
        id="instagram"
        className="section ig-section"
        aria-labelledby="ig-title"
      >
        <div className="section-head ig-head">
          <div>
            <span className="tag">Síguenos en Instagram</span>
            <h2 id="ig-title">
              Lo último que <em>horneamos.</em>
            </h2>
            <p className="ig-handle">
              <a
                href="https://instagram.com/evangelcake"
                target="_blank"
                rel="noopener noreferrer"
              >
                @evangelcake
              </a>
              {" — pásate y dile hola"}
            </p>
          </div>
          <a
            className="btn btn-pink ig-follow-btn"
            href="https://instagram.com/evangelcake"
            target="_blank"
            rel="noopener noreferrer"
          >
            Seguir en Instagram →
          </a>
        </div>

        <div className="ig-behold-wrap">
          <behold-widget feed-id={FEED_ID} />
        </div>
      </section>
    </>
  );
}
