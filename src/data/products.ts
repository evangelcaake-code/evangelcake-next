/**
 * Catálogo de productos de EvangelCake.
 *
 * Para añadir un producto nuevo:
 *   1) Añade un objeto al array PRODUCTS de abajo
 *   2) Coloca la foto en /public/images/ (o reutiliza una existente)
 *   3) El resto es automático: aparece en /encargos y se genera
 *      /encargos/<slug> con su página de detalle
 *
 * Si el producto tiene una página "rica" dedicada (ej. el configurador en
 * /tartas-personalizadas), pon customPageUrl y la card del catálogo enlazará
 * ahí en vez de a la página de detalle genérica.
 */

export type Product = {
  slug: string;
  name: string;
  shortDescription: string; // 1 línea, para la card
  longDescription: string; // 1-2 párrafos, para la página de detalle
  price: string; // formato libre, ej. "desde 28€"
  availability: string; // ej. "Bajo pedido", "Solo lunes"
  image: string; // path absoluto desde /public
  imageAlt: string;
  badge?: string; // chip que aparece sobre la imagen
  highlight?: string[]; // bullets opcionales en la página de detalle
  /**
   * Texto pre-rellenado en el mensaje de WhatsApp al pulsar "Pedir".
   */
  waText: string;
  /**
   * Si tiene una página dedicada (ej. configurador), pon la URL aquí. La
   * card del catálogo y los links internos llevarán ahí en vez de a
   * /encargos/<slug>.
   */
  customPageUrl?: string;
  /**
   * Color del badge superior izquierdo de la card. Opcional.
   * Valores: "pink" | "gold" | "blue" | "rose"
   */
  cardColor?: "pink" | "gold" | "blue" | "rose";
};

export const PRODUCTS: Product[] = [
  {
    slug: "tartas-personalizadas",
    name: "Tartas personalizadas",
    shortDescription: "Diseñamos contigo cada tarta a tu medida.",
    longDescription:
      "Bodas, cumpleaños, bautizos, comuniones, baby showers, despedidas… Cada tarta se diseña 1:1 contigo: bizcocho, relleno, cobertura, color y decoración. Solo chantilly fresco, nunca fondant. Sabor brasileño con técnicas europeas.",
    price: "desde 42€",
    availability: "Bajo pedido · mínimo 5 días de antelación",
    badge: "Bajo pedido",
    image: "/images/gallery/cumple-brochazos.jpg",
    imageAlt:
      "Tarta de cumpleaños con brochazos rosas y rosas de chantilly — EvangelCake",
    highlight: [
      "Diseño 1:1 con Andreia: bizcocho, relleno, cobertura, color, decoración",
      "Solo chantilly fresco — cero fondant",
      "Sin gluten, sin lactosa o sin azúcar bajo encargo",
      "Entrega en Zaragoza ciudad bajo presupuesto",
    ],
    waText: "Hola! Quiero pedir presupuesto para una tarta personalizada",
    customPageUrl: "/tartas-personalizadas",
    cardColor: "pink",
  },
  {
    slug: "tres-leches",
    name: "Tres leches",
    shortDescription:
      "La receta brasileña que enamoró a media Zaragoza.",
    longDescription:
      "Bizcocho esponjoso empapado en tres tipos de leche, coronado con chantilly fresca montada cada mañana. Es la tarta favorita de los clientes habituales del obrador. Sabor cremoso, no empalaga, ideal para cualquier celebración familiar.",
    price: "desde 28€",
    availability: "Bajo pedido · 48h de antelación",
    badge: "Especialidad BR",
    image: "/images/home/andreia-tarta-frambuesa.jpg",
    imageAlt: "Tarta tres leches con chantilly fresca y frutas — EvangelCake",
    highlight: [
      "Bizcocho casero empapado en leche evaporada + condensada + nata",
      "Cobertura de chantilly fresca recién montada",
      "Tamaños: 4, 8, 12 y 18 personas",
    ],
    waText: "Hola! Quiero pedir una tarta de tres leches",
    cardColor: "gold",
  },
  {
    slug: "bizcocho-zanahoria",
    name: "Bizcocho de zanahoria",
    shortDescription:
      "La receta familiar de la tía brasileña de Andreia.",
    longDescription:
      "El bolo de cenoura clásico brasileño: zanahoria rallada a mano, bizcocho jugoso, y cobertura de chocolate brasileño vertida en caliente. Lo hacemos cada lunes en el obrador, y se puede pedir bajo encargo para llevarte una entera o para una celebración. Es uno de los productos con más historia de la casa — escribimos un post entero sobre él.",
    price: "desde 18€",
    availability: "Lunes en obrador · bajo pedido el resto de la semana",
    badge: "Solo lunes",
    image: "/images/blog/bizcocho-zanahoria-tia.jpg",
    imageAlt:
      "Bizcocho de zanahoria brasileño con cobertura de chocolate — receta familiar de EvangelCake",
    highlight: [
      "Zanahoria rallada a mano cada lunes",
      "Cobertura de chocolate vertida en caliente",
      "Tamaño individual (4 raciones) y familiar (8-12 raciones)",
    ],
    waText: "Hola! Hay bizcocho de zanahoria esta semana?",
    cardColor: "rose",
  },
  {
    slug: "crumbl-cookies",
    name: "Crumbl cookies",
    shortDescription:
      "Cookies XL al estilo americano, con sabores rotativos cada semana.",
    longDescription:
      "Cookies gigantes (120-140g) horneadas al estilo americano: crujientes por fuera, melosas por dentro. Los sabores cambian cada semana: dulce de leche, Lotus Biscoff, doble chocolate, frambuesa-chocolate blanco, oreo, kinder, pistacho… Pregunta por WhatsApp cuáles tenemos esta semana, o encarga una caja para regalar.",
    price: "desde 4€ por unidad · caja de 4 desde 15€",
    availability: "Sabores rotativos · disponibles en obrador",
    badge: "Rotativo",
    image: "/images/home/cookie-caramelo.jpg",
    imageAlt:
      "Cookie crumbl XL con relleno de dulce de leche — EvangelCake Zaragoza",
    highlight: [
      "120-140g por cookie · estilo Crumbl original",
      "Sabores rotativos: dulce de leche, Lotus, oreo, kinder, pistacho…",
      "Cajas de 4 o 6 para regalar",
      "Pregunta por los sabores de esta semana",
    ],
    waText:
      "Hola! Qué sabores de Crumbl cookies tenéis esta semana?",
    cardColor: "blue",
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/**
 * Productos con página propia en /encargos/<slug> (es decir, sin customPageUrl).
 * Se usa para generateStaticParams del [slug].
 */
export function getCatalogProducts(): Product[] {
  return PRODUCTS.filter((p) => !p.customPageUrl);
}
