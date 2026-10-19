# Journal des décisions

Une entrée par décision structurante, la plus récente en haut. Une décision remplacée n'est pas
effacée : on ajoute une nouvelle entrée qui la remplace.

Format : **date — titre** · Contexte · Décision · Conséquences.

---

## 2026-10-19 — Cartes en JSON versionné

- **Contexte** : les questions doivent être des données traçables, séparées du code.
- **Décision** : un fichier JSON par thème dans `content/cards/`, validé par le schéma zod de
  `src/lib/cards/schema.ts` (identifiant, version, type, affirmation, justification, miroir, sources,
  historique des revues). Un test vérifie tous les fichiers (schéma, identifiants uniques, miroirs
  réciproques).
- **Conséquences** : ajouter une carte = ajouter une entrée JSON, sans toucher aux composants.

## 2026-10-19 — Interface en swipe

- **Contexte** : un long QCM lasse ; le swipe est rapide et naturel sur mobile.
- **Décision** : pile de cartes à quatre directions (droite Oui, gauche Non, haut Je ne sais pas,
  bas Je préfère ne pas répondre), avec boutons et clavier équivalents. Règles dans
  `NEUTRALITE.md` (format swipe). Animation avec Motion. Application web installable (PWA) plutôt
  qu'une app native.
- **Conséquences** : chaque carte doit avoir un miroir pour compenser le biais d'acquiescement.

## 2026-10-19 — Stockage des réponses

- **Contexte** : les réponses sont des données sensibles (voir `DONNEES.md`).
- **Décision** : une ligne par swipe dans la table `answers` (Supabase). RLS : insertion seule pour
  le rôle anonyme, aucune lecture publique. La route `/api/answers` ne lit que le corps de la
  requête (ni IP, ni user agent, ni cookie). Un identifiant de session aléatoire, gardé en mémoire
  le temps de la visite, regroupe les réponses d'une même session. Sans configuration Supabase, la
  route accepte les réponses sans les stocker (dev local).
- **Conséquences** : l'analyse passera par le rôle service ou par des vues agrégées, à concevoir.

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

- Réponse « Non concerné » pour les cartes de vécu (personne qui n'a pas eu besoin de médecin,
  personne hébergée gratuitement…) : nouvelle option, ou cartes écrites pour s'appliquer à tous ?
- Liste initiale des thèmes.
- Seuil minimal d'effectif pour publier un agrégat.
- Méthode anti-abus compatible avec l'anonymat.
