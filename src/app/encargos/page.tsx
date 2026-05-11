import type { Metadata } from "next";
import Script from "next/script";
import EncargoForm from "@/components/EncargoForm";

export const metadata: Metadata = {
  title:
    "Encargos a medida — EvangelCake | Tartas Personalizadas Zaragoza",
  description:
    "Encarga tu tarta personalizada en Zaragoza. Bodas, cumpleaños, bautizos. Diseño 1:1 con cita previa. Andreia y Tiago Evangelista.",
  alternates: { canonical: "/encargos" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Encargos de Tartas Personalizadas a Medida — Zaragoza",
  serviceType: "Encargo de tarta personalizada",
  description:
    "Realiza tu encargo de tarta personalizada en Zaragoza. Bodas, comuniones, bautizos, cumpleaños y eventos. Diseño 100% a medida, chantilly fresco, sabor brasileño.",
  url: "https://evangelcake.com/encargos/",
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
};

const featureCardStyle: React.CSSProperties = {
  padding: 18,
  flexDirection: "row",
  alignItems: "center",
  gap: 14,
};
const featureIconStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 12,
  background: "var(--pink-soft)",
  color: "var(--pink-deep)",
  display: "grid",
  placeItems: "center",
  fontSize: 18,
  flexShrink: 0,
};

export default function EncargosPage() {
  return (
    <>
      <Script
        id="encargos-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <section
        className="hook"
        style={{ paddingTop: 96, alignItems: "start" }}
      >
        <div className="hook-text">
          <span className="tag">Encargos a medida</span>
          <h1>
            Tu tarta,
            <br />
            <em>a tu manera.</em>
          </h1>
          <p className="lede">
            <strong>Tartas personalizadas a medida en Zaragoza.</strong> Bodas,
            cumpleaños, bautizos o ese miércoles que merece celebrarse.
          </p>

          <div
            className="cards-grid cols-2"
            style={{ marginTop: 24, gap: 14 }}
          >
            <div className="card" style={featureCardStyle}>
              <div style={featureIconStyle}>★</div>
              <div>
                <b style={{ display: "block", fontSize: 14 }}>Diseño 1:1</b>
                <span style={{ fontSize: 12, color: "var(--ink-2)" }}>
                  Reunión y degustación
                </span>
              </div>
            </div>
            <div className="card" style={featureCardStyle}>
              <div style={featureIconStyle}>⏱</div>
              <div>
                <b style={{ display: "block", fontSize: 14 }}>Desde 7 días</b>
                <span style={{ fontSize: 12, color: "var(--ink-2)" }}>
                  De antelación
                </span>
              </div>
            </div>
            <div className="card" style={featureCardStyle}>
              <div style={featureIconStyle}>⊕</div>
              <div>
                <b style={{ display: "block", fontSize: 14 }}>Sin gluten</b>
                <span style={{ fontSize: 12, color: "var(--ink-2)" }}>
                  Opción disponible
                </span>
              </div>
            </div>
            <div className="card" style={featureCardStyle}>
              <div style={featureIconStyle}>↻</div>
              <div>
                <b style={{ display: "block", fontSize: 14 }}>
                  Entrega Zaragoza
                </b>
                <span style={{ fontSize: 12, color: "var(--ink-2)" }}>
                  Refrigerado 24h
                </span>
              </div>
            </div>
          </div>
        </div>

        <EncargoForm />
      </section>

      <section
        className="section"
        style={{ background: "var(--paper-2)" }}
        aria-labelledby="proc-title"
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
          <span className="tag">Proceso</span>
          <h2 id="proc-title" style={{ maxWidth: "none" }}>
            Cómo <em>trabajamos.</em>
          </h2>
        </div>
        <div className="timeline">
          <div className="item">
            <span className="y">01</span>
            <h4>Consulta</h4>
            <p>
              Cuéntanos tu evento, fecha, número de personas y la idea que
              tienes en mente.
            </p>
          </div>
          <div className="item">
            <span className="y">02</span>
            <h4>Diseño</h4>
            <p>
              Te enviamos opciones y bocetos hasta encontrar la tarta perfecta
              para ti.
            </p>
          </div>
          <div className="item">
            <span className="y">03</span>
            <h4>Confirmación</h4>
            <p>
              Reservamos tu fecha con un anticipo. Empezamos a preparar todo.
            </p>
          </div>
          <div className="item">
            <span className="y">04</span>
            <h4>Entrega</h4>
            <p>
              Recoge en el local o te la llevamos. Lista para ser el centro de
              tu celebración.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
