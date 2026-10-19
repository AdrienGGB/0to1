# Journal des décisions

Une entrée par décision structurante, la plus récente en haut. Une décision remplacée n'est pas
effacée : on ajoute une nouvelle entrée qui la remplace.

Format : **date — titre** · Contexte · Décision · Conséquences.

---

## 2026-10-19 — Projet Supabase et application des migrations

- **Contexte** : le projet Supabase de production est créé (`vpbxrneabgskbckjiwlk`, région UE). Les
  sessions cloud de Claude ne peuvent pas joindre Supabase (réseau bloqué).
- **Décision** : un seul projet hébergé, la production ; le dev reste local. Les migrations
  s'appliquent avec `supabase db push` dans le workflow GitHub `Supabase Migrations (prod)`,
  déclenché uniquement à la main, avec un mode « dry run » activé par défaut.
- **Conséquences** : rien n'atteint la production sur un push ou un merge ; chaque migration est
  appliquée volontairement par Adrien.

## 2026-10-19 — Collecte d'abord, aucun affichage des résultats

- **Contexte** : la valeur première de l'app est l'information collectée ; il faut d'abord vérifier
  que les gens répondent.
- **Décision** : on ne construit que la collecte. Aucun résultat n'est affiché, ni en public ni en
  privé, tant que l'attraction n'est pas validée. Le choix public / privé / export viendra ensuite.
- **Conséquences** : pas d'écran de résultats ni de vue agrégée pour l'instant.

## 2026-10-19 — Anti-bot et réponses multiples (niveaux 1 et 2)

- **Contexte** : garantir « une personne = une réponse » impose de vérifier l'identité au moins une
  fois ; trop de friction pour mesurer l'attraction.
- **Décision** :
  - **Niveau 1, appareil** : le navigateur retient les cartes déjà répondues (`localStorage`) et ne
    les remontre pas.
  - **Niveau 2, anti-bot** : preuve de travail ALTCHA (open source, hébergée chez nous, sans tiers ni
    cookie), résolue pendant la lecture de l'accueil. Un défi résolu ouvre une session signée
    (2 h) ; chaque défi ne sert qu'une fois. Une carte ne compte qu'une fois par session (contrainte
    unique). Limites par empreinte d'IP (sel quotidien) : 60 sessions et 2 000 réponses par heure,
    volontairement larges car beaucoup de gens partagent une IP (opérateurs mobiles, écoles).
  - En cas de panne de la base, les contrôles laissent passer plutôt que de bloquer tout le monde.
- **Conséquences** : bloque les scripts et les doublons courants, pas une personne déterminée qui
  change d'appareil. Le **niveau 3** (vérification unique par FranceConnect ou SMS délivrant un
  jeton anonyme, en option) est reporté à la validation de l'attraction ; les réponses vérifiées
  pourront alors être comparées aux autres.
- **Remplace en partie** « Stockage des réponses » : les routes lisent désormais l'IP pour la hacher
  (jamais stockée avec les réponses), et l'identifiant de session est créé par le serveur.

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
- Niveau 3 anti-abus (vérification d'unicité avec jeton anonyme) : quand, et avec quel fournisseur.
