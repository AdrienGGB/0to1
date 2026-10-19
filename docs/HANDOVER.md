# Passation — 2026-10-19

Note de passation entre la session cloud qui a monté le projet et la prochaine session (locale, sur
le Mac d'Adrien). À lire après `CLAUDE.md`. À supprimer ou mettre à jour une fois les points
« À faire en premier » réglés.

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
- **Site** : https://0to1-hi4o.vercel.app (projet Vercel `0to1-hi4o`). Variables Vercel posées par
  Adrien : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTI_ABUSE_SECRET`.
- **Secrets GitHub** posés : `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF_PROD`,
  `SUPABASE_DB_PASSWORD_PROD`.

## À faire en premier

1. **Appliquer les migrations en prod.** Le workflow n'a tourné qu'en dry run : il a listé les deux
   migrations (connexion et secrets OK), mais **rien n'est appliqué**.
   ```bash
   gh workflow run migrate.yml -f dry_run=false
   gh run watch   # puis vérifier le log : « Applying migration … » pour les deux fichiers
   ```
2. **Vérifier les tables** (MCP Supabase de `.mcp.json`, en lecture seule) : `answers`,
   `rate_limits`, `used_challenges` existent, RLS activé sur les trois, fonctions
   `hit_rate_limit` et `consume_challenge` présentes.
3. **Tester la prod de bout en bout** : ouvrir le site, répondre à un paquet de 12 cartes, puis
   vérifier dans `answers` qu'il y a 12 lignes avec le même `session_id`. Vérifier aussi que
   `GET /api/challenge` répond 200 et qu'un `POST /api/answers` sans jeton répond 401.
   - 202 sur `/api/answers` : les variables Supabase ne sont pas lues par Vercel (redéployer).
   - 500 : la table n'existe pas ou la clé publique est fausse.
4. **Nettoyer Vercel** (à confirmer avec Adrien) : les projets `0to1` (doublon) et
   `0to1-learningassistant` (ancien projet, déploiement en échec) sont reliés au repo et
   commentent chaque PR. Seul `0to1-hi4o` sert.

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
