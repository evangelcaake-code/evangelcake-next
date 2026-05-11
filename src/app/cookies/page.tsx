import type { Metadata } from "next";
import ConfigureCookiesButton from "./ConfigureCookiesButton";

export const metadata: Metadata = {
  title: "Política de Cookies — EvangelCake",
  description:
    "Política de cookies de EvangelCake. Información sobre el uso de cookies y cómo gestionarlas.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <>
      <section className="legal-hero">
        <span className="tag">Cookies</span>
        <h1>
          Política de <em>Cookies.</em>
        </h1>
        <p className="lede">Última actualización: mayo de 2026</p>
      </section>

      <article className="legal-body">
        <p className="legal-intro">
          El sitio web evangelcake.com utiliza cookies para mejorar tu
          experiencia de navegación. A continuación te explicamos qué son las
          cookies, cuáles utilizamos y cómo puedes gestionarlas.
        </p>

        <h2>1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que se descargan en tu
          dispositivo (ordenador, móvil o tablet) cuando visitas un sitio web.
          Permiten al sitio recordar información sobre tu visita, como tu idioma
          preferido o tus preferencias de navegación.
        </p>

        <h2>2. Tipos de cookies que utilizamos</h2>

        <h3>2.1 Cookies técnicas (estrictamente necesarias)</h3>
        <p>
          Son imprescindibles para el funcionamiento del sitio web y no
          requieren tu consentimiento. Permiten la navegación, el uso de
          funciones básicas y el almacenamiento de tus preferencias de cookies.
        </p>

        <table className="legal-table">
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Finalidad</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>evangelcake_cookies</td>
              <td>Almacenar tus preferencias de cookies</td>
              <td>1 año</td>
            </tr>
          </tbody>
        </table>

        <h3>2.2 Cookies analíticas</h3>
        <p>
          Nos permiten conocer cómo interactúan los usuarios con el sitio web
          (páginas más visitadas, tiempo de permanencia, etc.) para mejorar la
          experiencia. <strong>Requieren tu consentimiento previo</strong> y
          solo se cargan si lo aceptas en el banner de cookies.
        </p>

        <p>
          Utilizamos <strong>Google Analytics 4</strong> con la IP anonimizada.
          Los datos se procesan de forma agregada y no permiten identificarte
          personalmente. Más información en la{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            política de privacidad de Google
          </a>
          .
        </p>

        <table className="legal-table">
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Proveedor</th>
              <th>Finalidad</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>_ga</td>
              <td>Google</td>
              <td>Distinguir usuarios</td>
              <td>2 años</td>
            </tr>
            <tr>
              <td>_ga_*</td>
              <td>Google</td>
              <td>Persistencia de sesión</td>
              <td>2 años</td>
            </tr>
          </tbody>
        </table>

        <h3>2.3 Cookies de terceros</h3>
        <p>
          Algunos servicios externos integrados en el sitio web pueden instalar
          sus propias cookies cuando interactúas con ellos:
        </p>
        <ul className="legal-list">
          <li>
            <strong>Google Maps:</strong> el mapa embebido en las páginas de
            contacto puede instalar cookies cuando lo cargas. Más información en
            la{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              política de privacidad de Google
            </a>
            .
          </li>
          <li>
            <strong>Instagram / WhatsApp:</strong> los enlaces a redes sociales
            no instalan cookies hasta que los pulses, en cuyo caso se aplican
            las políticas de cada plataforma.
          </li>
        </ul>

        <h2>3. Gestión de cookies</h2>
        <p>Puedes gestionar tus preferencias de cookies en cualquier momento:</p>

        <p style={{ margin: "20px 0" }}>
          <ConfigureCookiesButton />
        </p>

        <p>
          También puedes configurar o eliminar las cookies directamente desde tu
          navegador:
        </p>
        <ul className="legal-list">
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/es/kb/proteccion-mejorada-rastreo-firefox-escritorio"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
            >
              Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/es-es/microsoft-edge"
              target="_blank"
              rel="noopener noreferrer"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>

        <p>
          <strong>Aviso:</strong> si desactivas todas las cookies, algunas
          funcionalidades del sitio podrían no funcionar correctamente.
        </p>

        <h2>4. Cambios en la política de cookies</h2>
        <p>
          Esta política puede actualizarse en función de cambios legislativos o
          de nuestras prácticas. Te recomendamos revisarla periódicamente.
        </p>

        <h2>5. Contacto</h2>
        <p>
          Para cualquier consulta sobre esta política, puedes contactarnos en{" "}
          <a href="mailto:hola@evangelcake.com">hola@evangelcake.com</a>.
        </p>

        <hr className="legal-hr" />

        <p className="legal-footer">
          © EvangelCake · Zaragoza · Documento válido desde mayo de 2026
        </p>
      </article>
    </>
  );
}
