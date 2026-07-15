/**
 * Fuente única de bizcochos, rellenos, coberturas y TAMAÑOS/PRECIOS.
 *
 * Usado por:
 *   - /tartas-personalizadas (CakeConfigurator y CakeModal)
 *   - /pedir-cita (PedirCitaWizard — cata previa a la cita)
 *
 * Cambia aquí una vez → cambia en todas las pantallas. No dupliques.
 */

export type CakeSize = {
  value: string;      // texto que va al mensaje de WhatsApp
  display: string;    // número grande en la tarjeta
  px: string;         // subtítulo ("personas")
  price: string;      // "desde 44€"
  rellenos: 1 | 2;    // nº de rellenos que se pueden elegir en ese tamaño
};

/**
 * Precios de tartas de 1 piso — actualizados julio 2026 (TPV).
 * El precio base incluye bizcocho + relleno + cobertura + decoración
 * sencilla con oblea. Los extras de decoración se suman aparte.
 * A partir de 6–8 personas se pueden elegir 2 rellenos.
 */
export const SIZES: CakeSize[] = [
  { value: "4–6 personas",   display: "4–6",   px: "personas", price: "desde 44€",  rellenos: 1 },
  { value: "6–8 personas",   display: "6–8",   px: "personas", price: "desde 50€",  rellenos: 2 },
  { value: "8–10 personas",  display: "8–10",  px: "personas", price: "desde 55€",  rellenos: 2 },
  { value: "10–12 personas", display: "10–12", px: "personas", price: "desde 64€",  rellenos: 2 },
  { value: "15–18 personas", display: "15–18", px: "personas", price: "desde 78€",  rellenos: 2 },
  { value: "20 personas",    display: "20",    px: "personas", price: "desde 88€",  rellenos: 2 },
  { value: "22–25 personas", display: "22–25", px: "personas", price: "desde 110€", rellenos: 2 },
  { value: "30–35 personas", display: "30–35", px: "personas", price: "desde 146€", rellenos: 2 },
  { value: "40 personas",    display: "40",    px: "personas", price: "desde 168€", rellenos: 2 },
  { value: "50 personas",    display: "50",    px: "personas", price: "desde 210€", rellenos: 2 },
  { value: "60 personas",    display: "60",    px: "personas", price: "desde 250€", rellenos: 2 },
];

export const BIZCOCHOS = ["Vainilla", "Red Velvet", "Chocolate"];

export const RELLENOS = [
  "Chocolate", "Vainilla", "Nutella", "Pistacho", "Fresa", "Lotus",
  "Tres Leches", "Kinder", "Oreo", "Piña", "Dulce de Leche", "Trufa",
  "Maracuyá", "Nata", "Queso crema", "Coco", "Frutos Rojos", "Chocolate blanco",
];

export const COBERTURAS = [
  "Chantilly (nata)", "Trufa", "Merengue", "Buttercream",
];
