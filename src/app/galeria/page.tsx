import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import GalGridClient from "@/components/GalGridClient";

export const metadata: Metadata = {
  title: "Galería de Tartas · EvangelCake Zaragoza",
  description:
    "Galería de tartas personalizadas hechas a mano en Zaragoza. Bodas, comuniones, cumpleaños, aniversarios, temáticas y estilos vintage. Descubre el trabajo de Andreia y Tiago Evangelista.",
  keywords: [
    "galería tartas zaragoza",
    "tartas personalizadas fotos",
    "evangelcake galería",
    "tartas boda zaragoza",
    "tartas comunión zaragoza",
    "tartas cumpleaños zaragoza",
  ],
  alternates: { canonical: "/galeria" },
  openGraph: {
    type: "website",
    url: "https://evangelcake.com/galeria/",
    title: "Galería de Tartas — EvangelCake Zaragoza",
    description:
      "Bodas, comuniones, cumpleaños y diseños temáticos. Descubre el trabajo de Andreia y Tiago Evangelista en Zaragoza.",
    images: [
      {
        url: "https://evangelcake.com/images/gallery/comunion-zalome.jpg",
        alt: "Galería de tartas personalizadas en Zaragoza — EvangelCake",
      },
    ],
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Galería de Tartas Personalizadas · EvangelCake Zaragoza",
    description:
      "+50 tartas personalizadas hechas a mano en Zaragoza. Bodas, comuniones, cumpleaños y diseños temáticos por Andreia.",
    images: ["https://evangelcake.com/images/gallery/comunion-zalome.jpg"],
  },
};

const gallerySchema = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  name: "Galería de Tartas Personalizadas — EvangelCake Zaragoza",
  description:
    "Galería con más de 50 diseños de tartas personalizadas hechas a mano en Zaragoza: bodas, comuniones, bautizos, cumpleaños adultos e infantiles, estilos vintage y temáticos.",
  url: "https://evangelcake.com/galeria/",
  isPartOf: {
    "@type": "WebSite",
    name: "EvangelCake",
    url: "https://evangelcake.com",
  },
  about: {
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
};

type Photo = { src: string; alt: string; caption: string; wide?: boolean };

const bodas: Photo[] = [
  { src: "/images/gallery/boda-rosas.jpg", alt: "Tarta de boda con cobertura de chantilly y rosas blancas", caption: "Boda · Chantilly & rosas" },
  { src: "/images/gallery/boda-rosa-roja.jpg", alt: "Tarta blanca con rosa roja y perlas", caption: "Romántica · Rosa roja" },
  { src: "/images/gallery/corazon-eternidad.jpg", alt: "Tarta corazón blanca con piping vintage Por la Eternidad", caption: "Corazón · Por la Eternidad" },
  { src: "/images/gallery/aniversario-50.jpg", alt: "Tarta de aniversario en forma de número 50 con chocolate y plata", caption: "Aniversario · 50 años", wide: true },
  { src: "/images/gallery/drip-rojo-aniversario.jpg", alt: "Tarta drip roja con flor y donuts dorados Te Queremos", caption: "Drip rojo · Te queremos" },
  { src: "/images/gallery/drip-chocolate-frutas.jpg", alt: "Tarta drip de chocolate con fresas frambuesas y oro comestible", caption: "Drip chocolate · Frutas & oro" },
];

const comuniones: Photo[] = [
  { src: "/images/gallery/comunion-zalome.jpg", alt: "Tarta de comunión de dos pisos en tono rosa con figura, IHS y rosario", caption: "Comunión · Zalome" },
  { src: "/images/gallery/comunion-alma.jpg", alt: "Tarta de comunión rosa con rosetones y figura de niña", caption: "Comunión · Alma" },
  { src: "/images/gallery/comunion-azul.jpg", alt: "Tarta de comunión de dos pisos con flores azules y figura de niña", caption: "Comunión · Azul floral" },
  { src: "/images/gallery/bautizo-luis.jpg", alt: "Tarta de bautizo con osito caballito de balancín y nombre Luis", caption: "Bautizo · Luis" },
  { src: "/images/gallery/cumple-isabel-1ano.jpg", alt: "Tarta primer cumple ISABEL de dos pisos rosa con osito", caption: "1er cumple · Isabel" },
];

const cumplesAdultos: Photo[] = [
  { src: "/images/gallery/cumple-brochazos.jpg", alt: "Tarta de cumpleaños con brochazos rosas y rosas de chantilly", caption: "Pintura abstracta · Rosas" },
  { src: "/images/gallery/cumple-santorini.jpg", alt: "Tarta de cumpleaños inspirada en Santorini con rosas y casa azul", caption: "Temática · Santorini" },
  { src: "/images/gallery/cumple-telma.jpg", alt: "Tarta de cumpleaños vintage clásica con lazos negros estilo coquette", caption: "Vintage · Coquette · Telma" },
  { src: "/images/gallery/cumple-sirena.jpg", alt: "Tarta de cumpleaños con cola de sirena, conchas y perlas", caption: "Temática · Sirena" },
  { src: "/images/gallery/cumple-sharon.jpg", alt: "Tarta de cumpleaños pastel multicolor en rosa, azul y lila", caption: "Pastel · Multicolor" },
  { src: "/images/gallery/cumple-rosa-flor.jpg", alt: "Tarta rosa con rosa de tela y topper Feliz Cumpleaños", caption: "Rosa · Flor & topper" },
  { src: "/images/gallery/cumple-corazones-rojos.jpg", alt: "Tarta vintage blanca con corazones rojos y lazos rojos", caption: "Coquette · Corazones rojos" },
  { src: "/images/gallery/cumple-corazon-azul-22.jpg", alt: "Tarta corazón azul con perlas formando 22", caption: "Corazón azul · 22" },
  { src: "/images/gallery/cumple-corazon-lila.jpg", alt: "Tarta corazón lila con perlas mariposa y lazos negros", caption: "Corazón lila · Mariposa" },
  { src: "/images/gallery/cumple-mariposas-lila.jpg", alt: "Tarta lila con mariposas brillantes y rosetones", caption: "Lila · Mariposas" },
  { src: "/images/gallery/cumple-rosetones-noelia.jpg", alt: "Tarta rosa con rosetones y lazos rosas Noelia", caption: "Rosetones · Noelia" },
];

const tematicos: Photo[] = [
  { src: "/images/gallery/cumple-oh-shit.jpg", alt: "Tarta divertida con cara y piernas Oh shit Im 26", caption: "Humor · Oh shit I'm 26" },
  { src: "/images/gallery/cumple-estrella-negra.jpg", alt: "Tarta forma de estrella negra Feliz cumpleaños Alberto", caption: "Estrella negra · Alberto" },
  { src: "/images/gallery/cumple-zodiac-escorpio.jpg", alt: "Tarta corazón azul oscuro Scorpion Queen", caption: "Zodíaco · Escorpio" },
  { src: "/images/gallery/cumple-zodiac-sagitario.jpg", alt: "Tarta roja vintage Sagittarius Baby", caption: "Zodíaco · Sagitario" },
  { src: "/images/gallery/cumple-doctora.jpg", alt: "Tarta temática medicina con figura de doctora estetoscopio y electrocardiograma", caption: "Profesión · Doctora" },
  { src: "/images/gallery/cumple-policia.jpg", alt: "Tarta camisa Policía Nacional con escudo y nombre Paco", caption: "Profesión · Policía" },
  { src: "/images/gallery/cumple-sofia-donuts.jpg", alt: "Tarta drip blanca con donuts y flores Sofia 18", caption: "Drip · Donuts · Sofía 18" },
];

const infantiles: Photo[] = [
  { src: "/images/gallery/cumple-liam.jpg", alt: "Tarta infantil azul con osito y nubes Liam", caption: "Niño · Osito · Liam" },
  { src: "/images/gallery/cumple-minnie.jpg", alt: "Tarta de cumpleaños infantil con Minnie Mouse y rosetones rosas", caption: "Minnie Mouse · 2 años" },
  { src: "/images/gallery/cumple-minnie-anapaula.jpg", alt: "Tarta Minnie Mouse rosa con rosetones primer cumple Ana Paula", caption: "Minnie · Ana Paula · 1 año" },
  { src: "/images/gallery/cumple-mickey-mateo.jpg", alt: "Tarta infantil Mickey Mouse blanca con lunares de colores Mateo", caption: "Mickey Mouse · Mateo" },
  { src: "/images/gallery/cumple-marvel.jpg", alt: "Tarta de cumpleaños infantil con superhéroes Marvel y skyline urbano", caption: "Superhéroes · Marvel" },
  { src: "/images/gallery/cumple-frozen.jpg", alt: "Tarta azul Frozen con globos dorados y figura Elsa", caption: "Frozen · Elsa" },
  { src: "/images/gallery/cumple-osita-corona.jpg", alt: "Tarta naked cake chantilly con osita princesa rosa con corona", caption: "Osita princesa · Naked" },
  { src: "/images/gallery/cumple-osos-gemelos.jpg", alt: "Tarta rosa con dos ositos rosa y azul para gemelos", caption: "Ositos gemelos · Rosa & azul" },
  { src: "/images/gallery/cumple-real-madrid.jpg", alt: "Tarta Real Madrid con escudo y balones de fútbol Alberto 13", caption: "Real Madrid · Alberto" },
  { src: "/images/gallery/cumple-real-madrid-2.jpg", alt: "Tarta Real Madrid blanca con escudo y balones flotantes", caption: "Real Madrid · Balones" },
  { src: "/images/gallery/cumple-atletico-madrid.jpg", alt: "Tarta Atlético de Madrid de dos pisos con bota de fútbol Elias", caption: "Atlético Madrid · Elias" },
  { src: "/images/gallery/mascotas-dachshund.jpg", alt: "Tarta blanca con dachshund pintado perlas y gorrito de fiesta", caption: "Mascota · Dachshund" },
];

const especiales: Photo[] = [
  { src: "/images/gallery/vintage-lambeth.jpg", alt: "Tarta vintage estilo Lambeth toda blanca con piping y perlas", caption: "Vintage · Lambeth" },
  { src: "/images/gallery/vintage-blanco-lazos.jpg", alt: "Tarta vintage blanca clásica con lazos negros Happy Birthday", caption: "Vintage · Lazos negros" },
  { src: "/images/gallery/vintage-blanco-rosa.jpg", alt: "Tarta vintage blanca con piping y lazos rosas", caption: "Vintage · Lazos rosas" },
  { src: "/images/gallery/vintage-cream-rosetones.jpg", alt: "Tarta vintage cream con rosetones de chantilly y plato dorado", caption: "Vintage · Cream rosetones" },
  { src: "/images/gallery/vintage-roja-gelee.jpg", alt: "Tarta vintage roja con gelée de fresa y lazos rojos", caption: "Vintage · Gelée fresa" },
  { src: "/images/gallery/cumple-leopardo.jpg", alt: "Tarta corazón con animal print leopardo y lazos negros", caption: "Animal print · Leopardo" },
  { src: "/images/gallery/flamenca.jpg", alt: "Tarta temática con bailaora flamenca, lunares y guitarra", caption: "Temática · Flamenca" },
  { src: "/images/gallery/navidad-grinch.jpg", alt: "Tarta El Grinch verde con gorro de Papá Noel", caption: "Navidad · Grinch" },
];

// El grid con lightbox vive en GalGridClient (client component). Aquí solo
// re-exportamos el wrapper con el mismo nombre para no tocar el resto del JSX.
function GalGrid({ photos }: { photos: Photo[] }) {
  return <GalGridClient photos={photos} />;
}

export default function GaleriaPage() {
  return (
    <>
      <Script
        id="gallery-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gallerySchema) }}
      />

      <section className="gal-hero">
        <div className="gal-hero-text">
          <span className="tag">Galería · Trabajos Recientes</span>
          <h1>
            Cada tarta, <em>una historia.</em>
          </h1>
          <p className="lede">
            +50{" "}
            <strong>tartas personalizadas en Zaragoza</strong> hechas a mano.
            Bodas, comuniones, cumpleaños y diseños temáticos por Andreia.
          </p>
          <div className="gal-hero-meta">
            <span>
              <strong>50</strong> diseños
            </span>
            <span className="dot-sep">·</span>
            <span>7 categorías</span>
            <span className="dot-sep">·</span>
            <span>100% chantilly</span>
          </div>
        </div>
      </section>

      <nav className="gal-filters" aria-label="Categorías">
        <a href="#bodas" className="gal-chip">💍 Bodas &amp; Aniversarios</a>
        <a href="#comuniones" className="gal-chip">✝️ Comuniones &amp; Bautizos</a>
        <a href="#cumples-adultos" className="gal-chip">🎂 Cumples adultos</a>
        <a href="#tematicos" className="gal-chip">🌶️ Humor &amp; Temáticos</a>
        <a href="#cumples-infantiles" className="gal-chip">🧸 Cumples infantiles</a>
        <a href="#especiales" className="gal-chip">✨ Vintage &amp; Especiales</a>
        <a href="#obrador" className="gal-chip">👩‍🍳 El obrador</a>
      </nav>

      <section
        className="section gal-section"
        id="bodas"
        aria-labelledby="gal-bodas"
      >
        <div className="section-head">
          <h2 id="gal-bodas">
            Bodas &amp; <em>Aniversarios.</em>
          </h2>
          <p className="section-sub">
            Diseños románticos, elegantes y eternos para los días que se
            recuerdan toda la vida.
          </p>
        </div>
        <GalGrid photos={bodas} />
      </section>

      <section
        className="section gal-section gal-section-alt"
        id="comuniones"
        aria-labelledby="gal-comuniones"
      >
        <div className="section-head">
          <h2 id="gal-comuniones">
            Comuniones &amp; <em>Bautizos.</em>
          </h2>
          <p className="section-sub">
            Diseños románticos y delicados para los primeros grandes días.
          </p>
        </div>
        <GalGrid photos={comuniones} />
      </section>

      <section
        className="section gal-section"
        id="cumples-adultos"
        aria-labelledby="gal-adultos"
      >
        <div className="section-head">
          <h2 id="gal-adultos">
            Cumpleaños <em>adultos.</em>
          </h2>
          <p className="section-sub">
            Elegantes, románticos y llenos de detalle — tu cumpleaños, tu
            historia.
          </p>
        </div>
        <GalGrid photos={cumplesAdultos} />
      </section>

      <section
        className="section gal-section gal-section-alt"
        id="tematicos"
        aria-labelledby="gal-tematicos"
      >
        <div className="section-head">
          <h2 id="gal-tematicos">
            Humor &amp; <em>Temáticos.</em>
          </h2>
          <p className="section-sub">
            Profesiones, signos del zodiaco y tartas con personalidad propia.
          </p>
        </div>
        <GalGrid photos={tematicos} />
      </section>

      <section
        className="section gal-section"
        id="cumples-infantiles"
        aria-labelledby="gal-infantiles"
      >
        <div className="section-head">
          <h2 id="gal-infantiles">
            Cumples <em>infantiles.</em>
          </h2>
          <p className="section-sub">
            Su personaje, su hobby, su mundo. La tarta que harán suya.
          </p>
        </div>
        <GalGrid photos={infantiles} />
      </section>

      <section
        className="section gal-section gal-section-alt"
        id="especiales"
        aria-labelledby="gal-especiales"
      >
        <div className="section-head">
          <h2 id="gal-especiales">
            Vintage &amp; <em>Especiales.</em>
          </h2>
          <p className="section-sub">
            Técnicas clásicas, animal print, tematicas culturales y diseños
            fuera de lo común.
          </p>
        </div>
        <GalGrid photos={especiales} />
      </section>

      <section
        className="section gal-section gal-obrador"
        id="obrador"
        aria-labelledby="gal-obrador"
      >
        <div className="section-head">
          <h2 id="gal-obrador">
            El <em>obrador.</em>
          </h2>
          <p className="section-sub">
            Detrás de cada tarta hay 20 años de oficio. Andreia, en su elemento.
          </p>
        </div>
        <div className="gal-obrador-wrap">
          <figure className="gal-item gal-item-feature">
            <Image
              src="/images/gallery/andreia-obrador.jpg"
              alt="Andreia Evangelista, fundadora de EvangelCake, sosteniendo una tarta de Stitch en su obrador de Zaragoza"
              width={900}
              height={1100}
              loading="lazy"
              style={{ width: "100%", height: "auto" }}
            />
            <figcaption>
              <strong>Andreia Evangelista</strong>
              <span>Fundadora · Pastelera profesional · 20 años de oficio</span>
            </figcaption>
          </figure>
          <div className="gal-obrador-text">
            <p>
              Cada tarta sale de las manos de Andreia y Tiago. Sin moldes
              prefabricados. Sin atajos. Solo chantilly fresca, sabor brasileño
              y una idea que se convierte en celebración.
            </p>
            <Link className="btn btn-secondary" href="/sobre-nosotros">
              Conoce nuestra historia →
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
