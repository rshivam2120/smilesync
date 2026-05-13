import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/services", "/appointments", "/ai-smile-analysis", "/dashboard/patient", "/dashboard/admin", "/consultation", "/membership", "/contact"];
  return routes.map((route) => ({
    url: `https://smilesync.app${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
    lastModified: new Date(),
  }));
}
