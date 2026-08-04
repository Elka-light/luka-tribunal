# Instructions pour les agents IA — LUKA TRIBUNAL

## Mission

Vous intervenez sur LUKA TRIBUNAL, une plateforme de géolocalisation des tribunaux pour enfants en République Démocratique du Congo.

Le projet comporte des enjeux judiciaires, institutionnels, géographiques, sociaux et de protection de l’enfant.

Votre rôle est d’assister le développement sans prendre de décision irréversible non autorisée.

## Documents obligatoires

Avant toute modification, consultez selon la tâche :

* `README.md`
* `docs/product/vision.md`
* `docs/product/scope.md`
* `docs/development/development-charter.md`
* `docs/security/security-baseline.md`
* `docs/architecture/overview.md`
* `docs/database/data-model.md`
* `docs/geospatial/geospatial-architecture.md`

Si un document nécessaire est vide ou absent, signalez-le avant de proposer une implémentation importante.

## Principes fondamentaux

Respectez :

* TypeScript strict ;
* KISS ;
* DRY ;
* séparation des responsabilités ;
* moindre privilège ;
* Security by Design ;
* Privacy by Design ;
* validation systématique ;
* migrations réversibles ;
* tests reproductibles ;
* documentation continue.

## Protection de l’enfant

Ne créez jamais de structure permettant de publier ou stocker dans le MVP :

* le nom d’un enfant ;
* l’identité d’une victime mineure ;
* l’identité d’un enfant en conflit avec la loi ;
* une plainte nominative ;
* un dossier judiciaire individuel ;
* les détails d’une affaire ;
* une donnée médicale ou sociale sensible ;
* une décision judiciaire confidentielle.

En cas de demande ambiguë, privilégiez la minimisation des données.

## Stack autorisée

### Web

* Next.js ;
* React ;
* TypeScript ;
* Tailwind CSS ;
* TanStack Query ;
* React Hook Form ;
* Zod ;
* Leaflet ;
* OpenStreetMap.

### API

* AdonisJS 6 ;
* TypeScript ;
* Lucid ORM ;
* VineJS ;
* Japa ;
* API REST.

### Données

* PostgreSQL ;
* PostGIS ;
* `geography(Point, 4326)` ;
* index GiST.

N’ajoutez aucune dépendance sans justification explicite.

## Avant toute modification

Vous devez :

1. reformuler l’objectif ;
2. présenter un plan court ;
3. lister les fichiers concernés ;
4. signaler les risques ;
5. identifier les documents lus ;
6. demander une clarification uniquement lorsqu’une erreur grave serait autrement probable.

## Pendant la modification

Vous devez :

* limiter les changements au périmètre demandé ;
* préserver la compatibilité ;
* éviter les refactorisations non demandées ;
* valider les entrées ;
* gérer les erreurs ;
* ne jamais écrire de secret ;
* ne jamais modifier `.env` avec des valeurs réelles ;
* ne jamais utiliser de données de production ;
* ne jamais modifier l’historique Git.

## Après la modification

Vous devez :

1. exécuter ou indiquer les tests pertinents ;
2. exécuter le lint ;
3. exécuter la vérification TypeScript ;
4. résumer les fichiers modifiés ;
5. signaler ce qui n’a pas été vérifié ;
6. proposer le message de commit ;
7. ne pas effectuer le commit sans autorisation ;
8. ne pas effectuer de push sans autorisation.

## Git

Ne jamais exécuter automatiquement :

```text
git add .
git commit
git push
git reset --hard
git clean -fd
git rebase
git checkout -- .
```

Toute commande destructive nécessite une autorisation explicite.

## Base de données

Toute modification de schéma doit passer par une migration.

Une migration doit :

* être explicite ;
* être réversible si possible ;
* ajouter les contraintes pertinentes ;
* ajouter les index nécessaires ;
* respecter PostgreSQL et PostGIS ;
* éviter la suppression irréversible de données.

## Géospatial

Vérifiez :

* latitude entre -90 et 90 ;
* longitude entre -180 et 180 ;
* SRID 4326 ;
* ordre des coordonnées ;
* présence d’un index spatial ;
* source et statut de vérification.

Ne calculez pas une distance géographique avec une formule simplifiée si PostGIS peut fournir une opération plus fiable.

## Sécurité

Vérifiez systématiquement :

* validation ;
* authentification ;
* autorisation ;
* exposition des données ;
* injection ;
* XSS ;
* CORS ;
* limitation des requêtes ;
* journalisation ;
* secrets ;
* données personnelles ;
* erreurs trop détaillées.

## UI et UX

L’interface doit être :

* mobile-first ;
* accessible ;
* simple ;
* rapide ;
* adaptée aux connexions limitées ;
* compréhensible sans connaissance technique ;
* neutre politiquement ;
* cohérente visuellement.

Les actions principales doivent porter un libellé texte et ne pas dépendre uniquement d’une icône.

## Définition de terminé

Une tâche n’est terminée que lorsque :

* le besoin est satisfait ;
* les critères d’acceptation sont respectés ;
* le code compile ;
* le lint réussit ;
* les types sont valides ;
* les tests concernés réussissent ;
* la documentation est mise à jour ;
* aucun secret ou donnée sensible n’est présent ;
* les limites sont clairement signalées.

