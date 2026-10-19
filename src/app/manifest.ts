import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReQuête — Vos besoins, en quelques gestes",
    short_name: "ReQuête",
    description:
      "Un questionnaire neutre et anonyme pour faire remonter les besoins et les attentes de la population.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
  };
}
