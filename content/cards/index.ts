// Every theme file must be listed here (a test checks it): static imports keep them in the bundle.

import alimentation from "./alimentation.json";
import cadreDeVie from "./cadre-de-vie.json";
import climatEnergie from "./climat-energie.json";
import defense from "./defense.json";
import democratie from "./democratie.json";
import economie from "./economie.json";
import education from "./education.json";
import emploi from "./emploi.json";
import logement from "./logement.json";
import mobilite from "./mobilite.json";
import numerique from "./numerique.json";
import pouvoirAchat from "./pouvoir-achat.json";
import sante from "./sante.json";
import securiteJustice from "./securite-justice.json";
import servicesPublics from "./services-publics.json";
import solidarites from "./solidarites.json";

export const themeFiles: unknown[] = [
  pouvoirAchat,
  logement,
  sante,
  mobilite,
  alimentation,
  emploi,
  education,
  climatEnergie,
  cadreDeVie,
  servicesPublics,
  securiteJustice,
  democratie,
  numerique,
  solidarites,
  economie,
  defense,
];
