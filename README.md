
LUKA TRIBUNAL

Plateforme numérique de géolocalisation et d’information des tribunaux pour enfants en République Démocratique du Congo

Présentation

LUKA TRIBUNAL est une plateforme web destinée à faciliter l’identification, la localisation et l’accès aux informations pratiques relatives aux tribunaux pour enfants en République Démocratique du Congo.

Elle permettra aux citoyens, familles, avocats, magistrats, greffiers, travailleurs sociaux, organisations de protection de l’enfant, chercheurs et institutions publiques de trouver plus facilement une juridiction spécialisée depuis un ordinateur ou un smartphone.

Problème traité

Les informations concernant les tribunaux pour enfants sont souvent dispersées, incomplètes, difficiles à vérifier ou insuffisamment accessibles en ligne.

Un utilisateur peut rencontrer des difficultés pour :

identifier le tribunal compétent ;
trouver son adresse exacte ;
connaître son ressort territorial ;
obtenir ses contacts institutionnels ;
visualiser sa position sur une carte ;
obtenir un itinéraire fiable.

LUKA TRIBUNAL vise à répondre progressivement à ces difficultés par la création d’un référentiel national géolocalisé.

Vision

Créer une plateforme numérique nationale de référence, neutre, accessible et sécurisée permettant une meilleure orientation vers les juridictions spécialisées dans la protection de l’enfant en RDC.

Statut documentaire

Le cahier des charges actuel constitue la version 0.1 du projet.

Il définit principalement :

la vision générale ;
les objectifs ;
le public cible ;
les premières fonctionnalités ;
la stack envisagée ;
le calendrier initial.

Il sera progressivement remplacé par le dossier d’architecture version 1.0, situé dans le dossier docs/.

Ce dossier d’architecture devient progressivement la source de vérité pour :

la conception fonctionnelle ;
l’architecture logicielle ;
la base de données ;
la géolocalisation ;
la sécurité ;
les API ;
les tests ;
le déploiement ;
Codex et les autres assistants IA ;
les futurs développeurs et partenaires.
MVP expérimental

La première version devra permettre à environ dix utilisateurs de :

consulter une carte interactive ;
utiliser leur géolocalisation avec leur consentement ;
rechercher un tribunal par nom ;
rechercher par province ou ville ;
consulter la fiche d’une juridiction ;
voir son adresse et ses coordonnées ;
ouvrir un itinéraire ;
consulter ses contacts institutionnels ;
signaler une information incorrecte.
Éléments exclus du MVP

Le MVP ne contiendra pas :

de dossiers judiciaires individuels ;
de plaintes nominatives ;
de données personnelles concernant des enfants ;
de décisions judiciaires confidentielles ;
de chatbot juridique ;
de statistiques judiciaires sensibles ;
d’intelligence artificielle donnant des conseils juridiques personnalisés.
Protection de l’enfant

LUKA TRIBUNAL est un outil d’information et d’orientation.

La plateforme ne doit jamais publier ou stocker dans son MVP :

le nom d’un enfant ;
l’identité d’une victime mineure ;
l’identité d’un enfant en conflit avec la loi ;
le contenu d’une plainte ;
les détails d’une affaire en cours ;
une donnée médicale ou sociale sensible ;
un dossier judiciaire individuel.
Neutralité institutionnelle et politique

LUKA TRIBUNAL doit :

rester politiquement neutre ;
ne soutenir aucun parti politique ;
ne publier aucune publicité politique ;
appliquer les mêmes règles de validation dans toutes les provinces ;
afficher la source et la date de vérification des données ;
conserver un historique des modifications ;
distinguer les informations vérifiées des informations provisoires.
Technologies prévues
Frontend
Next.js ;
React ;
TypeScript ;
Tailwind CSS ;
TanStack Query ;
React Hook Form ;
Zod ;
Leaflet ;
OpenStreetMap.
Backend
AdonisJS 6 ;
TypeScript ;
Lucid ORM ;
VineJS ;
API REST ;
Japa.
Base de données et géospatial
PostgreSQL ;
PostGIS ;
système géographique WGS 84 ;
SRID 4326 ;
index spatiaux GiST.
Infrastructure
Git ;
GitHub ;
pnpm ;
Docker ;
Docker Compose ;
GitHub Actions ;
HTTPS ;
sauvegardes ;
journalisation ;
monitoring.
Structure prévue
luka-tribunal/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── config/
│   ├── types/
│   └── ui/
├── database/
│   ├── seeds/
│   └── reference-data/
├── docs/
├── docker/
├── scripts/
├── .github/
├── AGENTS.md
├── README.md
├── .gitignore
├── .env.example
├── package.json
└── pnpm-workspace.yaml
Documentation

Le dossier docs/ contient notamment :

la vision du produit ;
le périmètre ;
les personas ;
les user stories ;
les critères d’acceptation ;
l’architecture logicielle ;
le modèle de données ;
l’architecture géospatiale ;
la stratégie de sécurité ;
les conventions API ;
la stratégie de tests ;
la stratégie de déploiement ;
les décisions d’architecture.
Méthode de développement

Chaque fonctionnalité suit ce cycle :

analyse du besoin ;
rédaction de la user story ;
définition des critères d’acceptation ;
conception ;
développement ;
tests ;
revue du code ;
mise à jour de la documentation ;
validation ;
déploiement.
Utilisation de Codex

Codex agit comme assistant de développement.

Avant toute modification importante, il doit consulter :

README.md ;
AGENTS.md ;
les documents concernés dans docs/.

Tout code généré par une IA doit être relu, testé et validé avant d’être intégré.

Codex ne doit effectuer aucun commit ni aucun push sans autorisation explicite.

Sécurité

Le projet applique notamment :

Security by Design ;
Privacy by Design ;
validation systématique des entrées ;
contrôle d’accès côté serveur ;
moindre privilège ;
protection des secrets ;
HTTPS en production ;
journalisation des opérations administratives ;
sauvegardes régulières ;
absence de données personnelles sensibles dans GitHub.
Planification
Mois 1

MVP expérimental accessible à environ dix testeurs.

Mois 2

Administration, validation des données, sécurité renforcée et corrections.

Mois 3

Stabilisation, tests complets, documentation, sauvegardes, monitoring et préparation institutionnelle.

Avertissement

Les informations publiées par LUKA TRIBUNAL sont destinées à l’orientation générale.

Elles doivent être vérifiées auprès des autorités judiciaires compétentes.

La plateforme ne remplace pas une décision judiciaire, une autorité compétente ou le conseil d’un professionnel du droit.

État du projet
Version du produit : 0.1.0
Cahier des charges : 0.1
Dossier d’architecture : en préparation vers la version 1.0
Dépôt : privé pendant la phase expérimentale
