# Charte de neutralité

Le QCM sert à **identifier les besoins et les revendications de la population**. Il ne sert pas à
situer les répondants politiquement, ni à promouvoir une option. Chaque règle ci-dessous découle de
cet objectif. En cas de doute sur une question : la réécrire ou la retirer.

## 1. Ce que le QCM ne fait jamais

- Aucun score ou positionnement politique (gauche/droite, axes, « profil »), même caché.
- Aucune correspondance avec un parti, un candidat, un élu, un média ou une organisation.
- Aucune recommandation ni « bonne réponse », aucun message qui félicite ou corrige un choix.
- Aucune mention de parti, de personnalité ou de programme dans les questions.

## 2. Mesurer des besoins, pas des camps

Ordre de préférence pour le type de question :

1. **Le vécu** : « Au cours des 12 derniers mois, avez-vous renoncé à des soins pour des raisons
   financières ? »
2. **Les priorités** : « Parmi ces sujets, lesquels comptent le plus pour vous ? »
3. **Les attentes** : « Dans quelle mesure souhaitez-vous que ce sujet soit traité ? »
4. **Les solutions**, en dernier recours, et alors avec plusieurs options issues de traditions
   différentes, présentées sans étiquette et avec une formulation de même longueur et de même ton.

## 3. Règles de rédaction

| Règle | Exemple à éviter | Pourquoi |
|-------|------------------|----------|
| Une seule idée par question | « Faut-il baisser les impôts et les dépenses publiques ? » | On ne sait pas à quoi la personne répond |
| Pas de présupposé | « Comment lutter contre la hausse de l'insécurité ? » | Impose un constat |
| Pas de terme connoté | « assistanat », « écologie punitive », « cadeaux fiscaux » | Le mot porte déjà l'opinion |
| Pas de question suggestive | « Ne pensez-vous pas que… ? » | Pousse vers le « oui » |
| Pas de double négation | « Êtes-vous contre la non-application de… ? » | Source d'erreurs de lecture |
| Vocabulaire courant | jargon administratif, sigles non définis | Exclut une partie des répondants |
| Neutralité de cadrage | parler d'un sujet uniquement par ses coûts, ou uniquement par ses bénéfices | Le cadrage oriente la réponse |
| Pas de chiffre sans source | « Sachant que 80 % des Français… » | Ancre la réponse ; un chiffre se conteste |

Chaque formulation doit pouvoir être relue par deux personnes de sensibilités opposées **sans
qu'aucune ne la trouve orientée**.

## 4. Réponses proposées

- **Échelles équilibrées** : autant de degrés positifs que négatifs, libellés symétriques
  (« Tout à fait d'accord » ↔ « Pas du tout d'accord »).
- **Toujours** une option « Je ne sais pas / Sans opinion » et une option « Je préfère ne pas
  répondre », distinctes l'une de l'autre et non comptées comme des opinions.
- Options **exhaustives et sans chevauchement** ; « Autre » quand la liste ne peut pas être exhaustive.
- **Ordre aléatoire** des options quand elles ne sont pas ordinales ; ordre des questions aléatoire
  à l'intérieur d'un thème, pour limiter les effets d'ordre. L'aléa est enregistré avec la réponse
  pour pouvoir l'analyser.
- Aucune option par défaut présélectionnée.

## 5. Couverture des thèmes

Le QCM couvre largement la vie quotidienne et collective : par exemple pouvoir d'achat, emploi et
travail, logement, santé, éducation, environnement et climat, énergie, transports et mobilité,
services publics, sécurité et justice, démocratie et participation, numérique, solidarités, culture,
territoires, alimentation et agriculture, fiscalité. La liste évolue (entrée dans `DECISIONS.md`).

- Le choix d'inclure ou non un thème est lui-même un biais : il se justifie et se trace.
- Aucun thème n'est présenté comme plus important qu'un autre par l'interface.
- S'inspirer des enquêtes de référence (INSEE, CREDOC, European Social Survey, World Values Survey,
  baromètres publics) et citer la source quand une formulation en est reprise.

## 6. Traçabilité

Chaque question porte :

- un identifiant stable et un numéro de version ;
- son thème et son type (vécu, priorité, attente, solution) ;
- une justification courte (quel besoin elle cherche à mesurer) ;
- ses sources d'inspiration le cas échéant ;
- l'historique de ses revues de neutralité.

Une modification de formulation ou d'options crée une **nouvelle version** ; les deux versions ne
sont jamais agrégées ensemble sans le signaler.

## 7. Processus de revue

1. Rédaction sur une branche `content/…`.
2. Revue par le sous-agent `neutrality-reviewer`.
3. Validation par Adrien ; idéalement, relecture par des personnes de sensibilités différentes.
4. Merge. La méthodologie et les questions restent publiques.

## 8. Présentation des résultats

- Montrer la **distribution complète** des réponses, pas seulement la majorité ; inclure les « Je ne
  sais pas ».
- Toujours afficher l'effectif et la période de collecte.
- Ne jamais présenter les résultats comme représentatifs de la population sans méthode de
  redressement documentée.
- Titres et commentaires descriptifs (« 42 % des répondants citent… »), jamais éditoriaux.
- Mêmes règles graphiques pour tous les thèmes (couleurs, échelles, ordre).
