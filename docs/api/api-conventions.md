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
