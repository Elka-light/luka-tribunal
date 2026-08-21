# Vue d'ensemble de l'architecture — LUKA TRIBUNAL

## Statut

- Version : 1.0
- Statut : architecture de référence du socle MVP

## Architecture retenue

Le produit est un monorepo pnpm composé de deux applications déployables séparément :

- `apps/web` : Next.js, React, TypeScript strict et Tailwind CSS ;
- `apps/api` : API REST AdonisJS 7, VineJS, Lucid ORM et Japa ;
- PostgreSQL/PostGIS : source de vérité des données métier et géographiques.

Le navigateur appelle uniquement l'API. Il n'accède jamais directement à la base.
Les paquets partagés restent réservés à des besoins démontrés afin d'éviter une
abstraction prématurée.

## Séparation des responsabilités

- Web : présentation, accessibilité, état d'interface, consentement de géolocalisation ;
- API : validation, règles métier, authentification, autorisation et erreurs publiques ;
- base : intégrité relationnelle, contraintes de publication et opérations PostGIS ;
- proxy : HTTPS, limites de corps et première couche de limitation de requêtes.

Les règles de sécurité ne dépendent jamais du Web. La liste publique reste utilisable
sans Leaflet et sans géolocalisation.

## Flux public minimal

1. le Web demande une liste publiée à l'API ;
2. l'API valide les filtres et interroge PostgreSQL ;
3. l'API extrait latitude et longitude du point PostGIS ;
4. le Web affiche d'abord une liste puis, si disponible, une carte ;
5. la position éventuelle du visiteur reste dans son navigateur.

## Flux administratif

L'administrateur s'authentifie auprès de l'API au moyen d'une session courte dans un
cookie sécurisé. Chaque mutation est validée, autorisée, exécutée dans une transaction
et accompagnée d'un audit. Aucun signalement ne publie automatiquement une donnée.

## Déploiement et limites du socle

Les environnements sont configurés par variables. PostgreSQL n'est pas exposé sur
Internet. Le développement local utilise Docker Compose et des données fictives.
Le socle fournit les applications, la connexion PostgreSQL, les migrations, un
contrôle de santé et la chaîne qualité. La recherche, la carte, le signalement et
l'administration minimale du MVP sont implémentés. La mise en ligne reste conditionnée
aux décisions d'exploitation, aux données pilotes autorisées et à la recette finale.
