import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/data/products";

// TEMP: página /encargos desactivada temporalmente. Para reactivarla, borra
// el `notFound()` del body del componente y restaura los metadata robots.
export const metadata: Metadata = {
  title: "Página no encontrada · EvangelCake",
  robots: { index: false, follow: false },
};

const catalogSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Catálogo EvangelCake",
  itemListElement: PRODUCTS.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Product",
      name: p.name,
      description: p.shortDescription,
      image: `https://evangelcake.com${p.image}`,
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: p.price,
        },
        availability: "https://schema.org/InStock",
      },
    },
  })),
};

export default function EncargosCatalogoPage() {
  // TEMP: desactivado — quita esta línea para reactivar la página
  notFound();
  return (
    <>
      <Script
        id="catalog-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }}
      />

      <section
        className="section"
        aria-labelledby="catalog-title"
        style={{ paddingTop: 72, paddingBottom: 24 }}
      >
        <div
          className="section-head"
          style={{
            justifyContent: "center",
            textAlign: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span className="tag">Catálogo</span>
          <h1
            id="catalog-title"
            style={{
              fontSize: "clamp(48px, 6vw, 92px)",
              lineHeight: 1,
              maxWidth: "none",
              textAlign: "center",
            }}
          >
            Lo que <em>horneamos.</em>
          </h1>
          <p
            className="lede"
            style={{
              textAlign: "center",
              fontFamily: "var(--serif-2)",
              fontStyle: "italic",
              fontSize: 20,
              color: "var(--ink-2)",
              maxWidth: "48ch",
              marginTop: 18,
            }}
          >
            Tartas personalizadas, especialidades brasileñas y cookies XL al
            estilo Crumbl. Pídelo por WhatsApp o personalízalo a tu medida.
          </p>
        </div>
      </section>

      <section
        className="section catalog-section"
        aria-label="Productos del catálogo"
        style={{ paddingTop: 0, paddingBottom: 80 }}
      >
        <div className="catalog-grid">
          {PRODUCTS.map((p) => {
            const href = p.customPageUrl ?? `/encargos/${p.slug}`;
            return (
              <Link
                key={p.slug}
                href={href}
                className="catalog-card"
                aria-label={`Ver ${p.name}`}
              >
                <div
                  className={`catalog-card-img${p.cardColor ? ` catalog-card-${p.cardColor}` : ""}`}
                >
                  <Image
                    src={p.image}
                    alt={p.imageAlt}
                    width={600}
                    height={500}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {p.badge && (
                    <span className="catalog-badge">{p.badge}</span>
                  )}
                </div>
                <div className="catalog-card-body">
                  <h2>{p.name}</h2>
                  <p>{p.shortDescription}</p>
                  <div className="catalog-card-foot">
                    <span className="catalog-price">{p.price}</span>
                    <span className="catalog-cta">Ver más →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="catalog-extra">
          <p>
            ¿No encuentras lo que buscas? Tenemos más cosas en el obrador
            cada semana — desde minitartas hasta crepes brasileños.{" "}
            <a
              href="https://wa.me/34624131348?text=Hola!%20Me%20gustar%C3%ADa%20saber%20qu%C3%A9%20m%C3%A1s%20cosas%20hac%C3%A9is"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pregúntanos por WhatsApp →
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
