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
  ré-identification). Seuil : **100 réponses** par carte (ou par version de la question
  prioritaire), appliqué dans la base (voir `DECISIONS.md`).
- **Appareil partagé** : le bilan est calculé à partir de réponses gardées sur l'appareil ; il
  propose de les effacer.

## Ce qui est réellement traité aujourd'hui

| Donnée | Où | Durée | Lien avec les réponses |
|--------|----|-------|------------------------|
| Réponse à une carte (carte, version, réponse, position, graine du paquet, temps de réponse, marqueur « rapide ») | Table `answers` | À définir | — |
| Identifiant de session aléatoire, créé par le serveur | Table `answers` | Comme les réponses | Regroupe les réponses d'une même visite ; ne dit rien de la personne |
| Jeton de session signé | Mémoire du navigateur | 2 h | Prouve que la session a passé l'anti-bot ; non stocké côté serveur |
| Empreinte d'IP : HMAC de l'IP, avec un sel qui change chaque jour (UTC) | Table `rate_limits` | 24 h maximum, purge automatique | **Aucun** : jamais stockée avec les réponses |
| Défis anti-bot déjà utilisés (nonce aléatoire) | Table `used_challenges` | 10 min | Aucun |
| Liste des cartes déjà répondues, et la réponse donnée à chacune | `localStorage` de l'appareil | Jusqu'à effacement par la personne (bouton dans le bilan) | Jamais envoyées au serveur depuis ce stockage ; servent à calculer le bilan sur l'appareil |
| Message prioritaire : 1 à 3 thèmes, ou « Je ne sais pas » / « Je préfère ne pas répondre », version de la question, graine de l'ordre d'affichage | Table `priority_messages` (un par session), et copie sur l'appareil | À définir (comme les réponses) | Même identifiant de session que les réponses |
| Agrégats du bilan : répartition des réponses par carte, et des choix au message prioritaire | Calculés à la demande par `card_answer_stats()` et `message_choice_stats()`, mis en cache quelques minutes | — | Aucun : seulement des totaux, et seulement à partir de 100 réponses |

L'adresse IP elle-même n'est écrite nulle part. L'empreinte sert uniquement à limiter le nombre de
sessions et de réponses par connexion ; comme le sel change chaque jour, deux empreintes de jours
différents ne peuvent pas être rapprochées.

## À trancher avant la mise en ligne

- Base légale exacte et rédaction du recueil de consentement.
- Faut-il une analyse d'impact (AIPD) ? Probable, vu les données sensibles à grande échelle.
- Désignation d'un responsable de traitement et d'un contact pour l'exercice des droits.
- Politique de conservation et de suppression.

> Ce document fixe des principes de conception ; il ne remplace pas un avis juridique.
