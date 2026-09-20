# Environnements du MVP

## Aperçu local

Lancement : `pnpm run build`, puis `pnpm run preview`.
Le script `scripts/preview.mjs` impose une configuration locale indépendante des
identifiants de production : web sur 127.0.0.1:3000, API sur 127.0.0.1:3333,
PostGIS sur 127.0.0.1:55432, base `luka_preview`, projet Compose `luka-preview`.
Le mot de passe fictif du conteneur local ne doit jamais être utilisé en ligne.
La clé applicative est générée en mémoire à chaque lancement, sans fichier `.env`.
Le redémarrage invalide donc les sessions locales. Aucun administrateur n'est créé.

Les ports 3000, 3333 et 55432 doivent être disponibles. Le script ne supprime aucun
volume. Ne pas réutiliser le projet Docker `luka-preview` pour des données réelles.
Les données fictives persistent entre les lancements ; le seed est idempotent.
Le build web doit utiliser `NEXT_PUBLIC_API_URL=http://localhost:3333` (valeur par défaut).
Après une modification du web, arrêter l'aperçu, refaire le build puis relancer.

## Test et pilote

Les tests utilisent un environnement distinct. Ne jamais les connecter à la production.
Pour le pilote, injecter les secrets via le gestionnaire de l'hébergeur et utiliser
`NODE_ENV=production`, une clé stable, une base dédiée et des origines HTTPS explicites.
`NEXT_PUBLIC_API_URL` est fixé au build web ; le changement d'URL exige un nouveau build.
L'hébergement et le domaine du pilote restent à choisir.
