import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

export const metadata: Metadata = {
  title:
    "5 errores al encargar una tarta personalizada (y cómo los evitamos) | EvangelCake Zaragoza",
  description:
    "Los 5 errores más comunes al encargar una tarta personalizada en Zaragoza — y cómo los evitamos en EvangelCake para que tu encargo salga perfecto.",
  keywords: [
    "errores tarta personalizada",
    "encargar tarta zaragoza",
    "tartas personalizadas zaragoza",
    "como pedir una tarta",
    "evangelcake guia",
  ],
  alternates: { canonical: "/blog/5-errores-tarta-personalizada" },
  openGraph: {
    type: "article",
    url: "https://evangelcake.com/blog/5-errores-tarta-personalizada/",
    title:
      "5 errores al encargar una tarta personalizada (y cómo los evitamos)",
    description:
      "Las trampas más habituales al encargar una tarta personalizada — y cómo en EvangelCake nos aseguramos de que no te pasen a ti.",
    images: [
      {
        url: "https://evangelcake.com/images/home/corazon-pistacho.jpg",
      },
    ],
    locale: "es_ES",
    publishedTime: "2026-05-11",
    authors: ["Andreia Evangelista"],
    section: "Guía",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "5 errores al encargar una tarta personalizada (y cómo los evitamos)",
    description:
      "Guía rápida de Andreia para que tu próxima tarta personalizada salga perfecta.",
    images: ["https://evangelcake.com/images/home/corazon-pistacho.jpg"],
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "5 errores al encargar una tarta personalizada (y cómo los evitamos)",
  description:
    "Los 5 errores más comunes al encargar una tarta personalizada en Zaragoza — y cómo los evitamos en EvangelCake.",
  image: "https://evangelcake.com/images/home/corazon-pistacho.jpg",
  datePublished: "2026-05-11",
  dateModified: "2026-05-11",
  author: {
    "@type": "Person",
    name: "Andreia Evangelista",
    url: "https://evangelcake.com/sobre-nosotros/",
  },
  publisher: {
    "@type": "Bakery",
    name: "EvangelCake",
    logo: {
      "@type": "ImageObject",
      url: "https://evangelcake.com/images/logo.png",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id":
      "https://evangelcake.com/blog/5-errores-tarta-personalizada/",
  },
};

export default function Post() {
  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="blog-article">
        <nav className="blog-breadcrumb" aria-label="Migas de pan">
          <Link href="/">Inicio</Link> ·{" "}
          <Link href="/blog">Hoy aprende</Link> ·{" "}
          <span>5 errores al encargar una tarta</span>
        </nav>

        <header className="blog-article-head">
          <span className="cat-tag">Guía</span>
          <h1>
            5 errores al encargar una tarta personalizada
            <br />
            <em>(y cómo los evitamos).</em>
          </h1>
          <div className="blog-meta-row">
            <span>
              <strong>Andreia Evangelista</strong>
            </span>
            <span className="dot-sep">·</span>
            <span>11 mayo 2026</span>
            <span className="dot-sep">·</span>
            <span>4 min de lectura</span>
          </div>
        </header>

        <figure className="blog-hero-image">
          <Image
            src="/images/blog/corazon-pistacho-tarta.jpg"
            alt="Tarta de chocolate en forma de corazón con cobertura de pistacho hecha a mano en EvangelCake Zaragoza"
            width={1200}
            height={750}
            priority
            style={{ width: "100%", height: "auto" }}
          />
          <figcaption>
            Una tarta como ésta no se hace con prisas. Y todo lo que viene
            después tampoco.
          </figcaption>
        </figure>

        <div className="blog-body">
          <p className="lead">
            Llevo veinte años haciendo tartas — primero para mi hijo Tiago,
            ahora para cientos de familias en Zaragoza — y hay historias que se
            repiten cada semana. Llamadas un viernes para una tarta el sábado.{" "}
            <em>&quot;Que sea bonita&quot;</em>, sin más. Una tarta para 15
            personas que solo da para 8. Estos son los cinco errores que más
            veo cuando alguien encarga una tarta personalizada. No los cuento
            para que te sientas mal si los has cometido — los cuento porque
            casi todos se evitan con cinco minutos de conversación al principio.
          </p>

          <h2>1 · Encargarla con prisa</h2>

          <p>
            Lo veo casi todas las semanas. Alguien llama un viernes a las seis
            de la tarde pidiendo una tarta elaborada para el sábado. Pero la
            realidad es que una tarta personalizada no se hornea en dos horas.
            El bizcocho necesita reposar para que se asiente. Si la tarta lleva
            flores modeladas o varios pisos, hay decoraciones que tardan días.
          </p>

          <p>
            Por eso aquí pedimos siempre un mínimo de 5 días — y para bodas,
            comuniones o diseños complejos, dos o tres semanas. No es una norma
            caprichosa. Es la única forma de que la tarta llegue exactamente
            como la imaginaste, sin atajos. Quien hace bien este oficio lo hace
            así.
          </p>

          <h2>2 · &quot;Que sea bonita&quot;</h2>

          <p>
            Es curioso lo que pasa cuando un cliente dice &quot;quiero algo
            bonito&quot; y se queda ahí. Cada persona tiene una imagen
            completamente distinta en la cabeza, y si nadie la pone en
            palabras, la pastelera acaba haciendo la suya. A veces sale bien
            por suerte. A veces alguien recoge la tarta y dice{" "}
            <em>&quot;yo me lo imaginaba diferente&quot;</em> — y para entonces
            ya es tarde.
          </p>

          <p>
            Por eso antes de empezar nos sentamos un rato (por WhatsApp vale) a
            poner nombre a las cosas: la ocasión, los colores exactos —{" "}
            <em>rosa empolvado</em> no es lo mismo que <em>rosa fucsia</em> —,
            el estilo, los elementos que tienen que estar sí o sí. Dos o tres
            fotos de referencia, no más, que con veinte nos despistamos. Que no
            quede nada en el aire.
          </p>

          <h2>3 · Olvidar el sabor</h2>

          <p>
            Lo que más me sorprende es la cantidad de gente que llega al final
            del proceso sin haber preguntado por los sabores. Se ha enamorado
            del diseño, ha escogido los colores, ha mandado fotos de Pinterest
            — y luego, ya con la tarta sobre la mesa, descubre que la sobrina
            es celíaca o que la abuela no come chocolate. La tarta más bonita
            es una decepción si nadie puede comerla.
          </p>

          <p>
            Por eso lo primero que pregunto cuando alguien escribe es por los
            sabores (
            <Link href="/tartas-personalizadas#sabores">
              los puedes ver aquí
            </Link>
            ). Tenemos opciones sin gluten — bizcocho de yuca, pan de queso
            brasileño — y los sabores estrella están claros: red velvet, tres
            leches, chocolate, vainilla. Y solo trabajamos con chantilly
            fresco, no con fondant.{" "}
            <Link href="/blog/chantilly-vs-fondant">
              De por qué lo hacemos así te cuento aquí
            </Link>
            , pero el resumen es éste: la tarta tiene que estar tan rica como
            bonita, o no merece la pena.
          </p>

          <h2>4 · No calcular bien las raciones</h2>

          <p>
            &quot;Una para 15 personas&quot; puede significar cosas muy
            distintas. Quince adultos que vienen después de una comilona no es
            lo mismo que quince niños en un cumple, ni que quince invitados de
            boda que ya han probado siete postres antes.
          </p>

          <p>
            Por eso siempre pregunto: cuántos sois, si hay niños pequeños, si
            es el único postre del día. Con eso te digo el tamaño justo. Y
            siempre con un poco de margen. Mejor que sobre un trozo bonito para
            el café del día siguiente que quedarte sin tarta en mitad del
            cumpleaños.
          </p>

          <h2>5 · No pensar en la recogida</h2>

          <p>
            El sábado por la mañana llega alguien a recoger su tarta y empieza
            la espiral de imprevistos: descubre que necesitaba traer una caja,
            no sabe cuánto tiempo antes sacarla de la nevera, no contaba con el
            coste de la entrega a domicilio. Todo lo que parecía sencillo se
            complica en los últimos diez metros — justo cuando ya no hay margen
            para improvisar.
          </p>

          <p>
            Por eso aquí la caja va incluida — siempre, y bonita. Al recoger te
            damos las instrucciones de conservación por escrito (cuánto tarda
            en atemperar, dónde guardarla). Si necesitas entrega a domicilio en
            Zaragoza, te confirmamos el coste exacto según zona antes de cerrar
            el pedido. Pagas en efectivo, tarjeta o Bizum.
          </p>

          <h2>El error que nadie cuenta</h2>

          <p>
            Hay un sexto error que no aparece en ninguna lista, y quizá es el
            que más caro sale: no atreverse a preguntar. Cambios de última
            hora, una alergia que se te olvidó mencionar, una fecha que se ha
            movido, un detalle del diseño que ya no te convence. Todo eso se
            resuelve escribiendo. Las pastelerías artesanales no somos máquinas
            — somos personas pequeñas detrás de la masa. Cuanto más hablas con
            nosotras, mejor sale la tarta. Así de sencillo.
          </p>

          <p>
            Una tarta personalizada bien encargada no debería darte estrés.
            Debería ser una de las cosas bonitas del evento — la que te
            apetece esperar.
          </p>

          <blockquote>
            <p>
              Una tarta perfecta empieza por una conversación tranquila. No por
              una llamada de pánico el viernes por la tarde.
            </p>
          </blockquote>
        </div>

        <aside className="blog-cta-end">
          <h3>Cómo pedirla bien (en 2 minutos)</h3>
          <p>
            Entra al configurador, elige sabor, tamaño y relleno. Te
            contestamos por WhatsApp con presupuesto, fecha y un resumen
            escrito. Sin sorpresas el día del evento.
          </p>
          <div className="blog-cta-buttons">
            <Link
              className="btn btn-pink"
              href="/tartas-personalizadas#sabores"
            >
              Configurar mi tarta →
            </Link>
            <a
              className="btn btn-secondary"
              href="https://wa.me/34624131348?text=Hola!%20Quiero%20encargar%20una%20tarta%20personalizada%20y%20quiero%20hacerlo%20bien"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </aside>

        <aside className="blog-related">
          <h3>Sigue leyendo</h3>
          <div className="blog-related-grid">
            <Link
              className="blog-related-card"
              href="/blog/chantilly-vs-fondant"
            >
              <span className="cat-tag">Filosofía</span>
              <h4>
                Chantilly o fondant: por qué elegimos sabor antes que perfección
              </h4>
              <span className="blog-related-link">Leer →</span>
            </Link>
            <Link
              className="blog-related-card"
              href="/blog/bizcocho-zanahoria-brasil"
            >
              <span className="cat-tag">Tradición</span>
              <h4>El bizcocho de zanahoria de mi tía brasileña</h4>
              <span className="blog-related-link">Leer →</span>
            </Link>
          </div>
        </aside>
      </article>
    </>
  );
}
