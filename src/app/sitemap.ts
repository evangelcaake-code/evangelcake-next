import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://evangelcake.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/tartas-personalizadas", priority: 0.95, changeFrequency: "weekly" },
    { path: "/galeria", priority: 0.9, changeFrequency: "weekly" },
    // TEMP: /encargos quitado del sitemap mientras está desactivado
    { path: "/game", priority: 0.85, changeFrequency: "weekly" },
    { path: "/sobre-nosotros", priority: 0.8, changeFrequency: "monthly" },
    { path: "/contacto", priority: 0.8, changeFrequency: "monthly" },
    { path: "/blog", priority: 0.75, changeFrequency: "weekly" },
    { path: "/blog/5-errores-tarta-personalizada", priority: 0.75, changeFrequency: "monthly" },
    { path: "/blog/chantilly-vs-fondant", priority: 0.7, changeFrequency: "monthly" },
    { path: "/blog/bizcocho-zanahoria-brasil", priority: 0.7, changeFrequency: "monthly" },
  ] as const;

  return pages.map((p) => ({
    url: `${SITE}${p.path}`,
    lastModified,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
