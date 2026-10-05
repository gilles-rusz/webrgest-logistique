import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lean Terrain",
    short_name: "Lean Terrain",
    description: "Tableau visuel, rituel de 5 minutes et KPI automatiques pour les équipes terrain.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#0f172a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
