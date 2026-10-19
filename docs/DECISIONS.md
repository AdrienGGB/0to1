# Journal des décisions

Une entrée par décision structurante, la plus récente en haut. Une décision remplacée n'est pas
effacée : on ajoute une nouvelle entrée qui la remplace.

Format : **date — titre** · Contexte · Décision · Conséquences.

---

## 2026-10-19 — Repartir de zéro sur le repo 0to1

- **Contexte** : le repo contenait un générateur de cours IA, sans rapport avec le nouveau projet.
- **Décision** : vidage complet du repo ; l'ancien code reste sur la branche
  `archive/v0-course-generator`.
- **Conséquences** : aucun code hérité ; l'historique Git est conservé.

## 2026-10-19 — Stack et workflow

- **Contexte** : choix de départ pour un dev solo, alignés sur ce qu'Adrien maîtrise déjà.
- **Décision** : Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase (région UE) +
  Vercel. Workflow `main` + PRs, merge par Adrien uniquement. Pas de GSD ni d'inbox pour l'instant.
- **Conséquences** : à revoir quand le code démarre (ajout éventuel de GSD).

## À décider

- Format des fichiers de questions (YAML, JSON, MDX…) et leur schéma.
- Liste initiale des thèmes.
- Seuil minimal d'effectif pour publier un agrégat.
- Méthode anti-abus compatible avec l'anonymat.
