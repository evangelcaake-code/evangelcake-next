import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Esta campaña ha terminado — EvangelCake",
  description:
    "El juego del mes ya se cerró y los ganadores tienen su tarta. Suscríbete a la newsletter o síguenos en Instagram para no perderte la próxima campaña.",
  // Mantenemos la ruta accesible (puede haber enlaces externos apuntando a
  // /game), pero no queremos que se indexe ahora que la campaña terminó.
  robots: { index: false, follow: true },
  alternates: { canonical: "/game" },
};

export default function GamePage() {
  return (
    <>
      <section className="legal-hero">
        <span className="tag">Campaña cerrada</span>
        <h1>
          Esta campaña <em>ha terminado.</em>
        </h1>
        <p className="lede">
          El juego del mes ya se cerró y los ganadores tienen su tarta en
          camino. La próxima campaña llegará pronto.
        </p>
      </section>

      <article className="legal-body">
        <p className="legal-intro">
          Gracias a todas las personas que jugaron, compartieron y nos
          escribieron durante <strong>Dulci&apos;s Sweet Challenge</strong>. Fue
          mucho más divertido de lo que esperábamos — y los ganadores ya tienen
          su tarta personalizada lista para soplar las velas.
        </p>

        <h2>¿Habrá otra?</h2>
        <p>
          Sí. Estamos preparando la siguiente campaña con más sorpresas. Para
          que no se te pase, lo más sencillo es{" "}
          <strong>apuntarte a nuestra newsletter</strong> (te avisamos por email
          el día que abra) o seguirnos en Instagram, donde lo contamos todo
          primero.
        </p>

        <p style={{ margin: "28px 0", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn" href="/#newsletter">
            Avísame por email →
          </Link>
          <a
            className="btn btn-secondary"
            href="https://instagram.com/evangelcake"
            target="_blank"
            rel="noopener noreferrer"
          >
            Síguenos en Instagram
          </a>
        </p>

        <h2>Mientras tanto…</h2>
        <p>
          Las tartas siguen saliendo del obrador cada día. Si quieres una para
          una ocasión especial, puedes{" "}
          <Link href="/tartas-personalizadas">pedir tu tarta personalizada</Link>{" "}
          o pasarte por <Link href="/galeria">la galería</Link> a ver lo último
          que hemos horneado. Y si te apetece leer un rato, en{" "}
          <Link href="/blog">Hoy aprende</Link> contamos historias del obrador y
          algún truco de pastelería.
        </p>

        <hr className="legal-hr" />

        <p className="legal-footer">
          Con cariño, Andreia y Tiago · EvangelCake · Zaragoza
        </p>
      </article>
    </>
  );
}
