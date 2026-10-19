# Passation — 2026-10-19

Note de passation entre la session cloud qui a monté le projet et la prochaine session (locale, sur
le Mac d'Adrien). À lire après `CLAUDE.md`. La mise en service est réglée ; restent les décisions
en attente d'Adrien.

## Où on en est

Tout ce qui suit est mergé sur `main` (PR #3 à #6) et déployé sur Vercel.

- **Produit** : ReQuête, un QCM en swipe pour faire remonter les besoins de la population, neutre et
  anonyme. Collecte uniquement : aucun résultat n'est affiché (décision volontaire, voir
  `DECISIONS.md`).
- **Interface** : pile de cartes à 4 gestes (droite Oui, gauche Non, haut Je ne sais pas, bas Je
  préfère ne pas répondre), boutons et clavier équivalents, paquets de 12 cartes enchaînables.
- **Contenu** : 110 cartes, 55 paires miroirs, 17 thèmes, 6 catégories. Deux passes du relecteur de
  neutralité, tous les bloquants corrigés, historique `reviews` sur chaque carte.
- **Anti-abus** : niveau 1 (mémoire locale des cartes répondues) et niveau 2 (défi ALTCHA, session
  signée, une réponse par carte et par session, limites de débit par empreinte d'IP à sel
  quotidien).
- **Back-end** : Supabase `vpbxrneabgskbckjiwlk` (région UE), 2 migrations dans
  `supabase/migrations/`, workflow manuel `Supabase Migrations (prod)`.
- **Qualité** : CI GitHub sur chaque PR (lint, typecheck, 44 tests unitaires, build, 10 tests e2e
  Playwright).
- **Site** : https://0to1-hi4o.vercel.app (projet Vercel `0to1-hi4o`, le seul). Variables Vercel posées par
  Adrien : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTI_ABUSE_SECRET`.
- **Secrets GitHub** posés : `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF_PROD`,
  `SUPABASE_DB_PASSWORD_PROD`.

## Mise en service (réglée le 2026-10-19)

1. **Migrations appliquées en prod** via `gh workflow run migrate.yml -f dry_run=false` : les deux
   fichiers sont dans `supabase_migrations.schema_migrations`.
2. **Tables vérifiées** : `answers`, `rate_limits`, `used_challenges` existent avec RLS ;
   `hit_rate_limit` et `consume_challenge` présentes et exécutables par `anon`. Supabase a aussi
   créé une fonction `rls_auto_enable` qui ne vient pas de nos migrations (laissée en place).
3. **Prod testée de bout en bout** : un paquet de 12 cartes donne 12 réponses 201 et 12 lignes
   avec le même `session_id`. `GET /api/challenge` répond 200 ; un `POST /api/answers` bien formé
   avec un faux jeton répond 401 (un corps invalide répond 400 avant le contrôle du jeton). Les
   12 lignes de test ont été supprimées : `answers` est vide.
4. **Vercel nettoyé** : les projets `0to1` et `0to1-learningassistant` sont supprimés. Seul
   `0to1-hi4o` reste.

Pour interroger la base sans le MCP Supabase : `POST
https://api.supabase.com/v1/projects/vpbxrneabgskbckjiwlk/database/query` avec le jeton du CLI
Supabase (`supabase login`).

## Décisions en attente d'Adrien

- **Validation humaine des 110 cartes** : la charte l'exige, elle n'a pas encore eu lieu. Proposer
  de les lui présenter par thème dans le chat.
- **Thèmes absents** : culture, territoires, agriculture, immigration. Leur absence est notée comme
  un choix à trancher, sans parti pris.
- **Avant une diffusion publique** (voir `DONNEES.md`) : base légale et texte de consentement,
  analyse d'impact (AIPD, probablement obligatoire), durée de conservation, page de confidentialité
  définitive (`/confidentialite` est provisoire).
- **Plus tard** : niveau 3 anti-abus (vérification d'unicité avec jeton anonyme), puis
  l'affichage ou le partage des résultats, une fois l'attraction validée.

## Pièges connus

- **Next.js 16** : lire `node_modules/next/dist/docs/` avant d'écrire du code Next (voir
  `AGENTS.md`). Cache Components est activé : une route qui fait de l'aléatoire doit appeler
  `connection()`.
- **npm 10** plante sur certains ajouts de paquets : `npx -y npm@11 install <paquet>`.
- **Playwright** est figé en 1.56.1 pour les sessions cloud ; en local, `npx playwright install
  chromium` est possible si le navigateur manque.
- **Cartes** : modifier une carte déjà collectée = incrémenter sa `version`. Ajouter un fichier de
  thème = l'ajouter aussi dans `content/cards/index.ts` (un test le vérifie). Toute modification
  de carte repasse par le sous-agent `neutrality-reviewer`.
- **Merges** : Adrien a autorisé Claude à merger directement les PR dont la CI est verte.
