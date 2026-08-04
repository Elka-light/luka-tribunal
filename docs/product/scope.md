# Périmètre du MVP — LUKA TRIBUNAL

## 1. Identification du document

- Produit : LUKA TRIBUNAL
- Version documentaire : 1.0
- Statut : référence pour le MVP expérimental
- Phase : conception
- Pays couvert : République Démocratique du Congo

## 2. Objet

Ce document fixe le périmètre fonctionnel et non fonctionnel du premier MVP de LUKA TRIBUNAL. Il complète la vision produit et sert de limite de référence pour les user stories, l'architecture, le modèle de données, les API, les tests et le déploiement.

Le MVP est un service d'information et d'orientation. Il ne rend aucune décision judiciaire, ne détermine pas juridiquement la juridiction compétente et ne fournit aucun conseil juridique personnalisé.

## 3. Objectif du MVP

Permettre à un groupe pilote d'environ dix personnes de rechercher, localiser et consulter les informations pratiques de tribunaux pour enfants sélectionnés en RDC depuis un smartphone ou un ordinateur.

Le MVP doit permettre de vérifier trois hypothèses principales :

1. les utilisateurs trouvent plus facilement une juridiction spécialisée ;
2. les informations géographiques et institutionnelles présentées sont compréhensibles et utiles ;
3. un processus simple permet de signaler puis de corriger une information inexacte.

## 4. Utilisateurs concernés

### 4.1 Visiteurs publics

Toute personne consultant les informations publiques, notamment un citoyen, un membre d'une famille, un avocat, un professionnel de la justice, un travailleur social, une organisation de protection de l'enfant, un chercheur ou une institution.

La consultation publique ne nécessite pas de compte utilisateur dans le MVP.

### 4.2 Administrateurs autorisés

Un nombre limité de personnes explicitement autorisées peut créer, corriger, vérifier et publier les données relatives aux juridictions pilotes.

Les règles détaillées d'authentification, d'autorisation et de traçabilité seront définies dans les documents de sécurité avant l'implémentation de l'administration.

## 5. Parcours public principal

Un visiteur doit pouvoir :

1. ouvrir la plateforme sans créer de compte ;
2. rechercher une juridiction par son nom, sa province ou sa ville ;
3. consulter les résultats sous forme de liste et sur une carte ;
4. ouvrir la fiche d'une juridiction ;
5. consulter son adresse, ses coordonnées, ses contacts institutionnels disponibles et son statut de vérification ;
6. ouvrir un itinéraire dans un service cartographique externe ;
7. signaler une information potentiellement incorrecte.

Le refus de la géolocalisation ne doit bloquer aucun autre parcours public.

## 6. Fonctionnalités incluses

### 6.1 Accueil et orientation

- présentation concise du service ;
- avertissement indiquant que les informations doivent être confirmées auprès des autorités compétentes ;
- accès direct à la recherche et à la carte ;
- expérience mobile-first et compatible avec une connexion limitée.

### 6.2 Recherche et filtrage

- recherche par nom officiel ou nom couramment utilisé d'une juridiction ;
- filtre par province ;
- filtre par ville ou localité disponible ;
- résultats compréhensibles même sans afficher la carte ;
- état explicite lorsqu'aucun résultat n'est trouvé.

Le MVP ne garantit pas la détermination automatique de la compétence territoriale ou matérielle d'un tribunal.

### 6.3 Carte

- affichage des juridictions pilotes sur une carte OpenStreetMap avec Leaflet ;
- marqueurs différenciables et accessibles ;
- sélection d'un marqueur donnant accès à la fiche correspondante ;
- fonctionnement dégradé sous forme de liste lorsque la carte ou les tuiles ne sont pas disponibles.

### 6.4 Géolocalisation de l'utilisateur

- demande de consentement explicite via les mécanismes du navigateur ;
- utilisation de la position uniquement pour centrer la carte ou faciliter l'orientation immédiate ;
- absence de conservation de la position précise dans le MVP ;
- aucune transmission de cette position dans les journaux applicatifs ;
- possibilité de refuser ou retirer l'autorisation sans perdre l'accès au service.

### 6.5 Fiche d'une juridiction

Une fiche publique peut présenter uniquement les données institutionnelles utiles et disponibles :

- nom officiel ;
- éventuel nom usuel ou variante de recherche ;
- type de juridiction ;
- province ;
- ville, commune, territoire ou localité selon la source ;
- adresse descriptive ;
- latitude et longitude du bâtiment ou du point institutionnel ;
- contacts institutionnels publiables ;
- ressort territorial sous forme informative lorsqu'il est documenté ;
- source de l'information ;
- date de collecte ou de vérification ;
- statut de validation ;
- avertissement sur la portée informative du service.

### 6.6 Itinéraire

- ouverture volontaire d'un lien vers un service cartographique externe ;
- utilisation des coordonnées de la juridiction comme destination ;
- information claire indiquant que l'itinéraire dépend d'un service tiers.

Le MVP ne calcule ni ne stocke lui-même un historique d'itinéraire.

### 6.7 Signalement d'une information

- formulaire permettant de sélectionner la juridiction concernée ;
- choix d'une catégorie d'erreur ;
- description textuelle courte et limitée ;
- confirmation de réception sans promesse de correction immédiate ;
- validation, limitation de fréquence et protection contre les soumissions automatisées abusives ;
- traitement manuel avant toute modification d'une donnée publique.

Le signalement public est anonyme dans le MVP. Il ne doit demander ni nom, ni numéro de téléphone, ni adresse électronique, ni information concernant un enfant ou une affaire judiciaire. Un avertissement doit demander explicitement de ne saisir aucune donnée personnelle ou judiciaire sensible dans le champ libre.

### 6.8 Administration minimale

- authentification des administrateurs autorisés ;
- création et modification d'une juridiction pilote ;
- validation explicite avant publication ;
- consultation et traitement des signalements ;
- conservation d'un historique des actions administratives importantes ;
- distinction entre brouillon, donnée à vérifier et donnée publiée.

Aucune donnée non vérifiée ne doit être publiée automatiquement à la suite d'un signalement.

## 7. Données strictement interdites

Le MVP ne doit ni collecter, ni stocker, ni publier :

- le nom ou l'identité d'un enfant ;
- l'identité d'une victime mineure ;
- l'identité d'un enfant en conflit avec la loi ;
- une plainte nominative ;
- le contenu ou les détails d'une affaire judiciaire ;
- un numéro de dossier individuel ;
- une décision judiciaire confidentielle ;
- une donnée médicale, sociale ou familiale sensible ;
- la position géographique persistante d'un visiteur ;
- une pièce d'identité ou un document judiciaire téléversé.

Le MVP ne comporte aucun téléversement public de fichier.

## 8. Éléments explicitement exclus

- application mobile native ;
- mode hors connexion complet ;
- création de comptes pour les visiteurs ;
- espace personnel public ;
- dépôt ou suivi d'une plainte ;
- gestion de dossiers judiciaires ;
- prise de rendez-vous ;
- paiement ;
- messagerie avec un tribunal ;
- notifications push ;
- chatbot ou conseil juridique personnalisé ;
- statistiques judiciaires sensibles ;
- publication automatique de contributions publiques ;
- API publique ouverte ;
- détermination automatique et juridiquement opposable de la compétence ;
- calcul interne d'itinéraires ;
- collecte analytique permettant d'identifier ou de suivre individuellement un visiteur ;
- extension aux autres catégories de juridictions sans décision documentaire préalable.

## 9. Contraintes non fonctionnelles

### 9.1 Sécurité et confidentialité

- validation systématique des entrées côté serveur ;
- authentification et autorisation contrôlées côté serveur ;
- principe du moindre privilège ;
- protection contre l'injection, le XSS, le CSRF lorsque applicable et les abus de requêtes ;
- secrets exclus du dépôt et des réponses publiques ;
- erreurs publiques sans détails internes ;
- journaux sans données sensibles ;
- HTTPS obligatoire en production ;
- CORS limité aux origines autorisées ;
- traçabilité des actions administratives ;
- minimisation et durée de conservation documentée des données.

### 9.2 Accessibilité et utilisabilité

- conception mobile-first ;
- navigation utilisable au clavier ;
- libellés textuels pour les actions principales ;
- contraste et structure sémantique suffisants ;
- carte non indispensable pour accéder aux informations ;
- textes compréhensibles sans connaissance technique ou juridique avancée.

### 9.3 Performance et résilience

- pages publiques légères et utilisables sur connexion limitée ;
- chargement différé des éléments cartographiques lorsque pertinent ;
- pagination ou limitation explicite des résultats ;
- comportement compréhensible lorsque l'API, la géolocalisation ou les tuiles cartographiques sont indisponibles ;
- absence de dépendance à la géolocalisation pour effectuer une recherche.

### 9.4 Neutralité et fiabilité

- présentation politiquement et institutionnellement neutre ;
- mêmes règles de validation pour toutes les provinces ;
- affichage de la source, du statut et de la date de vérification lorsque disponibles ;
- distinction visible entre donnée vérifiée, donnée provisoire et donnée obsolète ;
- aucune interprétation éditoriale d'une décision judiciaire.

## 10. Critères de sortie du MVP

Le MVP peut être présenté aux testeurs lorsque :

1. les juridictions pilotes validées sont consultables sur mobile et ordinateur ;
2. la recherche par nom, province et ville fonctionne ;
3. chaque résultat peut être consulté sans dépendre exclusivement de la carte ;
4. la géolocalisation peut être acceptée ou refusée sans bloquer le service ;
5. un itinéraire externe peut être ouvert vers une juridiction ;
6. un signalement anonyme peut être envoyé sans collecter de donnée personnelle ;
7. seules les données validées sont publiées ;
8. les contrôles d'accès administratifs sont testés ;
9. les entrées, erreurs et limites de requêtes sont testées ;
10. aucun secret, donnée concernant un enfant ou donnée judiciaire individuelle n'est présent ;
11. le lint, la vérification TypeScript, les tests concernés et le build réussissent ;
12. les documents d'architecture, de sécurité, de données, d'API, de tests et de déploiement nécessaires sont à jour.

## 11. Indicateurs d'expérimentation

Pendant le test pilote, l'équipe peut mesurer uniquement des indicateurs agrégés et minimisés, par exemple :

- réussite ou échec des parcours de recherche lors des sessions de test encadrées ;
- temps approximatif nécessaire pour trouver une juridiction ;
- nombre agrégé de recherches sans résultat ;
- nombre agrégé de signalements reçus et traités ;
- retours qualitatifs volontaires des testeurs, conservés hors de toute donnée concernant un enfant ou une affaire.

Toute solution d'analytique persistante devra être évaluée dans la baseline de sécurité et la politique de protection des données avant son intégration.

## 12. Dépendances et décisions restantes

Les éléments suivants doivent être décidés dans les documents ultérieurs avant leur implémentation :

- liste et nombre exacts des juridictions pilotes ;
- sources institutionnelles autorisées et méthode de vérification ;
- rôles administratifs précis ;
- méthode d'authentification administrative ;
- durées de conservation des signalements et journaux ;
- hébergement, sauvegardes et supervision ;
- politique d'utilisation des tuiles OpenStreetMap en production ;
- service externe utilisé pour l'ouverture des itinéraires ;
- langues de l'interface du premier test ;
- niveaux et libellés exacts du statut de validation.

Ces décisions ne doivent pas élargir implicitement le périmètre défini ici. Toute extension substantielle doit être documentée et validée avant développement.
