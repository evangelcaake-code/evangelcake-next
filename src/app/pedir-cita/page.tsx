import type { Metadata } from "next";
import PedirCitaWizard from "@/components/PedirCitaWizard";

export const metadata: Metadata = {
  title: "Pedir cita · Tartas personalizadas | EvangelCake",
  description:
    "Reserva tu cita en el obrador para diseñar tu tarta personalizada. Cata de bizcochos y rellenos, tiempo real para cerrarlo contigo — cumpleaños, bodas, comuniones y más.",
  alternates: { canonical: "/pedir-cita" },
  openGraph: {
    type: "website",
    url: "https://evangelcake.com/pedir-cita/",
    title: "Pedir cita · EvangelCake",
    description:
      "Reserva cita en el obrador para diseñar tu tarta personalizada. Cata, diseño y cierre en una sola visita.",
    locale: "es_ES",
  },
};

export default function PedirCitaPage() {
  return (
    <>
      <section className="section pc-hero" aria-labelledby="pc-title">
        <div className="pc-hero-inner">
          <span className="tag">Encargos con cita</span>
          <h1 id="pc-title" className="pc-hero-title">
            Reserva tu cita y encarga <em>tu tarta ideal</em>
          </h1>
          <p className="pc-hero-lede">
            A partir de ahora puedes encargar tu tarta con cita. Una atención exclusiva y VIP:
            vienes a probar nuestros bizcochos y rellenos, y diseñamos la tarta juntos, sin prisa.
            Es la forma de que cada tarta que sale de aquí sea la tarta de tus sueños.
          </p>
        </div>
      </section>

      <section className="section pc-howto" aria-label="Cómo va">
        <div className="pc-howto-grid">
          <article className="pc-howto-card">
            <span className="pc-howto-n">1.</span>
            <h3>Nos cuentas lo básico</h3>
            <p>Qué celebras, para cuántas personas y qué te apetece probar en la cata.</p>
          </article>
          <article className="pc-howto-card">
            <span className="pc-howto-n">2.</span>
            <h3>Eliges día y hora</h3>
            <p>Reservas hueco en el obrador para venir a probar y diseñar tu tarta.</p>
          </article>
          <article className="pc-howto-card">
            <span className="pc-howto-n">3.</span>
            <h3>Vienes, pruebas, encargas</h3>
            <p>Cata de bizcochos y rellenos, decides todo, y dejas una pequeña señal.</p>
          </article>
        </div>
      </section>

      <section className="section pc-wizard-section" aria-label="Formulario de reserva">
        <div className="pc-wizard-shell">
          <PedirCitaWizard />
        </div>
      </section>

      <section className="section pc-fallback" aria-label="Alternativas">
        <div className="pc-fallback-grid">
          <div className="pc-fallback-card">
            <h3>¿Prefieres encargar tu tarta por WhatsApp?</h3>
            <p>Sin problema — te leemos y te ayudamos con todo lo que necesites.</p>
            <a
              className="btn"
              href="https://wa.me/34624131348?text=Hola!%20Quiero%20pedir%20una%20cita%20para%20encargar%20una%20tarta"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#25d366" }}
            >
              Escribirnos por WhatsApp
            </a>
          </div>
          <div className="pc-fallback-card">
            <h3>¿Sólo quieres pasarte a por algo?</h3>
            <p>
              Para porciones, probar nuestros sabores, comprar tartas ya hechas o encargar
              una tarta más rápida <b>no necesitas cita</b>. Ven en horario de tienda.
            </p>
          </div>
        </div>

        <div className="pc-store">
          <div className="pc-store-info">
            <h3>Dónde estamos</h3>
            <p className="pc-store-address">
              Paseo María Agustín 13 · 50004 Zaragoza
            </p>
            <table className="pc-store-hours" aria-label="Horario de tienda">
              <tbody>
                {HORARIO.map((h) => (
                  <tr key={h.day} className={h.hours === "Cerrado" ? "closed" : undefined}>
                    <th scope="row">{h.day}</th>
                    <td>{h.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a
              className="btn btn-secondary pc-store-directions"
              href="https://www.google.com/maps/dir/?api=1&destination=EvangelCake%2C%20Paseo%20Mar%C3%ADa%20Agust%C3%ADn%2013%2C%20Zaragoza"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cómo llegar →
            </a>
          </div>
          <div className="pc-store-map">
            <iframe
              src="https://www.google.com/maps?q=EvangelCake%2C%20Paseo%20Mar%C3%ADa%20Agust%C3%ADn%2013%2C%20Zaragoza&output=embed"
              title="Mapa — EvangelCake, Paseo María Agustín 13, Zaragoza"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  );
}

// Horario de tienda — mismo que la ficha de Google Business.
// Si cambia el horario, actualízalo aquí y en Google Business a la vez.
const HORARIO = [
  { day: "Lunes", hours: "Cerrado" },
  { day: "Martes", hours: "10:00–14:00 · 18:00–20:00" },
  { day: "Miércoles", hours: "10:00–14:00" },
  { day: "Jueves", hours: "12:00–14:00 · 18:00–20:00" },
  { day: "Viernes", hours: "10:00–14:00" },
  { day: "Sábado", hours: "Solo entregas" },
  { day: "Domingo", hours: "Cerrado" },
];
