import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad — EvangelCake",
  description:
    "Política de privacidad de EvangelCake. Información sobre cómo tratamos tus datos personales conforme al RGPD.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <>
      <section className="legal-hero">
        <span className="tag">Privacidad</span>
        <h1>
          Política de <em>Privacidad.</em>
        </h1>
        <p className="lede">Última actualización: mayo de 2026</p>
      </section>

      <article className="legal-body">
        <p className="legal-intro">
          En EvangelCake nos tomamos muy en serio tu privacidad. Esta política
          explica de forma clara y transparente cómo tratamos tus datos
          personales conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley
          Orgánica 3/2018 de Protección de Datos Personales y Garantía de los
          Derechos Digitales (LOPDGDD).
        </p>

        <h2>1. Responsable del tratamiento</h2>
        <ul className="legal-list">
          <li>
            <strong>Responsable:</strong> Andreia Evangelista
          </li>
          <li>
            <strong>NIF:</strong> Disponible a solicitud del interesado en{" "}
            <a href="mailto:hola@evangelcake.com">hola@evangelcake.com</a>
          </li>
          <li>
            <strong>Domicilio:</strong> Paseo María Agustín 13, 50004 Zaragoza,
            España
          </li>
          <li>
            <strong>Correo electrónico:</strong>{" "}
            <a href="mailto:hola@evangelcake.com">hola@evangelcake.com</a>
          </li>
          <li>
            <strong>Teléfono:</strong>{" "}
            <a href="tel:+34624131348">+34 624 13 13 48</a>
          </li>
        </ul>

        <h2>2. Finalidad del tratamiento</h2>
        <p>
          Tratamos los datos personales que nos facilitas con las siguientes
          finalidades:
        </p>
        <ul className="legal-list">
          <li>
            <strong>Formulario de contacto:</strong> Atender tus consultas y
            responder a tus mensajes.
          </li>
          <li>
            <strong>Formulario de encargos:</strong> Gestionar tu solicitud de
            presupuesto y la elaboración de tu pedido.
          </li>
          <li>
            <strong>Newsletter:</strong> Enviarte recetas, novedades y ofertas
            exclusivas, siempre que hayas dado tu consentimiento.
          </li>
          <li>
            <strong>WhatsApp:</strong> Mantener una comunicación directa contigo
            cuando inicies tú el contacto.
          </li>
          <li>
            <strong>Cumplimiento de obligaciones legales:</strong> Facturación,
            gestión contable y obligaciones fiscales cuando proceda.
          </li>
        </ul>

        <h2>3. Legitimación</h2>
        <p>La base legal para el tratamiento de tus datos es:</p>
        <ul className="legal-list">
          <li>
            <strong>Consentimiento del interesado</strong> (art. 6.1.a RGPD)
            cuando rellenas un formulario o te suscribes a la newsletter.
          </li>
          <li>
            <strong>Ejecución de un contrato</strong> (art. 6.1.b RGPD) cuando
            realizas un encargo o pedido.
          </li>
          <li>
            <strong>Cumplimiento de obligaciones legales</strong> (art. 6.1.c
            RGPD) en materia fiscal y contable.
          </li>
        </ul>

        <h2>4. Plazo de conservación</h2>
        <p>
          Los datos personales se conservarán durante el tiempo necesario para
          cumplir con la finalidad para la que fueron recabados:
        </p>
        <ul className="legal-list">
          <li>
            <strong>Consultas y mensajes:</strong> hasta 1 año desde la última
            comunicación.
          </li>
          <li>
            <strong>Pedidos y encargos:</strong> durante la relación comercial y
            5 años después por obligaciones fiscales.
          </li>
          <li>
            <strong>Newsletter:</strong> hasta que retires tu consentimiento
            (puedes hacerlo en cualquier momento).
          </li>
        </ul>

        <h2>5. Destinatarios de los datos</h2>
        <p>
          Tus datos personales <strong>no se cederán a terceros</strong>, salvo:
        </p>
        <ul className="legal-list">
          <li>
            Cuando exista una obligación legal (Administración Tributaria,
            fuerzas y cuerpos de seguridad, jueces y tribunales).
          </li>
          <li>
            Encargados del tratamiento estrictamente necesarios para la
            prestación del servicio (proveedor de hosting{" "}
            <strong>Hostinger International Ltd.</strong>, plataforma de email
            marketing, gestoría) que actúan bajo nuestras instrucciones y
            conforme al RGPD.
          </li>
          <li>
            <strong>Google LLC (Google Analytics)</strong>, únicamente si has
            dado tu consentimiento expreso a las cookies analíticas. Los datos
            se procesan de forma agregada y anonimizada para análisis
            estadístico de uso del sitio web. Consulta la{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              política de privacidad de Google
            </a>{" "}
            y nuestra <Link href="/cookies">política de cookies</Link> para más
            detalle.
          </li>
        </ul>
        <p>
          Algunos proveedores (como Google) pueden realizar transferencias
          internacionales de datos fuera del Espacio Económico Europeo. En todos
          los casos, se garantiza un nivel adecuado de protección mediante
          cláusulas contractuales tipo aprobadas por la Comisión Europea u otras
          garantías previstas en el RGPD.
        </p>

        <h2>6. Derechos de los usuarios</h2>
        <p>Como interesado, tienes los siguientes derechos:</p>
        <ul className="legal-list">
          <li>
            <strong>Acceso:</strong> conocer qué datos personales tuyos
            tratamos.
          </li>
          <li>
            <strong>Rectificación:</strong> corregir datos inexactos o
            incompletos.
          </li>
          <li>
            <strong>Supresión (derecho al olvido):</strong> solicitar la
            eliminación de tus datos.
          </li>
          <li>
            <strong>Oposición:</strong> oponerte al tratamiento.
          </li>
          <li>
            <strong>Limitación:</strong> solicitar la limitación del tratamiento.
          </li>
          <li>
            <strong>Portabilidad:</strong> recibir tus datos en formato
            estructurado.
          </li>
          <li>
            <strong>Retirar el consentimiento:</strong> en cualquier momento,
            sin efectos retroactivos.
          </li>
        </ul>

        <h2>7. Cómo ejercer tus derechos</h2>
        <p>
          Puedes ejercer estos derechos enviando un correo electrónico a{" "}
          <a href="mailto:hola@evangelcake.com">hola@evangelcake.com</a>{" "}
          indicando:
        </p>
        <ul className="legal-list">
          <li>Tu nombre y apellidos</li>
          <li>Copia del DNI o documento que acredite tu identidad</li>
          <li>Derecho que deseas ejercer y motivo de la solicitud</li>
        </ul>
        <p>
          Responderemos en un plazo máximo de un mes desde la recepción de tu
          solicitud.
        </p>

        <h2>8. Reclamaciones ante la autoridad de control</h2>
        <p>
          Si consideras que el tratamiento de tus datos no se ajusta a la
          normativa, puedes presentar una reclamación ante la{" "}
          <strong>Agencia Española de Protección de Datos (AEPD)</strong>:
        </p>
        <ul className="legal-list">
          <li>
            Web:{" "}
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.aepd.es
            </a>
          </li>
          <li>Dirección: C/ Jorge Juan, 6, 28001 Madrid</li>
        </ul>

        <h2>9. Seguridad de los datos</h2>
        <p>
          Hemos implementado las medidas técnicas y organizativas apropiadas
          para garantizar la seguridad de tus datos personales y evitar su
          alteración, pérdida, tratamiento o acceso no autorizado.
        </p>

        <h2>10. Cambios en esta política</h2>
        <p>
          Nos reservamos el derecho a modificar esta Política de Privacidad para
          adaptarla a novedades legislativas o jurisprudenciales. Cualquier
          cambio será publicado en esta misma página.
        </p>

        <hr className="legal-hr" />

        <p className="legal-footer">
          © EvangelCake · Zaragoza · Documento válido desde mayo de 2026
        </p>
      </article>
    </>
  );
}
