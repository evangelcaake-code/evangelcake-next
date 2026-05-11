import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Diario del Obrador · Blog | EvangelCake Zaragoza",
  description:
    "Historias, recetas y consejos del obrador. Cómo trabajamos en EvangelCake, la pastelería de tartas personalizadas en Zaragoza con alma brasileña.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "https://evangelcake.com/blog/",
    title: "Diario del Obrador — EvangelCake Zaragoza",
    description:
      "Historias, recetas y consejos del obrador de EvangelCake en Zaragoza.",
    images: [
      {
        url: "https://evangelcake.com/images/home/andreia-tarta-frambuesa.jpg",
      },
    ],
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diario del Obrador · EvangelCake Zaragoza",
    description: "Historias, recetas y consejos del obrador.",
    images: [
      "https://evangelcake.com/images/home/andreia-tarta-frambuesa.jpg",
    ],
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Diario del Obrador — EvangelCake",
  description:
    "Historias, recetas y consejos del obrador de EvangelCake en Zaragoza.",
  url: "https://evangelcake.com/blog/",
  publisher: {
    "@type": "Bakery",
    name: "EvangelCake",
    url: "https://evangelcake.com",
    logo: "https://evangelcake.com/images/logo.png",
  },
};

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  read: string;
  category: string;
  image: string;
  imagePos?: string;
  imageBg?: string;
  imageAlt: string;
};

const posts: Post[] = [
  {
    slug: "chantilly-vs-fondant",
    title:
      "Chantilly o fondant: por qué elegimos sabor antes que perfección",
    excerpt:
      "Es la pregunta que más nos hacen en el obrador. Te contamos por qué en EvangelCake todas nuestras tartas personalizadas son siempre de chantilly fresco, nunca de fondant.",
    date: "1 octubre 2024",
    read: "5 min de lectura",
    category: "Filosofía",
    image: "/images/blog/tarta-rosas-chantilly.jpg",
    imagePos: "60% 48%",
    imageBg: "linear-gradient(160deg,var(--pink-soft),var(--gold))",
    imageAlt:
      "Tarta de cumpleaños con rosas de chantilly rosa y Happy Birthday dorado",
  },
  {
    slug: "bizcocho-zanahoria-brasil",
    title: "El bizcocho de zanahoria de mi tía brasileña",
    excerpt:
      "La receta familiar que cruzó 8.000 kilómetros desde Brasil hasta Zaragoza. Cada lunes, recién hecho en nuestro obrador.",
    date: "15 marzo 2025",
    read: "3 min de lectura",
    category: "Tradición",
    image: "/images/blog/bizcocho-zanahoria-tia.jpg",
    imageBg: "linear-gradient(160deg,#f4b8d0,#fbf3df)",
    imageAlt:
      "Bizcocho de zanahoria brasileño con cobertura de chocolate elaborado a mano en EvangelCake Zaragoza",
  },
  {
    slug: "5-errores-tarta-personalizada",
    title:
      "5 errores al encargar una tarta personalizada (y cómo los evitamos)",
    excerpt:
      "Los fallos más habituales cuando alguien pide una tarta personalizada — y cómo nos aseguramos en EvangelCake de que no te pasen a ti.",
    date: "11 mayo 2026",
    read: "4 min de lectura",
    category: "Guía",
    image: "/images/home/corazon-pistacho.jpg",
    imagePos: "center 50%",
    imageBg: "linear-gradient(160deg,#b8d0f4,#fce4ee)",
    imageAlt:
      "Tarta de chocolate con pistacho hecha a mano en el obrador de EvangelCake Zaragoza",
  },
];

export default function BlogPage() {
  return (
    <>
      <Script
        id="blog-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <section className="blog-hero">
        <div className="blog-hero-inner">
          <span className="tag">Diario del obrador</span>
          <h1>
            Historias dulces
            <br />
            <em>del obrador.</em>
          </h1>
          <p className="lede">
            Cómo hacemos las tartas, qué hemos aprendido en 20 años y por qué
            cada bizcocho tiene una historia detrás.
          </p>
        </div>
      </section>

      <section className="section blog-list-section">
        <div className="blog-list">
          {posts.map((p) => (
            <article key={p.slug} className="blog-post-card">
              <Link
                href={`/blog/${p.slug}`}
                className="blog-post-image"
                style={p.imageBg ? { background: p.imageBg } : undefined}
              >
                <Image
                  src={p.image}
                  alt={p.imageAlt}
                  width={800}
                  height={500}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: p.imagePos || "center",
                  }}
                />
                <span className="cat-tag">{p.category}</span>
              </Link>
              <div className="blog-post-meta">
                <span className="blog-post-date">{p.date}</span>
                <span className="blog-post-read">{p.read}</span>
              </div>
              <h2>
                <Link href={`/blog/${p.slug}`}>{p.title}</Link>
              </h2>
              <p>{p.excerpt}</p>
              <Link className="blog-post-link" href={`/blog/${p.slug}`}>
                Leer el artículo →
              </Link>
            </article>
          ))}
        </div>

        <div className="blog-soon">
          <span className="tag">Próximamente</span>
          <h3>Pronto subiremos más historias</h3>
          <p>
            Recetas, consejos para elegir tu tarta, tendencias para bodas y
            comuniones, errores frecuentes a evitar... Suscríbete a nuestra
            newsletter para no perdértelos.
          </p>
          <Link className="btn btn-pink" href="/#newsletter">
            Quiero recibirlos →
          </Link>
        </div>
      </section>
    </>
  );
}
