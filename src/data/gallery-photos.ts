/**
 * Lista plana de todas las fotos de la galería, usada por:
 *  - /galeria (vía import)
 *  - DesignPicker (selector de diseño en el configurador)
 *
 * Mantener esta lista como única fuente de verdad: si se añaden/quitan fotos,
 * solo hay que editar aquí.
 */

export type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
  category: "boda" | "comunion" | "cumple-adulto" | "tematico" | "infantil" | "especial";
};

export const ALL_GALLERY_PHOTOS: GalleryPhoto[] = [
  // Bodas / aniversarios
  { src: "/images/gallery/boda-rosas.jpg", alt: "Tarta de boda con cobertura de chantilly y rosas blancas", caption: "Boda · Chantilly & rosas", category: "boda" },
  { src: "/images/gallery/boda-rosa-roja.jpg", alt: "Tarta blanca con rosa roja y perlas", caption: "Romántica · Rosa roja", category: "boda" },
  { src: "/images/gallery/corazon-eternidad.jpg", alt: "Tarta corazón blanca con piping vintage Por la Eternidad", caption: "Corazón · Por la Eternidad", category: "boda" },
  { src: "/images/gallery/drip-rojo-aniversario.jpg", alt: "Tarta drip roja con flor y donuts dorados Te Queremos", caption: "Drip rojo · Te queremos", category: "boda" },
  { src: "/images/gallery/drip-chocolate-frutas.jpg", alt: "Tarta drip de chocolate con fresas frambuesas y oro comestible", caption: "Drip chocolate · Frutas & oro", category: "boda" },

  // Comuniones / bautizos / primer cumple
  { src: "/images/gallery/comunion-zalome.jpg", alt: "Tarta de comunión de dos pisos en tono rosa con figura, IHS y rosario", caption: "Comunión · Zalome", category: "comunion" },
  { src: "/images/gallery/comunion-alma.jpg", alt: "Tarta de comunión rosa con rosetones y figura de niña", caption: "Comunión · Alma", category: "comunion" },
  { src: "/images/gallery/comunion-azul.jpg", alt: "Tarta de comunión de dos pisos con flores azules y figura de niña", caption: "Comunión · Azul floral", category: "comunion" },
  { src: "/images/gallery/bautizo-luis.jpg", alt: "Tarta de bautizo con osito caballito de balancín y nombre Luis", caption: "Bautizo · Luis", category: "comunion" },
  { src: "/images/gallery/cumple-isabel-1ano.jpg", alt: "Tarta primer cumple ISABEL de dos pisos rosa con osito", caption: "1er cumple · Isabel", category: "comunion" },

  // Cumples adultos
  { src: "/images/gallery/cumple-brochazos.jpg", alt: "Tarta de cumpleaños con brochazos rosas y rosas de chantilly", caption: "Pintura abstracta · Rosas", category: "cumple-adulto" },
  { src: "/images/gallery/cumple-santorini.jpg", alt: "Tarta de cumpleaños inspirada en Santorini con rosas y casa azul", caption: "Temática · Santorini", category: "cumple-adulto" },
  { src: "/images/gallery/cumple-telma.jpg", alt: "Tarta de cumpleaños vintage clásica con lazos negros estilo coquette", caption: "Vintage · Coquette · Telma", category: "cumple-adulto" },
  { src: "/images/gallery/cumple-sirena.jpg", alt: "Tarta de cumpleaños con cola de sirena, conchas y perlas", caption: "Temática · Sirena", category: "cumple-adulto" },
  { src: "/images/gallery/cumple-sharon.jpg", alt: "Tarta de cumpleaños pastel multicolor en rosa, azul y lila", caption: "Pastel · Multicolor", category: "cumple-adulto" },
  { src: "/images/gallery/cumple-rosa-flor.jpg", alt: "Tarta rosa con rosa de tela y topper Feliz Cumpleaños", caption: "Rosa · Flor & topper", category: "cumple-adulto" },
  { src: "/images/gallery/cumple-corazones-rojos.jpg", alt: "Tarta vintage blanca con corazones rojos y lazos rojos", caption: "Coquette · Corazones rojos", category: "cumple-adulto" },
  { src: "/images/gallery/cumple-corazon-azul-22.jpg", alt: "Tarta corazón azul con perlas formando 22", caption: "Corazón azul · 22", category: "cumple-adulto" },
  { src: "/images/gallery/cumple-corazon-lila.jpg", alt: "Tarta corazón lila con perlas mariposa y lazos negros", caption: "Corazón lila · Mariposa", category: "cumple-adulto" },
  { src: "/images/gallery/cumple-mariposas-lila.jpg", alt: "Tarta lila con mariposas brillantes y rosetones", caption: "Lila · Mariposas", category: "cumple-adulto" },
  { src: "/images/gallery/cumple-rosetones-noelia.jpg", alt: "Tarta rosa con rosetones y lazos rosas Noelia", caption: "Rosetones · Noelia", category: "cumple-adulto" },

  // Temáticos / humor
  { src: "/images/gallery/cumple-oh-shit.jpg", alt: "Tarta divertida con cara y piernas Oh shit Im 26", caption: "Humor · Oh shit I'm 26", category: "tematico" },
  { src: "/images/gallery/cumple-estrella-negra.jpg", alt: "Tarta forma de estrella negra Feliz cumpleaños Alberto", caption: "Estrella negra · Alberto", category: "tematico" },
  { src: "/images/gallery/cumple-zodiac-escorpio.jpg", alt: "Tarta corazón azul oscuro Scorpion Queen", caption: "Zodíaco · Escorpio", category: "tematico" },
  { src: "/images/gallery/cumple-zodiac-sagitario.jpg", alt: "Tarta roja vintage Sagittarius Baby", caption: "Zodíaco · Sagitario", category: "tematico" },
  { src: "/images/gallery/cumple-doctora.jpg", alt: "Tarta temática medicina con figura de doctora estetoscopio y electrocardiograma", caption: "Profesión · Doctora", category: "tematico" },
  { src: "/images/gallery/cumple-policia.jpg", alt: "Tarta camisa Policía Nacional con escudo y nombre Paco", caption: "Profesión · Policía", category: "tematico" },
  { src: "/images/gallery/cumple-sofia-donuts.jpg", alt: "Tarta drip blanca con donuts y flores Sofia 18", caption: "Drip · Donuts · Sofía 18", category: "tematico" },
  { src: "/images/gallery/flamenca.jpg", alt: "Tarta temática con bailaora flamenca, lunares y guitarra", caption: "Temática · Flamenca", category: "tematico" },
  { src: "/images/gallery/navidad-grinch.jpg", alt: "Tarta El Grinch verde con gorro de Papá Noel", caption: "Navidad · Grinch", category: "tematico" },

  // Infantiles
  { src: "/images/gallery/cumple-liam.jpg", alt: "Tarta infantil azul con osito y nubes Liam", caption: "Niño · Osito · Liam", category: "infantil" },
  { src: "/images/gallery/cumple-minnie.jpg", alt: "Tarta de cumpleaños infantil con Minnie Mouse y rosetones rosas", caption: "Minnie Mouse · 2 años", category: "infantil" },
  { src: "/images/gallery/cumple-minnie-anapaula.jpg", alt: "Tarta Minnie Mouse rosa con rosetones primer cumple Ana Paula", caption: "Minnie · Ana Paula · 1 año", category: "infantil" },
  { src: "/images/gallery/cumple-mickey-mateo.jpg", alt: "Tarta infantil Mickey Mouse blanca con lunares de colores Mateo", caption: "Mickey Mouse · Mateo", category: "infantil" },
  { src: "/images/gallery/cumple-marvel.jpg", alt: "Tarta de cumpleaños infantil con superhéroes Marvel y skyline urbano", caption: "Superhéroes · Marvel", category: "infantil" },
  { src: "/images/gallery/cumple-frozen.jpg", alt: "Tarta azul Frozen con globos dorados y figura Elsa", caption: "Frozen · Elsa", category: "infantil" },
  { src: "/images/gallery/cumple-osita-corona.jpg", alt: "Tarta naked cake chantilly con osita princesa rosa con corona", caption: "Osita princesa · Naked", category: "infantil" },
  { src: "/images/gallery/cumple-osos-gemelos.jpg", alt: "Tarta rosa con dos ositos rosa y azul para gemelos", caption: "Ositos gemelos · Rosa & azul", category: "infantil" },
  { src: "/images/gallery/cumple-real-madrid.jpg", alt: "Tarta Real Madrid con escudo y balones de fútbol Alberto 13", caption: "Real Madrid · Alberto", category: "infantil" },
  { src: "/images/gallery/cumple-real-madrid-2.jpg", alt: "Tarta Real Madrid blanca con escudo y balones flotantes", caption: "Real Madrid · Balones", category: "infantil" },
  { src: "/images/gallery/cumple-atletico-madrid.jpg", alt: "Tarta Atlético de Madrid de dos pisos con bota de fútbol Elias", caption: "Atlético Madrid · Elias", category: "infantil" },
  { src: "/images/gallery/mascotas-dachshund.jpg", alt: "Tarta blanca con dachshund pintado perlas y gorrito de fiesta", caption: "Mascota · Dachshund", category: "infantil" },

  // Especiales / vintage
  { src: "/images/gallery/vintage-lambeth.jpg", alt: "Tarta vintage estilo Lambeth toda blanca con piping y perlas", caption: "Vintage · Lambeth", category: "especial" },
  { src: "/images/gallery/vintage-blanco-lazos.jpg", alt: "Tarta vintage blanca clásica con lazos negros Happy Birthday", caption: "Vintage · Lazos negros", category: "especial" },
  { src: "/images/gallery/vintage-blanco-rosa.jpg", alt: "Tarta vintage blanca con piping y lazos rosas", caption: "Vintage · Lazos rosas", category: "especial" },
  { src: "/images/gallery/vintage-cream-rosetones.jpg", alt: "Tarta vintage cream con rosetones de chantilly y plato dorado", caption: "Vintage · Cream rosetones", category: "especial" },
  { src: "/images/gallery/vintage-roja-gelee.jpg", alt: "Tarta vintage roja con gelée de fresa y lazos rojos", caption: "Vintage · Gelée fresa", category: "especial" },
  { src: "/images/gallery/cumple-leopardo.jpg", alt: "Tarta corazón con animal print leopardo y lazos negros", caption: "Animal print · Leopardo", category: "especial" },
];

export const CATEGORY_LABELS: Record<GalleryPhoto["category"], string> = {
  "boda": "Bodas",
  "comunion": "Comuniones",
  "cumple-adulto": "Cumple adultos",
  "tematico": "Temáticos",
  "infantil": "Infantiles",
  "especial": "Vintage / Especiales",
};
