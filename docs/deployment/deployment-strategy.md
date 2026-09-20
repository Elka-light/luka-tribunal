# Préparation de la mise en ligne pilote

## État au 19 septembre 2026

Un aperçu local avec PostgreSQL/PostGIS et données fictives est disponible via
`pnpm run preview`, après build. Ce lancement sert à la revue du produit ; il ne
constitue pas un déploiement public. Aucun hébergeur ou domaine n'est configuré ici.

## Ordre de livraison

1. Examiner l'accueil, la recherche, la fiche, la carte et le signalement en local.
2. Consigner et corriger les retours visuels et fonctionnels.
3. Compléter la recette des critères de `docs/product/acceptance-criteria.md`,
   notamment mobile, clavier, publication et comptes inactifs.
4. Choisir hébergement, domaine, administrateur pilote et données autorisées.
5. Préparer HTTPS, secrets, accès privé à PostgreSQL, sauvegarde et restauration.
6. Exécuter lint, TypeScript, tests, build et audit des dépendances en CI.
7. Déployer en préproduction, vérifier les parcours réels et ouvrir aux dix testeurs
   seulement après validation des critères bloquants.

## Configuration de déploiement à respecter

- Node.js 24 et dépendances installées depuis le lockfile.
- Web : `pnpm --filter web build`, puis `pnpm --filter web start`.
- API : `pnpm --filter api build`, installer les dépendances de production dans
  `apps/api/build`, puis lancer `node bin/server.js` depuis ce dossier.
- Injecter les variables décrites dans `apps/api/.env.example`, sans reprendre ses
  valeurs factices. Configurer l'URL publique de l'API avant le build web.
- Fournir web et API sur des origines HTTPS compatibles avec les cookies SameSite,
  et configurer CORS avec l'origine exacte du web.
- Exécuter les migrations avec un rôle dédié, avant ouverture du trafic.
- Ne pas lancer le script d'aperçu ni charger automatiquement son seed en production.
- Sauvegarder avant migration ; tester une restauration sur une base séparée.
  Le stockage, la fréquence et la rétention des sauvegardes restent à définir
  avec l'hébergeur. Ne pas utiliser une migration descendante comme retour arrière
  automatique lorsqu'elle supprimerait des données.
- Contrôler `/health` et une lecture réelle des juridictions : `/health` seul ne
  vérifie pas la connexion à PostgreSQL.

## Limites encore ouvertes

La carte commune et les itinéraires à pied, à vélo et en voiture sont implémentés.
Les modes moto et train restent indisponibles ; valider le service externe et ses
conditions de confidentialité et de charge avant le pilote. L'aperçu ne crée pas de compte administrateur. Les tests existants ne
remplacent pas la recette de bout en bout, mobile et accessibilité. Les politiques
de tuiles/itinéraires, la restauration et la configuration HTTPS doivent être
validées avant le pilote. La vérification TypeScript séparée reste obligatoire,
car le build Next.js actuel ignore les erreurs de types.
