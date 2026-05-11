import type { Metadata } from "next";
import Script from "next/script";
import ContactFormCard from "@/components/ContactFormCard";
import ReviewsCarousel, { ReviewsRating } from "@/components/ReviewsCarousel";

export const metadata: Metadata = {
  title: "Contacto — EvangelCake | Zaragoza · Pº María Agustín 13",
  description:
    "Contacta con EvangelCake — tartas personalizadas en Zaragoza. WhatsApp, formulario, dirección y mapa. Pº María Agustín 13. +34 624 13 13 48.",
  alternates: { canonical: "/contacto" },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contacto — EvangelCake Zaragoza",
  description:
    "Datos de contacto, horarios, dirección y mapa de EvangelCake. Pastelería de tartas personalizadas en Paseo María Agustín 13, Zaragoza.",
  url: "https://evangelcake.com/contacto/",
  mainEntity: {
    "@type": "Bakery",
    name: "EvangelCake",
    image: "https://evangelcake.com/images/logo.png",
    url: "https://evangelcake.com",
    telephone: "+34624131348",
    email: "hola@evangelcake.com",
    priceRange: "€€",
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
      latitude: 41.6503262,
      longitude: -0.8892718,
    },
    areaServed: { "@type": "City", name: "Zaragoza" },
    sameAs: [
      "https://instagram.com/evangelcake",
      "https://wa.me/34624131348",
    ],
  },
};

export default function ContactoPage() {
  return (
    <>
      <Script
        id="contact-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />

      <section className="section" aria-labelledby="ct-title">
        <div
          className="section-head"
          style={{
            justifyContent: "center",
            textAlign: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span className="tag">Hablemos</span>
          <h1
            id="ct-title"
            style={{
              fontSize: "clamp(56px,8vw,120px)",
              lineHeight: 0.92,
              maxWidth: "none",
              textAlign: "center",
            }}
          >
            Estamos al otro lado
            <br />
            del <em>mostrador.</em>
          </h1>
          <p
            className="lede"
            style={{
              textAlign: "center",
              fontFamily: "var(--serif-2)",
              fontStyle: "italic",
              fontSize: 20,
              color: "var(--ink-2)",
              maxWidth: "42ch",
              marginTop: 18,
            }}
          >
            Cuéntanos tu duda, tu pedido o tu idea. Respondemos en menos de 24
            horas.
          </p>
        </div>
      </section>

      <div className="contact-body">
        <ContactFormCard />

        <div className="contact-info">
          <div className="contact-block">
            <div className="ic">📍</div>
            <div>
              <b>Visítanos</b>
              <div className="v">
                Paseo María Agustín 13
                <br />
                50004 Zaragoza
              </div>
            </div>
          </div>
          <div className="contact-block">
            <div className="ic">☎</div>
            <div>
              <b>WhatsApp</b>
              <div className="v">
                <a
                  href="https://wa.me/34624131348"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +34 624 13 13 48
                </a>
              </div>
            </div>
          </div>
          <div className="contact-block">
            <div className="ic">✉</div>
            <div>
              <b>Correo</b>
              <div className="v">
                <a href="mailto:hola@evangelcake.com">hola@evangelcake.com</a>
              </div>
            </div>
          </div>
          <div className="contact-block">
            <div className="ic">⏰</div>
            <div>
              <b>Horario</b>
              <div className="v">
                L–V · 9–14 · 17–20
                <br />
                Sáb · 10–14
              </div>
            </div>
          </div>
          <div className="contact-map">
            <iframe
              src="https://www.google.com/maps?q=EvangelCake&ll=41.6503262,-0.8892718&z=17&output=embed"
              title="EvangelCake en Google Maps · Pº María Agustín 13, Zaragoza"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <section
        className="section reviews-wall"
        aria-labelledby="reviews-title"
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
          <span className="tag">Reseñas Google</span>
          <h2 id="reviews-title" style={{ maxWidth: "none" }}>
            Lo que dicen <em>nuestros clientes.</em>
          </h2>
          <ReviewsRating />
        </div>

        <ReviewsCarousel />

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a
            className="btn"
            href="https://maps.app.goo.gl/hbjMMtPtFKKZngzJ6"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver todas las reseñas en Google →
          </a>
        </div>
      </section>

      <div style={{ height: 64 }} />
    </>
  );
}
