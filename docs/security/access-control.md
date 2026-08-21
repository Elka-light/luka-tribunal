# Contrôle d'accès du MVP

La consultation des juridictions publiées et la création d'un signalement sont
publiques. Il n'existe ni inscription ni compte visiteur.

Le rôle unique `administrator` utilise le guard session officiel d'AdonisJS. Le cookie
est `HttpOnly`, `SameSite=Lax` et `Secure` en production. Toutes les routes sous
`/api/v1/admin`, sauf la création de session, appliquent le middleware d'authentification
côté serveur. Un compte inactif ne peut pas ouvrir de session.

L'administrateur peut créer un brouillon, publier une fiche vérifiée, consulter et
classer les signalements. Création, publication et traitement produisent un audit.
Le premier compte est créé uniquement lors du seed avec `ADMIN_EMAIL` et
`ADMIN_PASSWORD` fournis hors Git ; aucune valeur par défaut n'est définie.
