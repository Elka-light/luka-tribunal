# Personas du MVP — LUKA TRIBUNAL

## 1. Identification du document

- Produit : LUKA TRIBUNAL
- Version documentaire : 1.0
- Statut : référence pour le MVP expérimental
- Phase : conception
- Pays couvert : République Démocratique du Congo

## 2. Objet

Ce document décrit les principaux profils d'utilisateurs du MVP. Les personas sont des profils-types destinés à guider la conception, les critères d'acceptation et les tests utilisateurs. Ils ne représentent aucune personne réelle et ne doivent pas servir à collecter des données personnelles.

Les besoins présentés restent limités au service d'information et d'orientation défini dans le périmètre du MVP. LUKA TRIBUNAL ne fournit pas de conseil juridique personnalisé, ne détermine pas juridiquement la juridiction compétente et ne traite aucun dossier judiciaire individuel.

## 3. Principes communs

Tous les visiteurs publics doivent pouvoir :

- utiliser le service sans créer de compte ;
- rechercher une juridiction sans autoriser la géolocalisation ;
- consulter les résultats sous forme de liste, même si la carte est indisponible ;
- comprendre la source, la date et le statut de vérification des informations ;
- ouvrir volontairement un itinéraire dans un service externe ;
- signaler anonymement une information potentiellement incorrecte ;
- utiliser une interface mobile-first, accessible et adaptée aux connexions limitées.

Aucun parcours ne doit demander l'identité d'un enfant, les détails d'une affaire, un numéro de dossier ou une autre donnée judiciaire, médicale, sociale ou familiale sensible.

## 4. Persona principal — Visiteur cherchant une juridiction

### Profil

Personne du public utilisant principalement un smartphone et souhaitant trouver un tribunal pour enfants ou vérifier ses informations pratiques. Son niveau de familiarité avec les outils numériques et le vocabulaire judiciaire peut être limité.

### Objectifs

- trouver rapidement une juridiction à partir d'un nom, d'une province ou d'une ville ;
- reconnaître le bon résultat sans devoir interpréter des termes techniques ;
- consulter une adresse et des contacts institutionnels disponibles ;
- ouvrir un itinéraire vers le lieu indiqué ;
- savoir si les informations sont vérifiées et à quelle date.

### Difficultés possibles

- connexion mobile lente ou instable ;
- petit écran ou appareil peu performant ;
- orthographe approximative du nom recherché ;
- refus ou indisponibilité de la géolocalisation ;
- méconnaissance de l'organisation judiciaire ;
- informations institutionnelles anciennes ou incomplètes.

### Besoins de conception

- recherche visible dès l'accueil ;
- libellés simples et actions principales accompagnées de texte ;
- résultats utilisables sans carte ;
- état explicite lorsqu'aucun résultat n'est trouvé ;
- avertissement clair sur la portée informative du service ;
- absence de blocage lorsque la géolocalisation est refusée.

### Critère de réussite principal

Le visiteur atteint une fiche de juridiction pertinente en trois actions principales maximum et comprend comment vérifier l'information auprès de l'institution concernée.

## 5. Persona secondaire — Professionnel de l'orientation

### Profil

Avocat, travailleur social, membre d'une organisation de protection de l'enfant, agent institutionnel, chercheur ou autre professionnel recherchant une information fiable pour orienter une personne ou préparer une démarche institutionnelle.

### Objectifs

- rechercher une juridiction par nom officiel, nom usuel ou zone géographique ;
- distinguer une donnée publiée et vérifiée d'une donnée provisoire ou obsolète ;
- consulter la source et la date de vérification ;
- confirmer un contact institutionnel ou une adresse ;
- signaler une erreur constatée sans transmettre de donnée sensible.

### Difficultés possibles

- variantes de noms pour une même juridiction ;
- limites territoriales décrites de manière hétérogène ;
- nécessité de vérifier rapidement l'origine d'une information ;
- risque qu'un champ libre soit utilisé pour transmettre des informations concernant une personne ou une affaire.

### Besoins de conception

- présentation structurée des informations institutionnelles ;
- affichage explicite de la provenance, du statut et de la fraîcheur des données ;
- avertissement indiquant que le ressort affiché est informatif ;
- formulaire de signalement court, catégorisé et accompagné d'une interdiction claire de saisir des données personnelles ou judiciaires ;
- confirmation de réception sans promesse de correction immédiate.

### Critère de réussite principal

Le professionnel peut évaluer la fiabilité d'une fiche et, si nécessaire, transmettre un signalement anonyme ne contenant aucune donnée personnelle ou judiciaire sensible.

## 6. Persona opérationnel — Administrateur autorisé

### Profil

Membre d'un groupe restreint explicitement habilité à gérer les données des juridictions pilotes et à traiter les signalements. Ce persona n'est pas un visiteur public et ses actions doivent être authentifiées, autorisées et tracées côté serveur.

### Objectifs

- créer ou corriger la fiche d'une juridiction pilote ;
- conserver la source et les informations de vérification ;
- distinguer un brouillon, une donnée à vérifier et une donnée publiée ;
- examiner puis traiter manuellement les signalements ;
- publier uniquement une information validée ;
- retrouver l'historique des actions administratives importantes.

### Difficultés possibles

- sources institutionnelles incomplètes ou contradictoires ;
- inversion possible de la latitude et de la longitude ;
- erreurs de saisie ou publication prématurée ;
- signalements contenant malgré les avertissements des données interdites ;
- risque d'accès non autorisé ou de privilèges excessifs.

### Besoins de conception

- authentification et autorisation contrôlées côté serveur ;
- rôles et permissions appliquant le moindre privilège ;
- validation stricte des champs, coordonnées et transitions de statut ;
- étape explicite de validation avant publication ;
- journalisation des actions sans secret ni donnée sensible ;
- procédure documentée pour gérer un signalement contenant une donnée interdite.

### Critère de réussite principal

L'administrateur peut publier une information vérifiée sans qu'une contribution publique modifie automatiquement les données visibles et sans contourner les contrôles d'accès ou de validation.

## 7. Persona transversal — Utilisateur en conditions d'accès contraintes

Ce profil transversal peut concerner chacun des visiteurs précédents. Il utilise un écran de petite taille, une connexion lente ou intermittente, un navigateur ne donnant pas accès à la géolocalisation, ou navigue principalement au clavier.

Ses besoins imposent notamment :

- des pages publiques légères ;
- une structure sémantique et des libellés compréhensibles ;
- une navigation au clavier ;
- une liste indépendante de la carte ;
- des états de chargement et d'erreur explicites ;
- aucun parcours essentiel dépendant de la géolocalisation ou des tuiles cartographiques.

Ce persona transversal ne justifie pas la création d'un mode hors connexion complet, exclu du MVP.

## 8. Anti-personas et usages non couverts

Le MVP n'est pas conçu pour :

- une personne souhaitant déposer ou suivre une plainte ;
- un justiciable souhaitant obtenir un avis juridique personnalisé ;
- un utilisateur souhaitant transmettre un dossier, une décision ou une pièce d'identité ;
- un visiteur souhaitant créer un compte ou un espace personnel ;
- un partenaire souhaitant consommer une API publique ;
- un acteur souhaitant publier automatiquement des données non vérifiées ;
- un utilisateur souhaitant déterminer de manière juridiquement opposable la compétence d'un tribunal ;
- un acteur politique souhaitant promouvoir une opinion, une institution ou une province.

Ces usages doivent être refusés ou réorientés par des messages clairs sans collecter d'information supplémentaire.

## 9. Priorisation pour le MVP

1. Le visiteur cherchant une juridiction constitue le persona principal du parcours public.
2. Le professionnel de l'orientation apporte les exigences de fiabilité et de traçabilité des informations.
3. L'administrateur autorisé garantit que seules des données validées deviennent publiques.
4. Les contraintes d'accès s'appliquent transversalement à toute l'expérience publique.

Cette priorisation ne permet pas de sacrifier la sécurité, la protection de l'enfant, l'accessibilité de base ou la disponibilité d'une liste indépendante de la carte.

## 10. Hypothèses à valider pendant l'expérimentation

Les tests auprès du groupe pilote doivent permettre de vérifier, sans recueillir de donnée sensible :

- si les catégories de recherche correspondent aux termes compris par les visiteurs ;
- si une fiche peut être atteinte en trois actions principales maximum ;
- si le statut et la date de vérification sont compris ;
- si le refus de géolocalisation laisse le parcours pleinement utilisable ;
- si la liste constitue une solution de repli suffisante lorsque la carte échoue ;
- si l'avertissement du formulaire empêche la saisie de données personnelles ou judiciaires ;
- si les administrateurs comprennent les états de validation et la responsabilité associée à la publication.

Les retours doivent rester volontaires, minimisés et indépendants de toute identité d'enfant ou affaire judiciaire.

## 11. Questions restant à décider

Avant de détailler les parcours administratifs et les tests associés, les documents concernés devront préciser :

- les rôles administratifs et leurs permissions exactes ;
- la méthode d'authentification ;
- les sources institutionnelles autorisées ;
- les niveaux et libellés des statuts de validation ;
- les langues utilisées pendant le premier test ;
- la procédure et la durée de conservation des signalements ;
- les règles de traitement d'une contribution contenant une donnée interdite.

Ces décisions devront être documentées dans les sections produit, sécurité, données et architecture avant leur implémentation.
