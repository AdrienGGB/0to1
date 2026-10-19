import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "0to1 — Vos besoins, en quelques gestes",
    short_name: "0to1",
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
