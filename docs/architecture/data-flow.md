# Flux de données du MVP

## Consultation

Navigateur → Web → API → PostgreSQL. L'API ne renvoie que les fiches publiées et les
contacts marqués publics. La carte charge ensuite des tuiles externes seulement si le
composant est affiché.

## Géolocalisation

Navigateur → API de géolocalisation du navigateur → mémoire du composant Leaflet.
Aucune écriture, aucun log et aucun appel à l'API LUKA TRIBUNAL.

## Signalement

Navigateur → validation API et limitation → table interne `reports` → traitement
administratif → audit. Aucun changement automatique de la fiche publique.

## Administration

Navigateur → origine contrôlée → session → autorisation → transaction métier et audit.
Les mots de passe sont hachés ; cookies, mots de passe et corps de signalement ne sont
pas écrits dans les journaux techniques.
