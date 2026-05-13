import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SmileSync",
    short_name: "SmileSync",
    description: "Premium futuristic dental clinic SaaS and web app.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#06b6d4",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
  };
}
