# 0to1 — Guide de développement pour Claude

## Projet

**Objectif** : un QCM très complet (sociétal, social, environnemental, économique, etc.) qui sert
**uniquement** à identifier les revendications et les besoins de la population.
**Contrainte non négociable** : le QCM est **apolitique et neutre**. Il mesure des besoins et des
priorités ; il ne classe pas les gens, ne recommande rien, ne pousse aucune option.

**Développeur** : Adrien (solo).
**État** : collecte uniquement (aucun affichage de résultats, voir `docs/DECISIONS.md`). Écran de
swipe, 6 cartes d'exemple, anti-bot niveaux 1 et 2, stockage Supabase prêt (projet Supabase pas
encore créé).

Avant toute contribution qui touche aux questions, aux réponses proposées ou à la présentation des
résultats, lire **[docs/NEUTRALITE.md](docs/NEUTRALITE.md)**. Cette charte prime sur tout le reste.

## Règles de réponse

- **Répondre en français.** Code, noms de variables et messages de commit en anglais.
- **Pas d'artifact sans demande explicite.** Ne jamais publier d'artifact de sa propre initiative,
  ni « proposer » d'en faire un en le créant. Si un artifact semble pertinent, demander d'abord.
- **Répondre dans le chat quand c'est possible.** Récaps, tableaux, états d'avancement, comparatifs :
  du texte et des tableaux markdown dans la conversation, pas une page publiée.
- **Neutralité aussi dans la conversation** : quand on discute du contenu des questions, ne jamais
  donner d'avis sur le fond d'un sujet politique. Évaluer la formulation, pas l'opinion.

## Documentation

| Fichier | Rôle |
|---------|------|
| [docs/VISION.md](docs/VISION.md) | Le pourquoi : objectif, utilisateurs, ce que le produit n'est pas |
| [docs/NEUTRALITE.md](docs/NEUTRALITE.md) | Charte de neutralité : règles de rédaction, revue, résultats |
| [docs/DONNEES.md](docs/DONNEES.md) | Données personnelles et RGPD (les réponses sont des données sensibles) |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Journal des décisions (une entrée par choix structurant) |

Toute décision structurante (stack, modèle de données, méthode de diffusion…) → une entrée dans
`docs/DECISIONS.md`.

## Stack

- **Next.js 16** (App Router, Cache Components activé) + **React 19** + **TypeScript** strict
  (pas de `any`). Next.js 16 diffère de ce que tu connais : voir @AGENTS.md et lire le guide
  concerné dans `node_modules/next/dist/docs/` avant d'écrire du code Next.
- **Motion** (`motion/react`) pour les gestes de swipe ; **zod** pour valider cartes et réponses
- **Tailwind CSS** + **shadcn/ui** (pas de composants UI faits main quand shadcn en a un)
- **Supabase** (Postgres + RLS sur **toutes** les tables), région UE
- **Vercel** pour le déploiement
- Tests : **Vitest** (unitaires) ; Playwright pour le parcours du QCM, à ajouter

Utiliser Context7 (MCP) pour la doc à jour de Next.js, Supabase, Tailwind, shadcn.

## Structure

```
content/cards/        # Les cartes : un JSON par thème (données, pas du code)
src/app/              # Pages (/, /confidentialite), routes /api/{challenge,session,answers}, manifest PWA
src/components/       # Survey (déroulé), SwipeCard (geste), ui/ (shadcn)
src/lib/answers.ts    # Directions → réponses, détection du geste, schéma d'une réponse
src/lib/cards/        # Schéma zod des cartes et chargement du paquet
src/lib/shuffle.ts    # Mélange déterministe (graine enregistrée avec chaque réponse)
src/lib/antiAbuse/    # Défi ALTCHA, jetons de session signés, empreinte d'IP, limites de débit
src/lib/answeredStore.ts # Cartes déjà répondues, mémorisées sur l'appareil (localStorage)
src/lib/startSession.ts  # Côté client : résout le défi et ouvre la session
src/lib/supabase/     # Client Supabase serveur (anonyme, insertion seule)
supabase/migrations/  # Schéma SQL + RLS
```

## Particularités de l'environnement

- **npm 10 plante** à l'ajout de certains paquets (`Cannot read properties of null (reading
  'edgesOut')`). Pour ajouter une dépendance : `npx -y npm@11 install <paquet>`. `npm ci` marche.
- **Le registre shadcn est bloqué** dans les sessions cloud : écrire le composant à la main dans
  `src/components/ui/` à partir de la source shadcn (style new-york), plutôt que `npx shadcn add`.

## Principes d'architecture

- **Les questions sont des données, pas du code.** Elles vivent dans `content/cards/*.json`,
  jamais en dur dans les composants. Chaque carte a un identifiant stable et une version : une carte
  modifiée = une nouvelle version, pour que les réponses déjà collectées restent interprétables.
  Chaque carte a un miroir (`mirrorOf`) et un historique de revues (`reviews`).
- **Mobile-first** : la majorité des répondants seront sur téléphone.
- **Accessibilité** : RGAA / WCAG AA. Un QCM qui exclut une partie de la population fausse les
  résultats.
- **Aucun tracker tiers** (pas de Google Analytics, pixels, etc.). Mesure d'audience uniquement si
  elle est sans cookie et hébergée en UE.
- **Pas de lien entre une réponse et une identité** : voir `docs/DONNEES.md`.

## Conventions de code

- Composants : PascalCase (`QuestionCard.tsx`) ; utilitaires : camelCase (`shuffleOptions.ts`)
- Fonctions : verbe d'abord (`computeDistribution`) ; booléens : `is*`, `has*`, `should*`
- Interfaces pour les objets, `type` pour les unions
- Les migrations Supabase vont dans `supabase/migrations/`, puis `npm run generate:types`

## Workflow Git

- `main` est protégé : **jamais de push direct sur `main`**.
- Une branche par chantier (`feat/…`, `fix/…`, `chore/…`, `content/…` pour les questions), puis une
  PR vers `main`. **Adrien merge lui-même** ; ne jamais merger sans son feu vert explicite.
- Commits au format conventionnel (`feat:`, `fix:`, `chore:`, `docs:`, `content:`…).
- Avant de pousser : lint, typecheck et tests doivent passer.

## Revue des questions

Toute PR qui ajoute ou modifie une question ou des réponses proposées :

1. passe par le sous-agent **`neutrality-reviewer`** (`.claude/agents/neutrality-reviewer.md`) ;
2. corrige tout ce qu'il signale comme bloquant, ou explique dans la PR pourquoi pas ;
3. reste soumise à la validation humaine d'Adrien.

## Commandes

```bash
npm run dev            # serveur local (localhost:3000)
npm run build          # build de production
npm run lint           # ESLint
npm run type-check     # next typegen + tsc --noEmit
npm test               # tests unitaires (Vitest)
npm run generate:types # types Supabase (remplace src/types/supabase.ts, écrit à la main)
```

Sans `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (voir `.env.example`), l'app
fonctionne et la route `/api/answers` répond 202 sans rien stocker ; limites de débit et défis
utilisés sont alors gardés en mémoire. `ANTI_ABUSE_SECRET` est obligatoire en production
(`next start` compris) ; en dev, un secret de test est utilisé.

Tester les migrations sans Docker : PGlite (`@electric-sql/pglite`) dans le scratchpad, en créant
les rôles `anon` et `authenticated` avant d'appliquer `supabase/migrations/`.

## Sécurité

- Ne jamais commiter `.env.local` ni aucune clé ; aucune clé côté client.
- RLS sur toutes les tables Supabase ; la clé `service_role` ne sort jamais du serveur.
- HTTPS uniquement.
