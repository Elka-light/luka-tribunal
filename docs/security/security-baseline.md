# Baseline de sécurité du MVP — LUKA TRIBUNAL

## 1. Objectif et portée

Cette baseline définit les contrôles minimaux exigés avant tout test pilote. Elle
s'applique au Web Next.js, à l'API AdonisJS, à PostgreSQL/PostGIS, aux traitements
d'administration et au déploiement.

Le MVP traite des informations institutionnelles publiques et des données internes
d'administration. Il ne doit traiter aucune identité d'enfant, affaire individuelle,
plainte nominative, donnée médicale ou sociale sensible, pièce jointe publique ou
position persistante d'un visiteur.

## 2. Classification

| Classe | Exemples | Accès |
|---|---|---|
| Public | juridiction publiée, contact public, source | lecture publique |
| Interne | brouillon, signalement, audit | administrateurs autorisés |
| Secret | mot de passe, clé d'application, cookie de session | runtime uniquement |
| Interdit | identité d'enfant, dossier, position persistante | ne pas collecter |

Une donnée interdite reçue malgré les avertissements est isolée de l'affichage, son
accès est restreint, l'incident est signalé au responsable et la donnée est supprimée
selon une procédure tracée dès que possible.

## 3. Authentification et sessions

- aucun compte visiteur dans le MVP ;
- aucun endpoint public d'inscription administrateur ;
- mots de passe hachés avec l'algorithme sûr fourni par AdonisJS ;
- longueur minimale de 12 caractères pour un secret initial ;
- message de connexion générique, sans révéler l'existence du compte ;
- session serveur ou cookie signé `HttpOnly`, `Secure` en production et `SameSite=Lax` ;
- rotation de session après authentification ;
- expiration après 8 heures et déconnexion explicite ;
- limitation des tentatives de connexion par compte normalisé et origine réseau ;
- création et récupération de compte uniquement par procédure administrative MVP.

Le jeton JWT déclaré historiquement dans `.env.example` n'est pas retenu par défaut :
une session courte et révocable réduit la surface de gestion pour cette interface
d'administration Web. Tout changement exige une décision d'architecture.

## 4. Autorisation

Tous les contrôles sont réalisés par l'API. Le rôle unique `administrator` est retenu
pour le pilote, avec comptes nominatifs et actifs. Chaque route d'administration
vérifie authentification, compte actif et permission attendue. Le masquage d'un bouton
dans Next.js ne constitue jamais un contrôle d'accès.

## 5. Validation et sorties

- VineJS valide toutes les entrées de l'API ;
- Zod peut valider les données reçues par le Web, sans remplacer VineJS ;
- longueurs, formats, listes fermées et bornes numériques sont explicites ;
- SQL paramétré via Lucid ou paramètres de liaison ;
- texte utilisateur rendu comme texte, jamais comme HTML non assaini ;
- erreurs publiques au format stable, sans pile, SQL, chemins internes ou secrets ;
- identifiants inconnus et ressources non publiées produisent une réponse publique
  indifférenciée lorsque cela évite une fuite d'information.

## 6. Signalements anonymes

- aucun nom, téléphone, courriel, fichier ou consentement implicite ;
- catégorie fermée, commentaire facultatif limité à 1 000 caractères ;
- avertissement visible interdisant les données personnelles et judiciaires ;
- limitation de fréquence au proxy et dans l'application ;
- aucune modification automatique d'une juridiction ;
- texte jamais exposé par une route publique ;
- conservation conforme au modèle de données.

Un identifiant d'abus dérivé d'une adresse réseau peut être conservé uniquement de
façon hachée, salée, avec rotation et expiration courte dans un stockage technique ;
l'adresse brute n'est pas stockée dans la base métier ni journalisée.

## 7. Sécurité HTTP

- HTTPS obligatoire hors développement local et redirection HTTP vers HTTPS ;
- HSTS activé après validation du domaine ;
- CORS limité à une liste explicite d'origines, sans joker avec credentials ;
- protection CSRF sur les opérations authentifiées utilisant des cookies ;
- cookies `HttpOnly`, `Secure` en production et périmètre minimal ;
- en-têtes `Content-Security-Policy`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin` et politique de permissions ;
- géolocalisation limitée au même domaine par `Permissions-Policy` ;
- corps et paramètres de requête limités en taille ;
- cache désactivé pour authentification, administration et signalements.

La CSP autorise seulement les domaines de tuiles explicitement choisis. Elle est
testée avec Leaflet avant production.

## 8. Limitation de requêtes

Valeurs initiales, à ajuster après tests sans réduire les protections :

- API publique en lecture : 120 requêtes par minute et par origine ;
- création de signalement : 5 par heure et par identifiant éphémère ;
- connexion : 5 échecs en 15 minutes, puis temporisation progressive ;
- administration : 60 requêtes par minute et par session.

Les réponses utilisent `429` sans révéler la logique interne. Les proxys de confiance
sont configurés explicitement afin d'éviter la falsification de l'adresse source.

## 9. Secrets et configuration

- aucun `.env` versionné ;
- `.env.example` ne contient que des valeurs factices ;
- secrets longs, aléatoires, distincts par environnement et stockés dans le gestionnaire
  de secrets de l'hébergeur ;
- rotation documentée de la clé applicative et des identifiants de base ;
- aucun secret préfixé `NEXT_PUBLIC_` ;
- compte PostgreSQL applicatif sans droit de créer une extension en production ;
- migrations exécutées par un rôle distinct, plus privilégié et temporaire.

## 10. Journalisation et audit

Les logs techniques utilisent des événements structurés et un identifiant de requête.
Ils excluent : secrets, cookies, en-têtes d'autorisation, mots de passe, corps de
signalement, position d'un visiteur et requêtes SQL contenant des entrées brutes.

Les actions de création, modification, publication, archivage et traitement sont
auditées avec acteur, action, ressource et date. Les métadonnées suivent une liste
blanche. L'accès aux logs est restreint et leur durée de conservation documentée.

## 11. Base de données et sauvegardes

- PostgreSQL non exposé publiquement ;
- chiffrement du transport vers une base distante ;
- privilèges minimaux et identifiants distincts par environnement ;
- migrations réversibles et sauvegarde avant opération risquée ;
- sauvegardes chiffrées, accès restreint, durée définie ;
- restauration testée avant le pilote ;
- aucune copie de production dans les tests locaux.

## 12. Dépendances, CI et déploiement

- lockfile versionné et installation reproductible ;
- audit des dépendances et mises à jour examinées ;
- lint, types, tests et build bloquants en CI ;
- image ou runtime non privilégié en production ;
- environnements développement, test et production séparés ;
- messages de debug désactivés en production ;
- contrôle de santé ne révélant aucune configuration interne ;
- déploiement interrompu si un contrôle de sécurité bloquant échoue.

## 13. Vérifications obligatoires avant pilote

- absence de données interdites et de secrets dans le dépôt ;
- tests d'authentification et d'autorisation, y compris comptes inactifs ;
- validation des coordonnées et des transitions de publication ;
- protection CSRF et CORS testées ;
- limitation de connexion et signalement testée ;
- XSS testé sur tous les textes libres ;
- logs contrôlés pour absence de données sensibles ;
- sauvegarde et restauration réalisées ;
- HTTPS et en-têtes vérifiés ;
- données pilotes autorisées ou explicitement fictives.

## 14. Limites et décisions restantes

Avant une mise en ligne réelle, il reste à valider : hébergeur, domaine, fournisseur
de tuiles, service d'itinéraire, responsable des comptes, procédure d'incident,
durées finales de conservation et sources institutionnelles autorisées. Ces décisions
n'empêchent pas le développement local avec des données fictives.
