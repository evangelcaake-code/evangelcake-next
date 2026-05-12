import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import {
  PRODUCTS,
  getProduct,
  getCatalogProducts,
  type Product,
} from "@/data/products";
import OrderButton from "./OrderButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// TEMP: páginas individuales /encargos/[slug] desactivadas — devolvemos lista
// vacía para que Next no las pregenere y, en runtime, el componente abajo
// llama a notFound(). Para reactivar: vuelve al map original.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p || p.customPageUrl) {
    return { title: "Producto no encontrado", robots: { index: false } };
  }
  return {
    title: `${p.name} — EvangelCake Zaragoza`,
    description: p.shortDescription,
    alternates: { canonical: `/encargos/${p.slug}` },
    openGraph: {
      type: "website",
      url: `https://evangelcake.com/encargos/${p.slug}/`,
      title: `${p.name} — EvangelCake Zaragoza`,
      description: p.shortDescription,
      images: [{ url: `https://evangelcake.com${p.image}`, alt: p.imageAlt }],
      locale: "es_ES",
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name} — EvangelCake Zaragoza`,
      description: p.shortDescription,
      images: [`https://evangelcake.com${p.image}`],
    },
  };
}

function relatedProducts(current: Product): Product[] {
  return PRODUCTS.filter((p) => p.slug !== current.slug).slice(0, 3);
}

// TEMP: pon false para reactivar /encargos/[slug]
const DISABLED = true;

export default async function ProductPage({ params }: PageProps) {
  if (DISABLED) notFound();

  const { slug } = await params;
  const product = getProduct(slug);

  // Si el producto tiene una customPageUrl, esa es la canónica — esta
  // ruta /encargos/<slug> no debería existir. Devolvemos 404.
  if (!product || product.customPageUrl) {
    notFound();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.longDescription,
    image: `https://evangelcake.com${product.image}`,
    brand: { "@type": "Brand", name: "EvangelCake" },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Bakery", name: "EvangelCake" },
    },
  };

  const related = relatedProducts(product);

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <article className="product-detail">
        <nav className="blog-breadcrumb" aria-label="Migas de pan">
          <Link href="/">Inicio</Link> ·{" "}
          <Link href="/encargos">Catálogo</Link> · <span>{product.name}</span>
        </nav>

        <div className="product-hero">
          <div className="product-hero-img">
            <Image
              src={product.image}
              alt={product.imageAlt}
              width={1200}
              height={1200}
              priority
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {product.badge && (
              <span className="catalog-badge">{product.badge}</span>
            )}
          </div>

          <div className="product-hero-text">
            <span className="tag">Catálogo</span>
            <h1>{product.name}</h1>
            <p className="product-short">{product.shortDescription}</p>

            <div className="product-price-box">
              <span className="product-price-num">{product.price}</span>
              <span className="product-price-label">{product.availability}</span>
            </div>

            <p className="product-long">{product.longDescription}</p>

            {product.highlight && product.highlight.length > 0 && (
              <ul className="product-highlights">
                {product.highlight.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}

            <OrderButton
              productName={product.name}
              waText={product.waText}
            />

            <p className="product-foot">
              ¿Dudas? Visítanos en{" "}
              <Link href="/contacto">Pº María Agustín 13</Link> o escríbenos a{" "}
              <a href="mailto:hola@evangelcake.com">hola@evangelcake.com</a>.
            </p>
          </div>
        </div>

        {related.length > 0 && (
          <section className="product-related" aria-label="Otros productos">
            <h3>Otros productos del obrador</h3>
            <div className="catalog-grid catalog-grid-small">
              {related.map((p) => {
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
                        width={400}
                        height={400}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
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
          </section>
        )}
      </article>
    </>
  );
}
