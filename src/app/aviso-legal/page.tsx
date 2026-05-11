import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aviso Legal — EvangelCake",
  description:
    "Aviso legal de EvangelCake — Pastelería artesanal en Zaragoza. Información sobre el titular del sitio web y condiciones de uso.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/aviso-legal" },
};

export default function AvisoLegalPage() {
  return (
    <>
      <section className="legal-hero">
        <span className="tag">Información legal</span>
        <h1>
          Aviso <em>Legal.</em>
        </h1>
        <p className="lede">Última actualización: mayo de 2026</p>
      </section>

      <article className="legal-body">
        <h2>1. Información general</h2>
        <p>
          En cumplimiento de lo establecido en el artículo 10 de la Ley 34/2002,
          de 11 de julio, de Servicios de la Sociedad de la Información y de
          Comercio Electrónico (LSSI-CE), se informa de los siguientes datos
          identificativos del titular del sitio web{" "}
          <strong>evangelcake.com</strong>:
        </p>

        <ul className="legal-list">
          <li>
            <strong>Titular:</strong> Andreia Evangelista
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
          <li>
            <strong>Actividad:</strong> Pastelería artesanal y elaboración de
            tartas personalizadas
          </li>
        </ul>

        <h2>2. Objeto</h2>
        <p>
          El presente aviso legal regula el uso del sitio web evangelcake.com
          (en adelante, &quot;el Sitio Web&quot;), titularidad de EvangelCake.
          El acceso al Sitio Web atribuye la condición de Usuario, e implica la
          aceptación plena y sin reservas de todas las disposiciones incluidas
          en este Aviso Legal en la versión publicada en el momento del acceso.
        </p>

        <h2>3. Condiciones de uso</h2>
        <p>
          El Usuario se compromete a utilizar el Sitio Web, sus contenidos y
          servicios de conformidad con la ley, el presente Aviso Legal, las
          buenas costumbres y el orden público. Asimismo, se obliga a abstenerse
          de utilizar el Sitio Web con fines ilícitos o lesivos contra los
          derechos e intereses del titular o de terceros.
        </p>
        <p>
          Queda prohibido cualquier uso que pueda dañar, sobrecargar o
          deteriorar el Sitio Web o impedir su normal utilización por otros
          usuarios.
        </p>

        <h2>4. Propiedad intelectual e industrial</h2>
        <p>
          Todos los contenidos del Sitio Web (textos, fotografías, gráficos,
          imágenes, iconos, software, nombre comercial, marcas o logotipos) son
          propiedad exclusiva del titular o de terceros que han autorizado su
          uso. Queda expresamente prohibida la reproducción total o parcial sin
          la autorización previa y expresa del titular.
        </p>
        <p>
          El nombre <strong>&quot;EvangelCake&quot;</strong>, el logotipo y la
          mascota <em>Dulci</em> son marcas titularidad de EvangelCake y están
          protegidas por la legislación vigente en materia de propiedad
          intelectual e industrial.
        </p>

        <h2>5. Exclusión de garantías y responsabilidad</h2>
        <p>
          El titular del Sitio Web no se hace responsable de los daños y
          perjuicios de cualquier naturaleza que pudieran derivarse de la falta
          de disponibilidad o de continuidad del funcionamiento del Sitio Web,
          así como de los errores de transmisión, difusión, almacenamiento o
          entrega de los contenidos.
        </p>
        <p>
          El titular tampoco será responsable del uso indebido de la información
          contenida en el Sitio Web por parte del Usuario.
        </p>

        <h2>6. Enlaces a sitios de terceros</h2>
        <p>
          El Sitio Web puede contener enlaces a sitios web de terceros (Google
          Maps, Instagram, WhatsApp, etc.). El titular no se responsabiliza del
          contenido, exactitud o veracidad de la información de estos sitios
          externos, ni de las prácticas de privacidad que apliquen.
        </p>

        <h2>7. Política de privacidad y cookies</h2>
        <p>
          El tratamiento de datos personales se rige por la{" "}
          <Link href="/privacidad">Política de Privacidad</Link> y la{" "}
          <Link href="/cookies">Política de Cookies</Link>, que forman parte
          integrante del presente Aviso Legal.
        </p>

        <h2>8. Modificaciones</h2>
        <p>
          El titular se reserva el derecho a modificar el presente Aviso Legal
          en cualquier momento. Las modificaciones serán publicadas en el Sitio
          Web y entrarán en vigor desde el momento de su publicación.
        </p>

        <h2>9. Legislación aplicable y jurisdicción</h2>
        <p>
          El presente Aviso Legal se rige íntegramente por la legislación
          española. Para la resolución de cualquier conflicto que pudiera
          derivarse del acceso o uso del Sitio Web, las partes se someten a los
          Juzgados y Tribunales de Zaragoza, con renuncia expresa a cualquier
          otro fuero que pudiera corresponderles.
        </p>

        <hr className="legal-hr" />

        <p className="legal-footer">
          © EvangelCake · Zaragoza · Documento válido desde mayo de 2026
        </p>
      </article>
    </>
  );
}
