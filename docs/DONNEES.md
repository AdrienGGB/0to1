# Données personnelles et RGPD

Les réponses à un tel QCM peuvent révéler des **opinions politiques, des convictions, l'état de
santé, la situation financière**. Les opinions politiques et la santé sont des **catégories
particulières de données** (article 9 du RGPD) : leur traitement est interdit sauf exception, la
principale étant le **consentement explicite**. Le point de départ est donc de ne collecter que ce
qui est indispensable, et de ne pas pouvoir relier une réponse à une personne.

## Principes

- **Anonyme par défaut** : aucun compte requis pour répondre ; pas de nom, d'e-mail ni de téléphone
  stocké avec les réponses.
- **Minimisation** : chaque donnée de profil (âge, territoire, situation…) doit être justifiée par
  l'analyse ; préférer des tranches larges (tranche d'âge, département ou région) à des valeurs
  précises.
- **Pas d'adresse IP en clair** ; si un anti-abus en a besoin, empreinte hachée avec sel tournant,
  durée de vie courte, jamais stockée avec les réponses.
- **Consentement explicite** et éclairé avant la première question, avec lien vers la politique de
  confidentialité ; possibilité de quitter à tout moment.
- **Aucun tracker tiers**, aucune revente, aucun partage hors agrégats.
- **Hébergement dans l'UE** (projet Supabase en région UE, Vercel configuré en conséquence).
- **Durée de conservation** définie et documentée pour chaque type de donnée.
- **Seuil de diffusion** : ne pas publier d'agrégat sur un sous-groupe trop petit (risque de
  ré-identification) ; seuil à fixer dans `DECISIONS.md`.

## À trancher avant la mise en ligne

- Base légale exacte et rédaction du recueil de consentement.
- Faut-il une analyse d'impact (AIPD) ? Probable, vu les données sensibles à grande échelle.
- Désignation d'un responsable de traitement et d'un contact pour l'exercice des droits.
- Politique de conservation et de suppression.

> Ce document fixe des principes de conception ; il ne remplace pas un avis juridique.
