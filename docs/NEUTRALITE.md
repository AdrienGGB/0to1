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
2. **Les perceptions**, quand le vécu direct ne s'applique pas à tous : « Là où je vis, une personne
   qui cherche un emploi peut en trouver un. »
3. **Les priorités** : « Parmi ces sujets, lesquels comptent le plus pour vous ? »
4. **Les attentes** : « Dans quelle mesure souhaitez-vous que ce sujet soit traité ? »
5. **Les solutions**, en dernier recours, et alors avec plusieurs options issues de traditions
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

### Format swipe

Le QCM se présente comme une pile de cartes, chacune portant une affirmation.

| Geste | Bouton équivalent | Réponse |
|-------|-------------------|---------|
| Vers la droite | Oui | `yes` |
| Vers la gauche | Non | `no` |
| Vers le haut | Je ne sais pas | `dont_know` |
| Vers le bas | Je préfère ne pas répondre | `prefer_not` |

- Les quatre boutons restent **toujours visibles** (découvrabilité, accessibilité) ; les flèches du
  clavier font la même chose.
- « Oui » et « Non » ont **le même style** : aucune couleur (vert/rouge) ni icône (✓/✕) ne suggère
  une bonne réponse. On écrit « Oui / Non », jamais « gauche / droite ».
- Swiper à droite évoque l'approbation (« j'aime ») et l'enchaînement rapide favorise le « oui » :
  **chaque affirmation a un miroir** (`mirrorOf`), formulé dans le sens inverse, sur la **même
  dimension** et avec la **même intensité**. Test : une personne cohérente ne peut pas répondre
  « Oui » aux deux cartes.
- **Une seule version par personne** (split-ballot) : chaque répondant voit l'une des deux versions
  d'une paire, tirée au hasard. Comparer les taux de « oui » entre les deux groupes mesure le biais
  d'acquiescement, sans faire répondre deux fois la même personne.
- **Cartes pour tous** : il n'y a pas d'option « Non concerné ». Chaque carte doit admettre une
  réponse pertinente de n'importe qui (retraité, étudiant, sans emploi, hébergé gratuitement…).
  Techniques : la tournure hypothétique (« Si j'avais besoin d'un médecin… »), la négation qui
  inclut les non-concernés (« je n'ai renoncé à aucun soin »), l'activité principale plutôt que
  le seul emploi.
- **Paquets de 12 cartes**, thèmes entremêlés dans un ordre aléatoire ; « Continuer » enchaîne un
  autre paquet, sans jamais remontrer une carte (ni son miroir) déjà répondue sur l'appareil.
- Les cartes de vécu indiquent une **période de référence** (« Au cours des 12 derniers mois »)
  quand elle est utile, et précisent ce qui est compté (« loyer ou prêt, charges comprises »).
- Une réponse donnée en moins d'une seconde est **marquée** (`isFast`), jamais rejetée.
- Paquets courts, progression visible, chaque réponse enregistrée tout de suite : on peut s'arrêter
  à tout moment.

## 5. Couverture des thèmes

Le QCM couvre largement la vie quotidienne et collective : par exemple pouvoir d'achat, emploi et
travail, logement, santé, éducation, environnement et climat, énergie, transports et mobilité,
services publics, sécurité et justice, démocratie et participation, numérique, solidarités, culture,
territoires, alimentation et agriculture, fiscalité. La liste évolue (entrée dans `DECISIONS.md`).

- Le choix d'inclure ou non un thème est lui-même un biais : il se justifie et se trace.
- Aucun thème n'est présenté comme plus important qu'un autre par l'interface. Chaque thème a
  **une seule** paire de priorité, à la formulation identique (« Les questions de … comptent
  beaucoup / peu pour moi aujourd'hui »), pour que les taux soient comparables entre thèmes.
- Un thème ne doit pas être traité uniquement par ses problèmes ni uniquement par ses atouts, ni
  sous un seul angle (par exemple le climat seulement comme menace, sans le poids ressenti des
  règles environnementales).
- S'inspirer des enquêtes de référence (INSEE, CREDOC, European Social Survey, World Values Survey,
  baromètres publics) et citer la source quand une formulation en est reprise.

## 6. Traçabilité

Chaque question porte :

- un identifiant stable et un numéro de version ;
- son thème et son type (vécu, perception, priorité, attente, solution) ;
- une justification courte (quel besoin elle cherche à mesurer) ;
- ses sources d'inspiration le cas échéant ;
- l'historique de ses revues de neutralité.

Une modification de formulation ou d'options crée une **nouvelle version** ; les deux versions ne
sont jamais agrégées ensemble sans le signaler.

Chaque thème appartient à une **catégorie** (vie quotidienne, travail et éducation, environnement,
vie collective, économie, défense) pour organiser l'analyse ; la catégorie n'est pas affichée.

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
