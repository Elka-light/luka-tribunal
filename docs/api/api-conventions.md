# Conventions API du MVP

L'API REST est préfixée par `/api/v1`, échange du JSON et valide toutes les entrées
avec VineJS. Les réponses de succès utilisent `{ "data": ... }`; les listes ne
contiennent que les juridictions publiées et non archivées.

Endpoints publics : `GET /jurisdictions`, `GET /jurisdictions/:slug` et
`POST /reports`. Le signalement est anonyme, limité en fréquence et ne modifie jamais
une fiche. Endpoints administratifs : session, juridictions et signalements sous
`/admin`; ils exigent une session valide côté serveur.

Les coordonnées sont retournées avec les propriétés explicites `latitude` et
`longitude`. Les dates métier sont au format `YYYY-MM-DD`, les horodatages en ISO 8601.
Les paramètres de recherche sont limités et les résultats plafonnés à 50.

## Pagination de la carte publique

`GET /api/v1/jurisdictions` accepte `limit` (entier 1 à 50, défaut 20) et `offset`
(entier 0 à 100000, défaut 0). La réponse conserve `data` et ajoute
`meta.nextOffset` (entier ou null à la dernière page). L'ordre est nom puis UUID.
Le web charge toutes les pages pour éviter une carte limitée silencieusement aux
20 premiers résultats. Les filtres et l'exclusion des brouillons restent identiques.
La pagination par offset n'est pas un instantané en cas d'édition concurrente.
