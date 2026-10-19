# 0to1 — Guide de développement pour Claude

## Projet

**Objectif** : un QCM très complet (sociétal, social, environnemental, économique, etc.) qui sert
**uniquement** à identifier les revendications et les besoins de la population.
**Contrainte non négociable** : le QCM est **apolitique et neutre**. Il mesure des besoins et des
priorités ; il ne classe pas les gens, ne recommande rien, ne pousse aucune option.

**Développeur** : Adrien (solo).
**État** : setup du repo terminé, pas encore de code applicatif.

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

## Stack (prévue)

- **Next.js** (App Router) + **TypeScript** strict (pas de `any`)
- **Tailwind CSS** + **shadcn/ui** (pas de composants UI faits main quand shadcn en a un)
- **Supabase** (Postgres + RLS sur **toutes** les tables), région UE
- **Vercel** pour le déploiement
- Tests : **Vitest** (unitaires), **Playwright** (parcours du QCM)

Utiliser Context7 (MCP) pour la doc à jour de Next.js, Supabase, Tailwind, shadcn.

## Principes d'architecture

- **Les questions sont des données, pas du code.** Elles vivent dans des fichiers versionnés
  (format à décider, voir `docs/DECISIONS.md`), jamais en dur dans les composants. Chaque question a
  un identifiant stable et une version : une question modifiée = une nouvelle version, pour que les
  réponses déjà collectées restent interprétables.
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

À compléter quand l'application sera initialisée :

```bash
npm run dev            # serveur local
npm run lint           # ESLint
npm run type-check     # tsc --noEmit
npm test               # tests unitaires
npm run test:e2e       # Playwright
npm run generate:types # types Supabase
```

## Sécurité

- Ne jamais commiter `.env.local` ni aucune clé ; aucune clé côté client.
- RLS sur toutes les tables Supabase ; la clé `service_role` ne sort jamais du serveur.
- HTTPS uniquement.
