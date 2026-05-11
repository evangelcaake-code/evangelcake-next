import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import AskWidget from "@/components/AskWidget";
import CakeConfigurator from "@/components/CakeConfigurator";
import CakeModal, { OpenCakeModalButton } from "@/components/CakeModal";
import ReviewsCarousel from "@/components/ReviewsCarousel";

export const metadata: Metadata = {
  title:
    "Tartas Personalizadas Zaragoza · Hechas a Mano | EvangelCake",
  description:
    "Tartas personalizadas en Zaragoza, diseñadas y hechas a mano. Bodas, cumpleaños, bautizos. Chantilly, no fondant. Pº María Agustín 13.",
  keywords: [
    "tartas personalizadas zaragoza",
    "tartas chantilly zaragoza",
    "tartas bodas zaragoza",
    "tartas cumpleaños zaragoza",
    "tartas a medida",
    "evangelcake",
    "pastelería personalizada",
  ],
  alternates: { canonical: "/tartas-personalizadas" },
  openGraph: {
    type: "website",
    url: "https://evangelcake.com/tartas-personalizadas/",
    title: "Tartas Personalizadas Zaragoza — EvangelCake",
    description:
      "Tartas hechas a mano para tus momentos especiales. Bodas, cumpleaños, bautizos. Chantilly, sabor brasileño y diseño único.",
    images: [
      {
        url: "https://evangelcake.com/images/gallery/cumple-brochazos.jpg",
        alt: "Tarta personalizada de chantilly con brochazos rosas y rosas — EvangelCake Zaragoza",
      },
    ],
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Tartas Personalizadas Zaragoza · Hechas a Mano | EvangelCake",
    description:
      "Tartas personalizadas en Zaragoza, hechas a mano. Chantilly, no fondant. Configura tu tarta a medida y pide presupuesto.",
    images: ["https://evangelcake.com/images/gallery/cumple-brochazos.jpg"],
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Tartas Personalizadas Zaragoza",
  serviceType: "Pastelería personalizada",
  provider: {
    "@type": "Bakery",
    name: "EvangelCake",
    url: "https://evangelcake.com",
    telephone: "+34624131348",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Paseo María Agustín 13",
      addressLocality: "Zaragoza",
      postalCode: "50004",
      addressCountry: "ES",
    },
  },
  areaServed: { "@type": "City", name: "Zaragoza" },
  description:
    "Tartas personalizadas hechas a mano en Zaragoza para bodas, cumpleaños, bautizos, comuniones y eventos. Cobertura de chantilly, sabores brasileños y diseño 100% a medida. Presupuesto personalizado sin compromiso.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Con cuánta antelación tengo que pedir la tarta?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "El mínimo son 48 horas, pero te recomendamos pedirla con 1 semana de antelación para no quedarte sin hueco. Para bodas o eventos grandes (más de 30 personas) lo ideal son 3 a 4 semanas para poder reservar la fecha y diseñar bien tu tarta sin prisas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto cuesta una tarta personalizada?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "El precio depende del tamaño, la complejidad del diseño y los acabados. Tienes los precios desde en cada tamaño dentro del configurador. Para diseños más elaborados o eventos grandes te enviamos un presupuesto personalizado tras hablar contigo.",
      },
    },
    {
      "@type": "Question",
      name: "¿Tenéis opciones para alergias o intolerancias?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Sí. Hacemos tartas sin gluten, sin lactosa y sin azúcar bajo encargo. Avísanos al hacer tu pedido y nos adaptamos. Nota: nuestro obrador no es 100% libre de gluten, por lo que no podemos garantizar ausencia de trazas para celíacos estrictos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Hacéis envíos a domicilio en Zaragoza?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Sí, en Zaragoza ciudad bajo presupuesto, depende del tamaño y zona. Para tartas grandes o de varios pisos recomendamos recogerlas en el obrador, en Paseo María Agustín 13, para evitar movimientos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo y cuándo se paga la tarta?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Para reservar la fecha pedimos una señal del 50 por ciento. El resto se paga al recoger la tarta. Aceptamos efectivo, Bizum y transferencia bancaria.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo cambiar el diseño después de hacer el pedido?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Sí, podemos hacer modificaciones hasta 5 días antes del día de recogida. Cambios de fecha o número de raciones con menos antelación pueden no ser posibles dependiendo de nuestra agenda.",
      },
    },
  ],
};

const momentos = [
  { ic: "♥", t: "Bodas", d: "Tarta nupcial de varios pisos, decoración floral, sabor inolvidable para vuestro día." },
  { ic: "★", t: "Cumpleaños", d: "Infantiles temáticos o adultos elegantes. Tu personaje, tu hobby, tu historia." },
  { ic: "✦", t: "Eventos familiares", d: "Reuniones, aniversarios, despedidas o ese momento sin nombre que merece celebrarse en familia." },
  { ic: "⊕", t: "Bautizos", d: "Tartas dulces y delicadas en tonos pastel para celebrar la primera fiesta." },
  { ic: "✿", t: "Comuniones", d: "El día especial pide una tarta especial. Diseños románticos y a la medida." },
  { ic: "◆", t: "Baby shower", d: "Esperando al bebé con tartas tiernas en azul, rosa o sorpresa neutra." },
  { ic: "◉", t: "Eventos empresa", d: "Inauguraciones, aniversarios o regalo corporativo. Logo y branding incluidos." },
];

const proceso = [
  { n: 1, t: "Cuéntanos", d: "WhatsApp, email o ven al obrador. Comparte tu idea, fecha, número de personas e inspiración." },
  { n: 2, t: "Perfeccionamos tu idea", d: "Andreia la escucha, la mejora y la transforma. Desarrollamos juntos la idea hasta que la tarta sea perfecta." },
  { n: 3, t: "Confirmas con señal", d: "Cuando todo está claro, recibimos la señal que confirma tu pedido y reservamos la fecha." },
  { n: 4, t: "Elaboramos", d: "Andreia y Tiago la preparan a mano en el obrador. Sin atajos. Sin moldes prefabricados." },
  { n: 5, t: "Recoges en el local", d: "Pasas a recogerla por Pº María Agustín 13, lista para ser el centro de tu celebración." },
];

const galeriaTP = [
  { src: "/images/gallery/boda-rosas.jpg", alt: "Tarta de boda con cobertura de chantilly y rosas blancas", label: "Boda" },
  { src: "/images/gallery/comunion-alma.jpg", alt: "Tarta de comunión rosa con rosetones y figura de niña", label: "Comunión" },
  { src: "/images/gallery/cumple-brochazos.jpg", alt: "Tarta de cumpleaños con brochazos rosas y rosas de chantilly", label: "Cumple adulto" },
  { src: "/images/gallery/cumple-marvel.jpg", alt: "Tarta de cumpleaños infantil con superhéroes Marvel y skyline urbano", label: "Cumple infantil" },
];

const faqs = [
  {
    q: "¿Con cuánta antelación tengo que pedir la tarta?",
    body: (
      <p>
        El mínimo son <strong>48 horas</strong>, pero te recomendamos pedirla
        con <strong>1 semana de antelación</strong> para no quedarte sin hueco.
        Para bodas o eventos grandes (más de 30 personas) lo ideal son{" "}
        <strong>3–4 semanas</strong> para poder reservar la fecha y diseñar
        bien tu tarta sin prisas.
      </p>
    ),
  },
  {
    q: "¿Cuánto cuesta una tarta personalizada?",
    body: (
      <p>
        El precio depende del{" "}
        <strong>tamaño, la complejidad del diseño y los acabados</strong>.
        Tienes los precios &quot;desde&quot; en cada tamaño dentro del
        configurador. Para diseños más elaborados o eventos grandes te
        enviamos un presupuesto personalizado tras hablar contigo.
      </p>
    ),
  },
  {
    q: "¿Tenéis opciones para alergias o intolerancias?",
    body: (
      <p>
        Sí. Hacemos tartas{" "}
        <strong>sin gluten, sin lactosa y sin azúcar</strong> bajo encargo —
        avísanos al hacer tu pedido y nos adaptamos.{" "}
        <em>
          Nota: nuestro obrador no es 100% libre de gluten, por lo que no
          podemos garantizar ausencia de trazas para celíacos estrictos.
        </em>
      </p>
    ),
  },
  {
    q: "¿Hacéis envíos a domicilio?",
    body: (
      <p>
        Sí, en <strong>Zaragoza ciudad</strong> bajo presupuesto (depende del
        tamaño y zona). Para tartas grandes o de varios pisos recomendamos
        recogerlas en el obrador, en{" "}
        <Link href="/contacto">Pº María Agustín 13</Link>, para evitar
        movimientos.
      </p>
    ),
  },
  {
    q: "¿Cómo y cuándo se paga?",
    body: (
      <p>
        Para reservar la fecha pedimos una <strong>señal del 50%</strong>. El
        resto se paga al recoger la tarta. Aceptamos{" "}
        <strong>efectivo, Bizum y transferencia bancaria</strong>.
      </p>
    ),
  },
  {
    q: "¿Puedo cambiar el diseño después de hacer el pedido?",
    body: (
      <p>
        Sí, podemos hacer{" "}
        <strong>modificaciones hasta 5 días antes</strong> del día de
        recogida. Cambios de fecha o número de raciones con menos antelación
        pueden no ser posibles dependiendo de nuestra agenda.
      </p>
    ),
  },
];

export default function TartasPersonalizadasPage() {
  return (
    <>
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="tp-hero" aria-labelledby="tp-h1">
        <div className="tp-hero-bg" aria-hidden="true">
          <span className="blob b1" />
          <span className="blob b2" />
          <span className="blob b3" />
        </div>
        <div className="tp-hero-text">
          <span className="tag">Tartas Personalizadas · Zaragoza</span>
          <h1 id="tp-h1">
            La tarta de tu vida,
            <br />
            <em>la diseñas tú.</em>
          </h1>
          <p className="lede">
            <strong>Tartas personalizadas en Zaragoza</strong>, hechas a mano.
            Chantilly fresco, sabor brasileño y diseño que recordarás.
          </p>
          <div className="tp-hero-ctas">
            <OpenCakeModalButton>
              Personaliza tu tarta →
            </OpenCakeModalButton>
            <a className="btn btn-secondary" href="#galeria">
              Ver galería
            </a>
          </div>
          <a className="tp-hero-faqlink" href="#faq">
            <span className="tp-hero-faqicon" aria-hidden="true">💬</span>
            <span>
              ¿Tienes dudas antes de pedir?{" "}
              <strong>Resuélvelas aquí →</strong>
            </span>
          </a>
        </div>
        <div className="tp-hero-visual" aria-hidden="true">
          <Image
            src="/images/mascot.png"
            alt="Mascota de EvangelCake — tartas personalizadas hechas a mano en Zaragoza"
            width={560}
            height={700}
            priority
          />
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>
            Bodas <b>·</b> Cumpleaños <b>·</b> Bautizos <b>·</b> Comuniones{" "}
            <b>·</b> Baby shower <b>·</b> Despedidas <b>·</b> Empresa <b>·</b>{" "}
            Aniversarios <b>·</b>{" "}
          </span>
          <span>
            Bodas <b>·</b> Cumpleaños <b>·</b> Bautizos <b>·</b> Comuniones{" "}
            <b>·</b> Baby shower <b>·</b> Despedidas <b>·</b> Empresa <b>·</b>{" "}
            Aniversarios <b>·</b>{" "}
          </span>
        </div>
      </div>

      <section className="section" id="momentos" aria-labelledby="m-title">
        <div className="section-head">
          <h2 id="m-title">
            Para tu <em>momento.</em>
          </h2>
          <p className="section-sub">
            Cada celebración merece su tarta. Diseñamos la tuya.
          </p>
        </div>
        <div className="moments-grid">
          {momentos.map((m) => (
            <article key={m.t} className="moment">
              <div className="ic">{m.ic}</div>
              <h3>{m.t}</h3>
              <p>{m.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section tp-proc tp-proc-compact"
        aria-labelledby="p-title"
      >
        <div className="section-head section-head-compact">
          <h2 id="p-title">
            Cómo nace <em>tu tarta.</em>
          </h2>
          <p className="section-sub">
            De la idea al primer bocado, en 5 pasos.
          </p>
        </div>
        <div className="proc-timeline">
          {proceso.map((p) => (
            <div key={p.n} className="proc">
              <div className="dot">{p.n}</div>
              <h4>{p.t}</h4>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <CakeConfigurator />

      <section
        className="section tp-gallery tp-gallery-compact"
        id="galeria"
        aria-labelledby="g-title"
      >
        <div className="section-head section-head-tight">
          <h2 id="g-title">
            Algunas tartas <em>recientes.</em>
          </h2>
          <p className="section-sub">
            Una pequeña muestra. Tenemos +50 diseños en la galería completa.
          </p>
        </div>

        <div className="gallery tp-grid gallery-tp gallery-tp-compact">
          {galeriaTP.map((p) => (
            <figure key={p.src} className="gallery-item">
              <Image
                src={p.src}
                alt={p.alt}
                width={600}
                height={750}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <figcaption className="gallery-label">{p.label}</figcaption>
            </figure>
          ))}
        </div>

        <div className="tp-gallery-ctas">
          <Link className="btn btn-pink" href="/galeria">
            Ver galería completa →
          </Link>
          <a
            className="btn btn-secondary tp-ig-btn"
            href="https://instagram.com/evangelcake"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            @evangelcake
          </a>
        </div>
      </section>

      <section className="section tp-why" aria-labelledby="w-title">
        <div className="section-head">
          <h2 id="w-title">
            Tres razones para <em>confiar.</em>
          </h2>
        </div>
        <div className="why-grid">
          <div className="why">
            <span className="num">01</span>
            <h3>
              Chantilly, <span className="why-no">NO</span> fondant
            </h3>
            <p>
              Cobertura jugosa que se deshace en boca. La belleza también
              tiene que saber bien.
            </p>
          </div>
          <div className="why">
            <span className="num">02</span>
            <h3>Andreia te asesora</h3>
            <p>
              Tú nos cuentas tu idea. Andreia la escucha, la mejora y la
              transforma en algo mucho más bonito de lo que imaginabas.
            </p>
          </div>
          <div className="why">
            <span className="num">03</span>
            <h3>20 años de oficio</h3>
            <p>
              Pastelera profesional con dos décadas de tartas hechas. Sabor
              brasileño en cada bocado.
            </p>
          </div>
        </div>
      </section>

      <section className="section reviews-wall" aria-labelledby="t-title">
        <div
          className="section-head"
          style={{
            justifyContent: "center",
            textAlign: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span className="tag">Lo que dicen</span>
          <h2 id="t-title" style={{ maxWidth: "none" }}>
            Han confiado en <em>nosotros.</em>
          </h2>
        </div>

        <ReviewsCarousel />

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a
            className="btn"
            href="https://maps.app.goo.gl/hbjMMtPtFKKZngzJ6"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver más reseñas en Google →
          </a>
        </div>
      </section>

      <section
        className="section tp-faq"
        id="faq"
        aria-labelledby="faq-title"
      >
        <div className="section-head">
          <span className="tag">Preguntas frecuentes</span>
          <h2 id="faq-title">
            Resolvemos <em>tus dudas.</em>
          </h2>
          <p className="section-sub">
            Lo que más nos preguntan antes de hacer un pedido. ¿Te queda algo?
            Escríbenos por WhatsApp.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>
                <span>{f.q}</span>
                <span className="faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="faq-body">{f.body}</div>
            </details>
          ))}
        </div>

        <div className="ask-widget">
          <div className="ask-head">
            <span className="ask-icon" aria-hidden="true">💬</span>
            <h3>¿No has encontrado tu respuesta?</h3>
            <p>
              Escríbenos lo que necesites. Te responde Andreia o Tiago
              directamente.
            </p>
          </div>
          <AskWidget />
        </div>
      </section>

      <CakeModal />
    </>
  );
}
