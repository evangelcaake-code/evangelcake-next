import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title:
    "El bizcocho de zanahoria de mi tía brasileña | EvangelCake Zaragoza",
  description:
    "La receta familiar brasileña de bizcocho de zanahoria con chocolate que llega cada lunes al obrador de EvangelCake en Zaragoza. Un sabor que cruzó 8.000 kilómetros.",
  keywords: [
    "bizcocho zanahoria brasileño",
    "bolo de cenoura",
    "zanahoria con chocolate",
    "evangelcake zanahoria",
    "pasteleria brasileña zaragoza",
  ],
  alternates: { canonical: "/blog/bizcocho-zanahoria-brasil" },
  openGraph: {
    type: "article",
    url: "https://evangelcake.com/blog/bizcocho-zanahoria-brasil/",
    title: "El bizcocho de zanahoria de mi tía brasileña",
    description:
      "La receta familiar que cruzó el océano. Cada lunes, recién hecho en nuestro obrador de Zaragoza.",
    images: [
      {
        url: "https://evangelcake.com/images/blog/bizcocho-zanahoria-tia.jpg",
      },
    ],
    locale: "es_ES",
    publishedTime: "2025-03-15",
    authors: ["Andreia Evangelista"],
    section: "Tradición",
  },
  twitter: {
    card: "summary_large_image",
    title: "El bizcocho de zanahoria de mi tía brasileña",
    description: "La receta familiar que cruzó el océano hasta llegar a Zaragoza.",
    images: ["https://evangelcake.com/images/blog/bizcocho-zanahoria-tia.jpg"],
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "El bizcocho de zanahoria de mi tía brasileña",
  description:
    "La receta familiar brasileña de bizcocho de zanahoria con cobertura de chocolate que llega cada lunes al obrador de EvangelCake en Zaragoza.",
  image: "https://evangelcake.com/images/blog/bizcocho-zanahoria-tia.jpg",
  datePublished: "2025-03-15",
  dateModified: "2026-05-11",
  author: {
    "@type": "Person",
    name: "Andreia Evangelista",
    url: "https://evangelcake.com/sobre-nosotros/",
  },
  publisher: {
    "@type": "Bakery",
    name: "EvangelCake",
    logo: {
      "@type": "ImageObject",
      url: "https://evangelcake.com/images/logo.png",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://evangelcake.com/blog/bizcocho-zanahoria-brasil/",
  },
};

export default function Post() {
  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="blog-article">
        <nav className="blog-breadcrumb" aria-label="Migas de pan">
          <Link href="/">Inicio</Link> ·{" "}
          <Link href="/blog">Hoy aprende</Link> ·{" "}
          <span>Bizcocho de zanahoria brasileño</span>
        </nav>

        <header className="blog-article-head">
          <span className="cat-tag">Tradición</span>
          <h1>
            El bizcocho de zanahoria
            <br />
            <em>de mi tía brasileña.</em>
          </h1>
          <div className="blog-meta-row">
            <span>
              <strong>Andreia Evangelista</strong>
            </span>
            <span className="dot-sep">·</span>
            <span>15 marzo 2025</span>
            <span className="dot-sep">·</span>
            <span>3 min de lectura</span>
          </div>
        </header>

        <figure className="blog-hero-image">
          <Image
            src="/images/blog/bizcocho-zanahoria-tia.jpg"
            alt="Bizcocho de zanahoria brasileño con cobertura de chocolate — receta de familia, recién hecho en EvangelCake Zaragoza"
            width={1200}
            height={750}
            priority
            style={{ width: "100%", height: "auto" }}
          />
          <figcaption>
            Bolo de cenoura. Igual que lo hacían en casa. Cada lunes, en el
            obrador.
          </figcaption>
        </figure>

        <div className="blog-body">
          <p className="lead">
            Cuando yo era pequeña en Brasil, mi tía hacía este{" "}
            <strong>bizcocho de zanahoria con chocolate</strong> todos los
            domingos. Nada especial. Solo harina, huevos, zanahoria rallada a
            mano. Pero ese olor…
          </p>

          <h2>Ese olor llenaba toda la casa</h2>

          <p>
            Y de repente todos estábamos ahí. En la mesa. Sin tele. Sin prisa.
            Solo la familia. Y ese bizcocho en el centro.
          </p>

          <p>
            No era una receta sofisticada. Era <em>bolo de cenoura</em>, el
            bizcocho de zanahoria con cobertura de chocolate que todas las
            familias brasileñas hacen igual y cada una jura tener el suyo mejor.
            El de mi tía era el mejor, claro.
          </p>

          <h2>Pasaron los años</h2>

          <p>Crucé el océano. Dejé Brasil. Construí mi vida aquí, en Zaragoza.</p>

          <p>
            Pero nunca olvidé ese sabor. Ese olor. Esas mañanas con mi tía y mis
            primos alrededor de la mesa.
          </p>

          <h2>&quot;Mamá, necesitas traer esto a la pastelería&quot;</h2>

          <p>
            Eso me dijo Tiago un día.{" "}
            <em>
              &quot;Para que no se pierda. Para que otra gente sienta lo que tú
              sentías. Para que una tradición que nació en Brasil… viva aquí en
              Zaragoza.&quot;
            </em>
          </p>

          <p>
            Y tenía razón. Por eso, cuando abrimos EvangelCake en 2024, esta
            receta fue de las primeras que entró en la carta. No como un
            capricho. Como una promesa.
          </p>

          <h2>Y ahora… todos los lunes</h2>

          <p>
            Lo hacemos igual que lo hacía mi abuela. A 8.000 kilómetros de
            distancia. Pero con el mismo amor. Con las mismas manos. La
            zanahoria rallada en el momento, la cobertura de chocolate vertida
            cuando el bizcocho está aún tibio, la espera hasta que se enfría lo
            justo para cortar.
          </p>

          <blockquote>
            <p>
              No es solo un bizcocho. Es un pedazo de mi infancia que cruzó el
              océano. Y que ahora puede ser un pedazo de la tuya.
            </p>
          </blockquote>

          <NewsletterForm
            source="blog-zanahoria"
            eyebrow="Solo para ti"
            title="¿Quieres la receta de mi tía?"
            description="Te la mando entera al correo — cantidades exactas, trucos de mi tía y la cobertura de chocolate de la abuela. Y un 5% para tu primera tarta."
            buttonLabel="Mándame la receta →"
          />

          <h2>Cómo probarlo</h2>

          <p>
            Todos los lunes hay{" "}
            <strong>bolo de cenoura recién hecho</strong> en la vitrina del
            obrador — Pº María Agustín 13, Zaragoza. Suele acabarse a media
            tarde, así que mejor venir pronto.
          </p>

          <p>
            Y si quieres una{" "}
            <Link href="/tartas-personalizadas#sabores">
              tarta personalizada con bizcocho de zanahoria-chocolate brasileño
            </Link>
            , lo hacemos al tamaño que necesites — desde una pequeña para 4
            personas hasta una tarta de varios pisos para boda. Siempre con
            chantilly fresco, siempre a mano, siempre con esta receta.
          </p>
        </div>

        <aside className="blog-cta-end">
          <h3>¿Una tarta con sabor brasileño?</h3>
          <p>
            Bizcocho de zanahoria-chocolate, tres leches, vainilla con
            maracuyá… sabores que no encontrarás en otra pastelería de Zaragoza.
          </p>
          <div className="blog-cta-buttons">
            <Link
              className="btn btn-pink"
              href="/tartas-personalizadas#sabores"
            >
              Configurar mi tarta →
            </Link>
            <a
              className="btn btn-secondary"
              href="https://wa.me/34624131348?text=Hola!%20Quiero%20una%20tarta%20con%20bizcocho%20de%20zanahoria"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp directo
            </a>
          </div>
        </aside>

        <aside className="blog-related">
          <h3>Sigue leyendo</h3>
          <div className="blog-related-grid">
            <Link
              className="blog-related-card"
              href="/blog/chantilly-vs-fondant"
            >
              <span className="cat-tag">Filosofía</span>
              <h4>
                Chantilly o fondant: por qué elegimos sabor antes que perfección
              </h4>
              <span className="blog-related-link">Leer →</span>
            </Link>
            <Link
              className="blog-related-card"
              href="/blog/5-errores-tarta-personalizada"
            >
              <span className="cat-tag">Guía</span>
              <h4>
                5 errores al encargar una tarta personalizada (y cómo los
                evitamos)
              </h4>
              <span className="blog-related-link">Leer →</span>
            </Link>
          </div>
        </aside>
      </article>
    </>
  );
}
