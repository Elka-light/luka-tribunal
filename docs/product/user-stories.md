# User stories du MVP — LUKA TRIBUNAL

## 1. Objet et règles de priorité

Ce document traduit le périmètre du MVP expérimental en besoins livrables. Les
stories sont classées selon la méthode MoSCoW :

- **Must** : nécessaire pour ouvrir le test pilote ;
- **Should** : important, mais peut être simplifié si le délai de six jours est menacé ;
- **Could** : reporté après le pilote sans bloquer sa mise en ligne.

Toutes les stories respectent les interdictions de données définies dans le
périmètre. Aucun parcours ne collecte l'identité d'un enfant, une plainte, un
dossier individuel ou une donnée judiciaire, médicale ou sociale sensible.

## 2. Visiteur public

### US-PUB-01 — Comprendre le service — Must

En tant que visiteur, je veux comprendre dès l'accueil le rôle et les limites de
LUKA TRIBUNAL afin de savoir que le service fournit une orientation informative.

### US-PUB-02 — Rechercher une juridiction — Must

En tant que visiteur, je veux rechercher une juridiction par nom, province ou
ville afin d'obtenir une liste de résultats pertinents.

### US-PUB-03 — Utiliser les résultats sans carte — Must

En tant que visiteur, je veux consulter les résultats sous forme de liste afin
de continuer même si la carte ou ses tuiles sont indisponibles.

### US-PUB-04 — Visualiser les juridictions — Must

En tant que visiteur, je veux voir les juridictions publiées sur une carte afin
de comprendre leur localisation géographique.

### US-PUB-05 — Consulter une fiche — Must

En tant que visiteur, je veux ouvrir la fiche d'une juridiction afin de consulter
son adresse, ses contacts institutionnels publiables, sa source et son statut de
vérification.

### US-PUB-06 — Ouvrir un itinéraire externe — Must

En tant que visiteur, je veux ouvrir volontairement un service cartographique
externe avec la juridiction comme destination afin de préparer mon déplacement.

### US-PUB-07 — Choisir la géolocalisation — Must

En tant que visiteur, je veux autoriser ou refuser la géolocalisation afin de
centrer éventuellement la carte sans perdre l'accès aux autres fonctions.

### US-PUB-08 — Signaler une information — Must

En tant que visiteur, je veux signaler anonymement une information incorrecte
afin qu'un administrateur puisse la vérifier sans modifier automatiquement la
fiche publique.

### US-PUB-09 — Comprendre les erreurs — Must

En tant que visiteur, je veux recevoir des états de chargement, d'absence de
résultat et d'erreur compréhensibles afin de savoir comment poursuivre.

## 3. Administrateur autorisé

### US-ADM-01 — Se connecter — Must

En tant qu'administrateur autorisé, je veux m'authentifier afin d'accéder aux
opérations non publiques. Aucun compte ne peut être créé depuis l'interface
publique.

### US-ADM-02 — Gérer une juridiction pilote — Must

En tant qu'administrateur, je veux créer et corriger une juridiction pilote avec
sa source, ses coordonnées et son statut afin de maintenir le référentiel.

### US-ADM-03 — Contrôler la publication — Must

En tant qu'administrateur, je veux publier explicitement une fiche validée afin
qu'aucun brouillon ni signalement ne devienne public automatiquement.

### US-ADM-04 — Traiter les signalements — Should

En tant qu'administrateur, je veux consulter puis classer un signalement afin de
documenter son traitement sans exposer son texte au public.

### US-ADM-05 — Tracer les actions — Must

En tant que responsable du service, je veux conserver une trace minimale des
actions administratives importantes afin de pouvoir identifier qui a créé,
modifié ou publié une fiche.

## 4. Exploitation

### US-OPS-01 — Charger des données pilotes — Must

En tant qu'équipe projet, nous voulons importer un petit jeu de juridictions
fictives ou institutionnellement vérifiées afin de tester le produit sans
introduire de données sensibles ou non autorisées.

### US-OPS-02 — Exploiter le service en sécurité — Must

En tant qu'équipe projet, nous voulons disposer de variables d'environnement
documentées, de migrations réversibles, de contrôles de santé et de journaux sans
données sensibles afin d'exploiter le pilote de manière reproductible.

### US-OPS-03 — Vérifier la qualité — Must

En tant qu'équipe projet, nous voulons automatiser le lint, les types, les tests
et le build afin d'empêcher la livraison d'une version techniquement invalide.

## 5. Stories reportées après le pilote

- recherche approximative avancée et classement géospatial par distance ;
- plusieurs rôles administratifs et workflow d'approbation multi-acteurs ;
- tableau de bord analytique ;
- import en masse depuis des sources externes ;
- multilingue, mode hors connexion et application native ;
- API publique et intégrations partenaires.

Ces stories ne doivent pas être intégrées implicitement au MVP de six jours.
