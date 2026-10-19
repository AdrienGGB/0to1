# ReQuête

Un QCM complet (sociétal, social, environnemental, économique…) pour identifier les besoins et les
revendications de la population, de façon apolitique et neutre.

- [Vision](docs/VISION.md)
- [Charte de neutralité](docs/NEUTRALITE.md)
- [Données et RGPD](docs/DONNEES.md)
- [Journal des décisions](docs/DECISIONS.md)

## Démarrer

```bash
npm ci
cp .env.example .env.local   # optionnel : sans Supabase, les réponses ne sont pas stockées
npm run dev
```

Vérifications : `npm run lint`, `npm run type-check`, `npm test`, `npm run build`.
