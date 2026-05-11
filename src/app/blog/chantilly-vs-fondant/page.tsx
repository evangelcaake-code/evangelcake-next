import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

export const metadata: Metadata = {
  title:
    "Chantilly o fondant: por qué elegimos sabor antes que perfección | EvangelCake",
  description:
    "Por qué en EvangelCake todas las tartas personalizadas son siempre de chantilly fresco, nunca de fondant. La diferencia real entre los dos y por qué decidimos uno.",
  keywords: [
    "chantilly o fondant",
    "tartas chantilly zaragoza",
    "diferencia chantilly fondant",
    "tartas sin fondant",
    "evangelcake chantilly",
  ],
  alternates: { canonical: "/blog/chantilly-vs-fondant" },
  openGraph: {
    type: "article",
    url: "https://evangelcake.com/blog/chantilly-vs-fondant/",
    title:
      "Chantilly o fondant: por qué elegimos sabor antes que perfección",
    description:
      "Por qué en EvangelCake todas nuestras tartas personalizadas son siempre de chantilly fresco, nunca de fondant.",
    images: [
      {
        url: "https://evangelcake.com/images/blog/tarta-rosas-chantilly.jpg",
      },
    ],
    locale: "es_ES",
    publishedTime: "2024-10-01",
    authors: ["EvangelCake"],
    section: "Filosofía",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Chantilly o fondant: por qué elegimos sabor antes que perfección",
    description:
      "La diferencia real entre chantilly y fondant. Por qué decidimos no usar fondant en nuestras tartas personalizadas.",
    images: ["https://evangelcake.com/images/blog/tarta-rosas-chantilly.jpg"],
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "Chantilly o fondant: por qué elegimos sabor antes que perfección",
  description:
    "Por qué en EvangelCake todas nuestras tartas personalizadas son siempre de chantilly fresco, nunca de fondant.",
  image: "https://evangelcake.com/images/blog/tarta-rosas-chantilly.jpg",
  datePublished: "2024-10-01",
  dateModified: "2024-10-01",
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
    "@id": "https://evangelcake.com/blog/chantilly-vs-fondant/",
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
          <span>Chantilly vs Fondant</span>
        </nav>

        <header className="blog-article-head">
          <span className="cat-tag">Filosofía</span>
          <h1>
            Chantilly o fondant:
            <br />
            <em>por qué elegimos sabor antes que perfección.</em>
          </h1>
          <div className="blog-meta-row">
            <span>
              <strong>Andreia Evangelista</strong>
            </span>
            <span className="dot-sep">·</span>
            <span>1 octubre 2024</span>
            <span className="dot-sep">·</span>
            <span>5 min de lectura</span>
          </div>
        </header>

        <figure className="blog-hero-image">
          <Image
            src="/images/blog/tarta-rosas-chantilly.jpg"
            alt="Tarta de cumpleaños con rosas de chantilly rosa y placa Happy Birthday dorada — EvangelCake Zaragoza"
            width={1200}
            height={750}
            priority
            style={{ width: "100%", height: "auto" }}
          />
          <figcaption>
            Rosas modeladas con manga pastelera. Solo chantilly, cero fondant.
          </figcaption>
        </figure>

        <div className="blog-body">
          <p className="lead">
            Es la pregunta que más nos hacen cuando alguien entra al obrador por
            primera vez. <em>&quot;¿Y la decoración es de fondant?&quot;</em>.
            La respuesta siempre es la misma:{" "}
            <strong>no. Trabajamos solo con chantilly fresco.</strong> Y esta es
            la historia de por qué.
          </p>

          <h2>Qué es realmente el fondant</h2>

          <p>
            El fondant es una pasta de azúcar moldeable. Tiene textura plástica,
            se estira como masa, y permite hacer formas perfectas: pisos
            cuadrados con aristas rectas, figuras esculpidas, superficies
            completamente lisas que parecen porcelana.
          </p>

          <p>
            El problema es uno solo: es azúcar pura compactada. Cuando muerdes
            una tarta de fondant, la mayoría de la gente lo aparta y se come
            solo el bizcocho.
          </p>

          <h2>Qué es el chantilly (y por qué lo usamos)</h2>

          <p>
            El chantilly es nata fresca montada, ligeramente azucarada. Suave,
            ligera, fundente y se aplica sobre la tarta con manga pastelera para
            crear texturas reales: ondas, rosetones, brochazos artísticos.
          </p>

          <p>
            En Brasil, donde mi madre Andreia aprendió el oficio, el chantilly
            es lo normal. Nadie pide fondant. Las tartas de cumpleaños allí se
            valoran tanto por el sabor como por la presencia. Una tarta tiene
            que <strong>estar tan rica como bonita</strong>, o no es una buena
            tarta.
          </p>

          <h2>
            La gran diferencia: lo que tu invitado se lleva en el recuerdo
          </h2>

          <p>
            Cuando alguien come una de nuestras tartas en una boda o un
            cumpleaños y nos dice <em>&quot;oye, qué buena estaba&quot;</em>,
            esa frase vale más que cualquier reseña de cinco estrellas. Es lo
            que diferencia{" "}
            <strong>una tarta personalizada que se recuerda</strong> de una que
            solo se fotografía.
          </p>

          <p>
            Una tarta de fondant es una escultura comestible. Pero a la hora de
            la verdad, sigue siendo una escultura. Una tarta de chantilly es una
            experiencia. Tienes el visual <em>y</em> el sabor.
          </p>

          <h2>&quot;¿Pero entonces puedo tener el diseño bonito?&quot;</h2>

          <p>
            Sí, completamente. Cuando alguien viene al obrador con una idea —
            una tarta de Frozen para su hija, una tarta floral para su boda, un
            drip de chocolate con perlas doradas — pensamos en cómo lograrlo{" "}
            <strong>solo con chantilly</strong>. Y siempre, siempre se puede.
          </p>

          <p>
            Hacemos texturas con manga pastelera, decoraciones de flores
            naturales, drip glaseado, perlas, papeles comestibles, figuras de
            chocolate templado. El resultado son tartas que están <em>al
            nivel</em> de las de fondant en visual, pero que se comen enteras.
          </p>

          <p>
            Mira nuestra{" "}
            <Link href="/galeria">galería completa de tartas personalizadas</Link>{" "}
            — verás bodas, comuniones, cumples temáticos, todos elaborados con
            chantilly. Ninguno con fondant.
          </p>

          <h2>Nuestra filosofía en una frase</h2>

          <blockquote>
            <p>
              Que la tarta sea bonita por fuera, pero{" "}
              <em>inolvidable por dentro</em>. Porque el día se acaba, pero la
              tarta se recuerda.
            </p>
          </blockquote>

          <p>
            Por eso en EvangelCake todas las tartas personalizadas son de
            chantilly. Por eso usamos solo nata fresca (la montamos cada
            mañana). Por eso decimos que no al fondant aunque el cliente nos lo
            pida (le explicamos y casi siempre nos da la razón después de
            probar).
          </p>

          <p>
            No es un capricho de pastelería. Es una decisión consciente:{" "}
            <strong>
              preferimos que los invitados te digan que la tarta estaba rica
              antes que solo bonita
            </strong>
            .
          </p>

          <h2>Si te ha gustado esta filosofía</h2>

          <p>
            Y crees que tu celebración también merece una tarta que esté tan
            buena como bonita,{" "}
            <Link href="/tartas-personalizadas#sabores">
              configura tu tarta personalizada
            </Link>{" "}
            con nuestras opciones de bizcocho, relleno y cobertura. Todo
            chantilly, todo a mano, todo en Zaragoza.
          </p>
        </div>

        <aside className="blog-cta-end">
          <h3>¿Tu celebración merece una tarta así?</h3>
          <p>
            Diseña la tuya en 2 minutos: tamaño, bizcocho, relleno y cobertura.
            Cero fondant. 100% chantilly.
          </p>
          <div className="blog-cta-buttons">
            <Link
              className="btn btn-pink"
              href="/tartas-personalizadas#sabores"
            >
              Personalizar mi tarta →
            </Link>
            <a
              className="btn btn-secondary"
              href="https://wa.me/34624131348?text=Hola!%20He%20le%C3%ADdo%20el%20art%C3%ADculo%20sobre%20chantilly%20y%20quiero%20una%20tarta"
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
              href="/blog/bizcocho-zanahoria-brasil"
            >
              <span className="cat-tag">Tradición</span>
              <h4>El bizcocho de zanahoria de mi tía brasileña</h4>
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
