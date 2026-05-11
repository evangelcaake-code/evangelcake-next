import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import Game from "@/components/Game";
import GameTeaserRank from "@/components/GameTeaserRank";
import HomeNewsletter from "@/components/HomeNewsletter";
import ReviewsCarousel, { ReviewsRating } from "@/components/ReviewsCarousel";

const bakerySchema = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: "EvangelCake",
  description:
    "Pastelería artesanal especializada en tartas personalizadas con tradición brasileña. Andreia y Tiago Evangelista, madre e hijo, creando tartas únicas en el corazón de Zaragoza.",
  image: "https://evangelcake.com/images/logo.png",
  logo: "https://evangelcake.com/images/logo.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Paseo María Agustín 13",
    addressLocality: "Zaragoza",
    addressRegion: "Aragón",
    postalCode: "50004",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "41.6503262",
    longitude: "-0.8892718",
  },
  telephone: "+34624131348",
  email: "hola@evangelcake.com",
  url: "https://evangelcake.com",
  priceRange: "€€",
  servesCuisine: ["Repostería Brasileña", "Pastelería Artesanal"],
  founder: [
    {
      "@type": "Person",
      name: "Andreia Evangelista",
      nationality: "Brazilian",
    },
    { "@type": "Person", name: "Tiago Evangelista" },
  ],
  sameAs: [
    "https://instagram.com/evangelcake",
    "https://instagram.com/evangelcake_andreia",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "14:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "17:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "14:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "47",
  },
};

const galleryHome: Array<{ src: string; alt: string; caption: string }> = [
  {
    src: "/images/home/andreia-tarta-frambuesa.jpg",
    alt: "Andreia con tarta de chantilly y frambuesas en EvangelCake Zaragoza",
    caption: "Andreia · Chantilly",
  },
  {
    src: "/images/home/cumple-unicornio.jpg",
    alt: "Tarta de cumpleaños unicornio-gato con drip rosa y arcoíris",
    caption: "Cumple · Unicornio",
  },
  {
    src: "/images/home/proceso-pisos.jpg",
    alt: "Montaje de pisos de bizcocho con rellenos de chocolate y frutos rojos",
    caption: "Proceso · Pisos",
  },
  {
    src: "/images/home/corazon-pistacho.jpg",
    alt: "Tarta corazón de chocolate con buttercream de pistacho artesanal",
    caption: "Corazón · Pistacho",
  },
  {
    src: "/images/home/primer-cumple-osito.jpg",
    alt: "Tarta primer cumpleaños azul con osito y estrellas doradas",
    caption: "Primer cumple",
  },
  {
    src: "/images/home/proceso-masa.jpg",
    alt: "Manos amasando masa artesanal en el obrador de EvangelCake",
    caption: "Proceso · Masa",
  },
  {
    src: "/images/home/cumple-dragon-ball.jpg",
    alt: "Tarta temática Dragon Ball Z con Goku en plateado y naranja",
    caption: "Dragon Ball",
  },
  {
    src: "/images/home/cookie-caramelo.jpg",
    alt: "Cookie artesanal partida con relleno de dulce de leche fundente",
    caption: "Cookie · Caramelo",
  },
];

const pressLinks = [
  {
    href: "https://www.elespanol.com/aragon/vivir/20241106/andreia-tiago-madre-hijo-pastelerias-bonitas-zaragoza-toque-brasileno/898910652_0.html",
    name: "El Español",
    nameEm: "Aragón",
    meta: "Reportaje · Nov 2024",
    quote:
      "«Andreia y Tiago, madre e hijo con una de las pastelerías más bonitas de Zaragoza»",
  },
  {
    href: "https://www.heraldo.es/noticias/gastronomia/2024/07/21/nueva-pasteleria-evangelcake-zaragoza-1749815.html",
    name: "Heraldo",
    nameEm: "de Aragón",
    meta: "Apertura · Jul 2024",
    quote: "«Nueva pastelería: EvangelCake llega a Zaragoza»",
  },
  {
    href: "https://www.heraldo.es/noticias/gastronomia/2025/07/29/pasteleria-evangelcake-minitartas-uauqsabor-1843138.html",
    name: "Heraldo",
    nameEm: "de Aragón",
    meta: "Reportaje · Jul 2025",
    quote:
      "«Las minitartas “Uau qué Sabor”, la nueva creación de EvangelCake»",
  },
  {
    href: "https://www.instagram.com/reel/C9ubNMHo9pl/",
    name: "Heraldo",
    nameEm: "de Aragón",
    meta: "Reel Instagram · 2024",
    quote:
      "«EvangelCake en redes: la historia que se cuela entre Brasil y Zaragoza»",
  },
  {
    href: "https://www.hoyaragon.es/articulo/gastrolike/nueva-ruta-dulce-zaragoza/20241004012640076100.html",
    name: "Hoy",
    nameEm: "Aragón",
    meta: "Gastrolike · Oct 2024",
    quote:
      "«EvangelCake, parada obligada en la nueva ruta dulce de Zaragoza»",
  },
];

function GoogleG({ size = 28 }: { size?: number }) {
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

export default function Home() {
  return (
    <>
      <Script
        id="bakery-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bakerySchema) }}
      />

      <section id="hero" className="hero" aria-labelledby="hero-title">
        <div className="hero-left">
          <span className="tag">
            Tartas Personalizadas · Zaragoza · Desde 2024
          </span>
          <h1 id="hero-title">
            Tu celebración,
            <br />
            un <em>recuerdo inolvidable.</em>
          </h1>
          <p className="lede">
            Pastelería artesanal con alma brasileña en el corazón de Zaragoza.
          </p>
          <div className="hero-ctas">
            <Link className="btn" href="/tartas-personalizadas#sabores">
              Pide tu tarta personalizada →
            </Link>
            <a className="btn btn-secondary" href="#productos">
              Ver catálogo
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="n">+800</div>
              <div className="l">Tartas al año</div>
            </div>
            <div className="hero-stat">
              <div className="n">5★</div>
              <div className="l">Reseñas Google</div>
            </div>
            <div className="hero-stat">
              <div className="n">20</div>
              <div className="l">Años de oficio</div>
            </div>
          </div>
        </div>
        <div className="hero-pic" aria-hidden="true">
          <div className="hero-blob" />
          <Image
            src="/images/mascot.png"
            alt="Mascota de EvangelCake — pastelería artesanal de tartas personalizadas en Zaragoza"
            width={560}
            height={700}
            priority
          />
          <span className="hero-sticker" aria-hidden="true">
            <span className="hero-sticker-line">★ Tartas ★</span>
            <span className="hero-sticker-line hero-sticker-big">
              Personalizadas
            </span>
            <span className="hero-sticker-line">a tu medida</span>
          </span>
          <div className="hero-pill p1">
            <div className="ic">★</div>
            <div>
              <b>Top 9 Zaragoza</b>
              <span>Aragón Digital</span>
            </div>
          </div>
          <div className="hero-pill p2">
            <div className="ic">✓</div>
            <div>
              <b>Entrega 24h</b>
              <span>Zaragoza centro</span>
            </div>
          </div>
          <div className="hero-pill p3">
            <div className="ic">♥</div>
            <div>
              <b>+800 clientes</b>
              <span>desde 2024</span>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>
            Tartas personalizadas <b>·</b> Hecho a mano <b>·</b> Zaragoza{" "}
            <b>·</b> Sin conservantes <b>·</b> Encargos a medida <b>·</b> Hecho
            con amor <b>·</b> Toque brasileño <b>·</b> Chantilly <b>·</b>{" "}
          </span>
          <span>
            Tartas personalizadas <b>·</b> Hecho a mano <b>·</b> Zaragoza{" "}
            <b>·</b> Sin conservantes <b>·</b> Encargos a medida <b>·</b> Hecho
            con amor <b>·</b> Toque brasileño <b>·</b> Chantilly <b>·</b>{" "}
          </span>
        </div>
      </div>

      <section
        id="productos"
        className="section"
        aria-labelledby="productos-title"
      >
        <div className="section-head">
          <h2 id="productos-title">
            Explora nuestras <em>especialidades.</em>
          </h2>
          <a
            className="link"
            href="https://wa.me/34624131348?text=Hola!%20Me%20gustar%C3%ADa%20conocer%20todo%20el%20cat%C3%A1logo"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver todo el catálogo →
          </a>
        </div>
        <div className="cards-grid">
          <a
            className="card"
            href="https://wa.me/34624131348?text=Hola!%20Quiero%20pedir%20presupuesto%20para%20una%20tarta%20personalizada"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="card-ph bg-pink">
              <span className="ct">Bajo pedido</span>
              <span className="em">T</span>
            </div>
            <h3>Tartas personalizadas</h3>
            <div className="arr">
              <span>Pedir presupuesto</span>
              <b>→</b>
            </div>
          </a>
          <a
            className="card"
            href="https://wa.me/34624131348?text=Hola!%20Quiero%20pedir%20una%20tarta%20de%20tres%20leches"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="card-ph bg-gold">
              <span className="ct">Especialidad BR</span>
              <span className="em">L</span>
            </div>
            <h3>Tres leches</h3>
            <div className="arr">
              <span>Encargar</span>
              <b>→</b>
            </div>
          </a>
          <a
            className="card"
            href="https://wa.me/34624131348?text=Hola!%20Hay%20bizcocho%20de%20zanahoria%20esta%20semana%3F"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="card-ph bg-rose">
              <span className="ct">Solo jueves</span>
              <span className="em">B</span>
            </div>
            <h3>Bizcocho zanahoria</h3>
            <div className="arr">
              <span>Reservar</span>
              <b>→</b>
            </div>
          </a>
          <a
            className="card"
            href="https://wa.me/34624131348?text=Hola!%20Qu%C3%A9%20sabores%20de%20Crumbl%20cookies%20ten%C3%A9is%20esta%20semana%3F"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="card-ph bg-blue">
              <span className="ct">Rotativo</span>
              <span className="em">C</span>
            </div>
            <h3>Crumbl cookies</h3>
            <div className="arr">
              <span>Ver sabores</span>
              <b>→</b>
            </div>
          </a>
        </div>
      </section>

      <section className="hook" aria-labelledby="hook-about">
        <div className="hook-text">
          <span className="tag">Sobre nosotros</span>
          <h2 id="hook-about">
            De Brasil
            <br />a Zaragoza,
            <br />
            <em>con amor.</em>
          </h2>
          <p className="lede">
            Madre e hijo. 20 años de oficio. Una historia que cruza océanos.
          </p>
          <div className="ctas">
            <Link className="btn" href="/sobre-nosotros">
              Conoce nuestra historia →
            </Link>
          </div>
        </div>
        <div className="hook-pic hook-pic-photo">
          <span className="badge">Andreia · fundadora</span>
          <Image
            src="/images/andreia-bienvenida.jpg"
            alt="Andreia Evangelista da la bienvenida en EvangelCake, pastelería de tartas personalizadas en Zaragoza"
            fill
            sizes="(max-width: 900px) 100vw, 720px"
            unoptimized
          />
          <div className="lab">
            <div className="av">A</div>
            <div>
              <b>Andreia Evangelista</b>
              <span>Pastelera · fundadora</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="prensa"
        className="section"
        style={{ background: "var(--paper-2)" }}
        aria-labelledby="press-title"
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
          <span className="tag alt">Han hablado de nosotros</span>
          <h2 id="press-title" style={{ maxWidth: "none" }}>
            Cuando la <em>prensa</em> nos descubre.
          </h2>
          <p
            className="section-sub"
            style={{
              textAlign: "center",
              maxWidth: "48ch",
              marginTop: 8,
            }}
          >
            El Heraldo, El Español y Hoy Aragón han contado nuestra historia.
          </p>
        </div>
        <div className="logo-wall">
          {pressLinks.map((p) => (
            <a
              key={p.href}
              className="logo"
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="name">
                {p.name} <em>{p.nameEm}</em>
              </span>
              <span className="meta">{p.meta}</span>
              <span className="quote">{p.quote}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="section reviews-wall" aria-labelledby="home-reviews-title">
        <div
          className="section-head"
          style={{
            justifyContent: "center",
            textAlign: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span className="tag">Reseñas Google</span>
          <h2 id="home-reviews-title" style={{ maxWidth: "none" }}>
            Lo que dicen <em>nuestros clientes.</em>
          </h2>
          <ReviewsRating />
        </div>

        <ReviewsCarousel />

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a
            className="btn btn-secondary"
            href="https://maps.app.goo.gl/hbjMMtPtFKKZngzJ6"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver más reseñas en Google →
          </a>
        </div>
      </section>

      <section
        id="galeria"
        className="section gallery-home-section"
        aria-labelledby="gal-title"
      >
        <div className="section-head">
          <div>
            <span className="tag">Trabajos recientes</span>
            <h2 id="gal-title">
              Manos que crean, <em>corazones que aman.</em>
            </h2>
          </div>
          <Link className="link" href="/galeria">
            Ver más tartas personalizadas →
          </Link>
        </div>
        <div className="gallery gallery-home">
          {galleryHome.map((p) => (
            <figure key={p.src} className="gallery-item tall">
              <Image
                src={p.src}
                alt={p.alt}
                width={600}
                height={750}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <figcaption className="gallery-label">{p.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section
        id="juego"
        className="section"
        aria-labelledby="game-teaser-title"
        style={{ padding: "64px 24px" }}
      >
        <div className="game-teaser">
          <div className="game-teaser-text">
            <span className="tag">Juego del mes</span>
            <h2 id="game-teaser-title">
              Atrapa, esquiva… <em>y gana una tarta.</em>
            </h2>
            <p>
              Juega a <strong>Dulci&apos;s Sweet Challenge</strong>, atrapa
              tartas, esquiva bombas. Los <strong>3 mejores del mes</strong> se
              llevan una tarta personalizada gratis.
            </p>
          </div>
          <Game embed />
          <GameTeaserRank />
        </div>
      </section>

      <section
        id="blog"
        className="section"
        style={{ background: "var(--paper-2)" }}
        aria-labelledby="blog-title"
      >
        <div className="section-head">
          <div>
            <span className="tag">Hoy aprende</span>
            <h2 id="blog-title">
              Historias dulces <em>del obrador.</em>
            </h2>
          </div>
          <Link className="link" href="/blog">
            Ver todos los posts →
          </Link>
        </div>
        <div className="cards-grid cols-3">
          <Link className="blog-card" href="/blog/bizcocho-zanahoria-brasil">
            <div className="blog-image bg-pink">
              <Image
                src="/images/blog/bizcocho-zanahoria-tia.jpg"
                alt="Bizcocho de zanahoria brasileño con cobertura de chocolate"
                width={400}
                height={250}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <span className="cat-tag">Tradición</span>
            </div>
            <div className="blog-content">
              <span className="meta">15 marzo 2025</span>
              <h3>El bizcocho de zanahoria de mi tía brasileña</h3>
              <span className="blog-link">Leer más →</span>
            </div>
          </Link>
          <Link
            className="blog-card"
            href="/blog/5-errores-tarta-personalizada"
          >
            <div className="blog-image bg-blue">
              <Image
                src="/images/home/corazon-pistacho.jpg"
                alt="Tarta de chocolate con pistacho hecha a mano"
                width={400}
                height={250}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  objectPosition: "center 50%",
                }}
              />
              <span className="cat-tag">Guía</span>
            </div>
            <div className="blog-content">
              <span className="meta">11 mayo 2026</span>
              <h3>
                5 errores al encargar una tarta personalizada (y cómo los
                evitamos)
              </h3>
              <span className="blog-link">Leer más →</span>
            </div>
          </Link>
          <Link className="blog-card" href="/blog/chantilly-vs-fondant">
            <div className="blog-image bg-pink">
              <Image
                src="/images/blog/tarta-rosas-chantilly.jpg"
                alt="Tarta de cumpleaños con rosas de chantilly"
                width={400}
                height={250}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  objectPosition: "60% 48%",
                }}
              />
              <span className="cat-tag">Filosofía</span>
            </div>
            <div className="blog-content">
              <span className="meta">1 octubre 2024</span>
              <h3>Por qué usamos chantilly y no fondant</h3>
              <span className="blog-link">Leer más →</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="hook reverse" aria-labelledby="hook-contact">
        <div className="hook-text">
          <span className="tag">Visítanos · Reseñas Google</span>
          <h2 id="hook-contact">
            En el corazón
            <br />
            de <em>Zaragoza.</em>
          </h2>
          <p className="lede">
            Pº María Agustín 13. Pleno centro. Te esperamos con un café y una
            tarta recién hecha.
          </p>

          <a
            className="reviews-card"
            href="https://maps.app.goo.gl/hbjMMtPtFKKZngzJ6"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver reseñas de EvangelCake en Google Maps"
          >
            <div className="reviews-card-top">
              <div className="g-logo" aria-hidden="true">
                <GoogleG size={28} />
              </div>
              <div className="reviews-card-meta">
                <strong>5,0</strong>
                <div className="stars" aria-hidden="true">
                  ★★★★★
                </div>
                <span className="reviews-count">+47 reseñas en Google</span>
              </div>
            </div>
            <p className="reviews-quote">
              «Las mejores tartas de Zaragoza. Decoración preciosa, sabor
              brutal y trato cercanísimo.»
            </p>
            <span className="reviews-cta">
              Ver todas las reseñas <span aria-hidden="true">→</span>
            </span>
          </a>

          <div className="ctas" style={{ marginTop: 18 }}>
            <Link className="btn" href="/contacto">
              Cómo llegar →
            </Link>
            <a
              className="btn btn-secondary"
              href="https://wa.me/34624131348?text=Hola!"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>
        <div
          className="hook-pic"
          style={{ background: "none", padding: 0 }}
        >
          <iframe
            src="https://www.google.com/maps?q=EvangelCake&ll=41.6503262,-0.8892718&z=17&output=embed"
            title="EvangelCake en Google Maps · Pº María Agustín 13, Zaragoza"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{
              width: "100%",
              height: "100%",
              minHeight: 520,
              border: 0,
              borderRadius: "var(--r-big)",
            }}
          />
        </div>
      </section>

      <HomeNewsletter />
    </>
  );
}
