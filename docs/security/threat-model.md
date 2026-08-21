# Modèle de menaces du MVP — LUKA TRIBUNAL

## Actifs et frontières

Les actifs protégés sont les comptes administratifs, brouillons, signalements, audits,
sources institutionnelles et secrets techniques. Le navigateur public, le Web Next.js,
l'API AdonisJS, PostgreSQL/PostGIS et les services cartographiques constituent des
frontières distinctes. Le navigateur ne contacte jamais directement la base.

## Menaces prioritaires et contrôles

| Menace | Impact | Contrôles MVP |
|---|---|---|
| publication d'un brouillon | désinformation | statut serveur, date/source requises, confirmation, audit |
| accès administratif non autorisé | altération du référentiel | session HttpOnly, middleware serveur, compte actif |
| CSRF ou origine hostile | mutation avec session volée | origine exacte, en-tête non simple, SameSite, CORS restreint |
| force brute | compromission de compte | erreur générique, hachage scrypt, limite et blocage |
| XSS par texte libre | vol de session | React échappe le texte, aucune insertion HTML, CSP |
| injection SQL | perte ou fuite | VineJS, requêtes paramétrées, contraintes SQL |
| abus de signalement | saturation | catégorie fermée, 1 000 caractères, cinq soumissions/heure |
| fuite dans les logs | atteinte à la vie privée | corps, cookies, secrets et positions exclus |
| inversion de coordonnées | mauvaise orientation | bornes, ordre documenté, tests et PostGIS |
| panne de tuiles | indisponibilité du parcours | liste indépendante de la carte |
| donnée interdite dans un commentaire | préjudice à un enfant | avertissement, accès restreint, procédure de suppression |

## Risques résiduels

Le store de limitation en mémoire suppose une seule instance API. Il ne garantit pas
une limite globale après redémarrage ou mise à l'échelle. Avant plusieurs instances,
un store Redis ou PostgreSQL partagé et isolé est obligatoire. L'authentification du
pilote ne comprend pas encore MFA ni récupération autonome. Le fournisseur de tuiles
reçoit l'adresse réseau du visiteur lorsque la carte est chargée.

L'API utilise AdonisJS 7 afin d'intégrer le correctif de `GHSA-6qvv-pj99-48qm`.
L'application n'accepte par ailleurs aucune cible de redirection fournie par
l'utilisateur : l'authentification API utilise uniquement des chemins constants et
les erreurs sont rendues en JSON.

## Revue

Le modèle est revu avant le pilote public, après tout changement d'hébergement,
d'authentification, de fournisseur cartographique ou de nature des données traitées.
