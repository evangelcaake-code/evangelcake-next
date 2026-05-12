import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Sobre nosotros — EvangelCake | Andreia & Tiago Evangelista",
  description:
    "Conoce a Andreia y Tiago: madre e hijo, 23 años de tradición brasileña detrás de las tartas personalizadas de EvangelCake en Zaragoza.",
  alternates: { canonical: "/sobre-nosotros" },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Sobre nosotros — EvangelCake Zaragoza",
  description:
    "Andreia Evangelista, pastelera con 20 años de oficio, y su hijo Tiago fundaron EvangelCake en Zaragoza. Madre e hijo, una historia entre Brasil y España.",
  url: "https://evangelcake.com/sobre-nosotros/",
  mainEntity: {
    "@type": "Organization",
    name: "EvangelCake",
    url: "https://evangelcake.com",
    logo: "https://evangelcake.com/images/logo.png",
    foundingDate: "2024",
    founder: [
      {
        "@type": "Person",
        name: "Andreia Evangelista",
        jobTitle: "Fundadora y Pastelera",
        description:
          "Pastelera profesional con 20 años de oficio. Sabor brasileño y dominio del chantilly.",
      },
      {
        "@type": "Person",
        name: "Tiago Evangelista",
        jobTitle: "Co-fundador",
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Paseo María Agustín 13",
      addressLocality: "Zaragoza",
      postalCode: "50004",
      addressCountry: "ES",
    },
  },
};

export default function SobreNosotrosPage() {
  return (
    <>
      <Script
        id="about-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      <section className="hook hook-about-compact">
        <div className="hook-text">
          <span className="tag">Sobre nosotros</span>
          <h1>
            De Brasil
            <br />a Zaragoza,
            <br />
            <em>con amor.</em>
          </h1>
          <p className="lede">
            Madre e hijo. 23 años cruzando océanos. 20 años horneando en
            familia. Y un obrador en pleno centro.
          </p>
        </div>
        <div className="hook-pic hook-pic-photo">
          <span className="badge">Pº María Agustín 13</span>
          <Image
            src="/images/andreia-fachada.jpg"
            alt="Andreia Evangelista, fundadora de EvangelCake, en la puerta de la pastelería en Zaragoza"
            width={720}
            height={900}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              // 70% → muestra menos techo/arco de globos y centra más en Andreia
              objectPosition: "center 70%",
            }}
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
        className="section"
        style={{ background: "var(--paper-2)", paddingTop: 48 }}
      >
        <div
          className="section-head"
          style={{
            justifyContent: "center",
            textAlign: "center",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <span className="tag">La historia</span>
          <h2 style={{ maxWidth: "none" }}>
            Todo empezó <em>con un cumpleaños.</em>
          </h2>
        </div>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            fontSize: 18,
            lineHeight: 1.7,
            color: "var(--ink-2)",
          }}
        >
          <p>
            En Brasil, los cumpleaños son una celebración grande. Familia,
            amigos, música… y la tarta en el centro de todo.
          </p>
          <p>
            Cuando mi hijo Tiago cumplió un año, busqué por toda Zaragoza la
            tarta perfecta. No la encontré. Así que decidí hacerla yo misma.
          </p>
          <p>
            Cada año, durante 20 años, le hice su tarta de cumpleaños. Sus
            amigos probaban. Mis amigos pedían. Y poco a poco, aquellas tartas
            caseras se convirtieron en algo más.
          </p>
          <p>Me formé. Aprendí. Perfeccioné cada receta.</p>
          <p>
            Hasta que un día, Tiago me dijo:{" "}
            <em style={{ color: "var(--pink-deep)" }}>
              “Mamá, tienes que abrir una pastelería. La gente necesita probar
              tus tartas.”
            </em>
          </p>
          <p>
            <strong>Y aquí estamos.</strong>
          </p>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 28,
              lineHeight: 1.3,
              color: "var(--ink)",
              marginTop: 32,
            }}
          >
            EvangelCake no es solo una pastelería. Es 23 años de tradición
            brasileña en el corazón de Zaragoza. Es una madre y su hijo,
            trabajando juntos.
          </p>
          <p
            style={{
              fontFamily: "var(--script)",
              fontSize: 42,
              color: "var(--gold-deep)",
              textAlign: "center",
              marginTop: 48,
              lineHeight: 1,
            }}
          >
            Andreia &amp; Tiago
          </p>
        </div>
      </section>

      <section
        className="section"
        aria-labelledby="time-title"
        style={{ paddingTop: 48, paddingBottom: 56 }}
      >
        <div
          className="section-head"
          style={{
            justifyContent: "center",
            textAlign: "center",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <span className="tag">Trayectoria</span>
          <h2 id="time-title" style={{ maxWidth: "none" }}>
            Pequeños pasos, <em>veinte años.</em>
          </h2>
        </div>
        <div className="timeline">
          <div className="item">
            <span className="y">2004</span>
            <h4>El primer cumpleaños</h4>
            <p>
              Tiago cumple un año. Andreia hace su primera tarta personalizada
              en casa.
            </p>
          </div>
          <div className="item">
            <span className="y">2014</span>
            <h4>Formación profesional</h4>
            <p>
              Cursos y talleres. Las recetas brasileñas se mezclan con técnicas
              europeas.
            </p>
          </div>
          <div className="item">
            <span className="y">2024</span>
            <h4>Abre EvangelCake</h4>
            <p>
              Tras dos años buscando local, abrimos en Pº María Agustín 13.
            </p>
          </div>
          <div className="item">
            <span className="y">2026</span>
            <h4>Hoy</h4>
            <p>
              +800 tartas al año. Madre e hijo. Un mismo objetivo: cuidar cada
              detalle.
            </p>
          </div>
        </div>
      </section>

      <section
        className="values"
        aria-labelledby="values-title"
        style={{ paddingTop: 56, paddingBottom: 56 }}
      >
        <div className="head" style={{ marginBottom: 32 }}>
          <h2 id="values-title">
            EvangelCake <em>en datos.</em>
          </h2>
          <p>
            Una pastelería en pleno centro de Zaragoza, con 20 años de oficio
            detrás y reconocida por la prensa local.
          </p>
        </div>
        <div className="grid">
          <div className="v">
            <div className="ic">♥</div>
            <h4>+800 tartas al año</h4>
            <p>
              Una tarta personalizada cada 11 horas, todas hechas a mano en
              nuestro obrador de Pº María Agustín 13, Zaragoza.
            </p>
          </div>
          <div className="v">
            <div className="ic">★</div>
            <h4>20 años de oficio</h4>
            <p>
              Andreia empezó en 2004 con la tarta del primer cumpleaños de
              Tiago. En 2024 abrimos el local en pleno centro.
            </p>
          </div>
          <div className="v">
            <div className="ic">⊕</div>
            <h4>En prensa y reseñas</h4>
            <p>
              El Heraldo, El Español y Aragón Digital nos han dedicado
              reportajes. 5 estrellas en Google.
            </p>
          </div>
        </div>
      </section>

    </>
  );
}
