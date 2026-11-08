# LUKA TRIBUNAL — Dossier de reprise pour Claude

Date de cette synthèse : **23 septembre 2026**. Version du produit : **0.1.0**.
État examiné : dépôt local, dernier commit `0004275` (`feat(map): add tribunal routing and travel estimates`).

Ce document est autonome : il peut être joint à une conversation Claude pour reprendre le projet. Il distingue le code présent, les résultats historiques documentés et les travaux encore nécessaires. Il ne constitue pas une certification de sécurité ni une preuve de déploiement public.

## 1. Le projet en quelques mots

LUKA TRIBUNAL est une plateforme web de géolocalisation et d'information sur les **tribunaux pour enfants en République Démocratique du Congo**. Elle aide les citoyens, familles, professionnels de la justice et organismes de protection de l'enfant à trouver une juridiction et ses informations pratiques.

Le parcours central est : **rechercher → voir la liste ou la carte → consulter une fiche → préparer un itinéraire → signaler une erreur si nécessaire**.

Le service sert à l'information et à l'orientation. Il ne détermine pas juridiquement le tribunal compétent et ne fournit pas de conseil juridique personnalisé. Le pilote vise environ **dix testeurs**, avec une interface française, mobile-first, accessible et adaptée aux connexions limitées.

## 2. Où nous en sommes réellement

**Le socle du MVP est développé. La prochaine phase est la consolidation fonctionnelle, la recette et la préparation du pilote.** Il ne faut pas repartir de zéro.

| Partie | État observé dans le dépôt |
|---|---|
| Cadrage | Vision, périmètre, personas, user stories, critères d'acceptation et règles de sécurité rédigés. Certains documents complémentaires restent vides. |
| Socle technique | Monorepo, frontend, API, migration PostGIS, seed fictif, scripts qualité et workflow GitHub Actions présents. |
| Recherche | Recherche par nom, province et ville ; résultats publics paginés côté API, chargés successivement côté web. |
| Carte | Carte commune Leaflet/OpenStreetMap, marqueurs des résultats publiés, sélection d'un tribunal et liste utilisable indépendamment de la carte. |
| Position de départ | Géolocalisation volontaire ou choix explicite sur la carte ; possibilité d'effacer le départ. |
| Itinéraires | Tracé intégré, distance et durée à pied, à vélo ou en voiture via un fournisseur externe ; lien externe OpenStreetMap également présent sur la fiche. |
| Fiche publique | Nom, adresse, ville/province, source, date de vérification, carte et formulaire de signalement. Certains champs fournis par l'API ne sont pas encore rendus dans l'interface. |
| Signalements | Envoi anonyme, catégorie et commentaire facultatif limité à 1 000 caractères, traitement administratif manuel. |
| Administration | Connexion/déconnexion, création et correction de brouillons, publication explicite et traitement des signalements. Ce n'est pas encore une administration complète. |
| Données | Le seed fournit **une juridiction fictive à Kinshasa**, clairement identifiée comme démonstration. Aucun inventaire national réel n'est fourni. |
| Exploitation | Aperçu local prévu ; hébergement, domaine, données institutionnelles autorisées et recette finale restent à confirmer. Aucun déploiement public n'est établi par cette revue. |

## 3. Architecture et technologies effectivement présentes

Flux principal : **navigateur → frontend Next.js → appels à l'API AdonisJS → PostgreSQL/PostGIS**. Le navigateur n'accède jamais directement à la base. Les appels cartographiques et de calcul d'itinéraire vont vers les services externes concernés.

- Environnement : Node.js **24**, pnpm **11.15.1**, monorepo pnpm.
- Web : Next.js **16.3.1**, React **19.2.8**, TypeScript, Tailwind CSS 4, TanStack Query, React Hook Form, Zod, Leaflet et OpenStreetMap.
- API : **AdonisJS 7**, Lucid ORM, VineJS, Japa, API REST versionnée `/api/v1`.
- Base locale : image Docker **PostgreSQL 16 / PostGIS 3.4**.
- Géospatial : `geography(Point, 4326)`, index GiST, coordonnées validées côté serveur.
- Qualité : ESLint, vérification TypeScript séparée, tests API Japa, tests web avec le test runner Node, build et audit des dépendances configurés en CI.

**Attention aux anciennes consignes :** `AGENTS.md` mentionne encore AdonisJS 6, mais le code et la décision **ADR-005** documentent le passage à AdonisJS 7 / Node.js 24 pour des correctifs de sécurité. Ne pas rétrograder automatiquement ; harmoniser les consignes lors d'une tâche dédiée.

## 4. Repères dans le dépôt

```text
apps/web/src/app/                  Accueil, /juridictions/[slug], /administration
apps/web/src/components/           Recherche, carte, fiche et panneau admin
apps/web/src/lib/jurisdictions.ts  Client API et validation Zod des réponses
apps/web/src/lib/routing.ts        Construction et validation des itinéraires
apps/web/tests/                    Tests web
apps/api/start/routes.ts           Routes publiques et administratives
apps/api/app/controllers/          Recherche, sessions, signalements, administration
apps/api/app/validators/           Validation VineJS
apps/api/app/middleware/           Authentification, origine, en-têtes, etc.
apps/api/database/migrations/      Schéma MVP et index PostGIS
apps/api/database/seeders/         Données de démonstration
apps/api/tests/                    Tests unitaires et fonctionnels
docs/                             Référentiel produit et technique
docs/decisions/README.md           Registre des décisions d'architecture
scripts/preview.mjs                Lancement de l'aperçu local isolé
compose.yaml                      PostgreSQL/PostGIS local
.github/workflows/                Chaîne qualité CI
```

`packages/config`, `packages/types`, `packages/ui` et les dossiers racine de données sont essentiellement des emplacements réservés. Les migrations et le seed opérationnels sont dans `apps/api/database/`.

## 5. Modèle de données et API

Cinq tables principales :

- `jurisdictions` : identité institutionnelle, adresse, divisions administratives, point géographique, sources, dates et statut de publication.
- `jurisdiction_contacts` : contacts institutionnels ; seuls ceux explicitement publics peuvent sortir dans l'API publique.
- `admin_users` : comptes administratifs, mot de passe haché, rôle et activation.
- `reports` : signalements anonymes et état de traitement.
- `audit_logs` : trace des actions administratives avec acteur, ressource et date.

Statuts des juridictions : `draft`, `pending_verification`, `published`. Seules les fiches publiées et non archivées sont exposées publiquement. Le schéma prévoit `archived_at`, mais aucun parcours d'archivage complet n'est exposé par les routes actuelles.

La migration `0001_create_mvp_schema.ts` active PostGIS et pgcrypto, crée contraintes et index, et possède un `down`. Ce retour arrière supprime les tables : ne jamais le considérer comme une restauration sans perte de données.

Routes utiles :

| Méthode | Route | Usage |
|---|---|---|
| GET | `/health` | Santé applicative ; ne vérifie pas à elle seule PostgreSQL |
| GET | `/api/v1/jurisdictions` | Liste publique avec filtres et pagination |
| GET | `/api/v1/jurisdictions/:slug` | Fiche publique |
| POST | `/api/v1/reports` | Envoi d'un signalement |
| POST / GET / DELETE | `/api/v1/admin/session` | Connexion, session courante, déconnexion |
| GET / POST | `/api/v1/admin/jurisdictions` | Liste administrative et création |
| PUT | `/api/v1/admin/jurisdictions/:id` | Modification d'un brouillon ou d'une fiche à vérifier |
| POST | `/api/v1/admin/jurisdictions/:id/publish` | Publication d'un brouillon vérifié |
| GET | `/api/v1/admin/reports` | Consultation des signalements |
| PATCH | `/api/v1/admin/reports/:id` | Changement de statut |

## 6. Carte, itinéraires et confidentialité

L'extension du **20 septembre 2026** ajoute les itinéraires intégrés au périmètre initial. Le calcul est effectué par **FOSSGIS/OSRM**, via `routing.openstreetmap.de`, avec des profils distincts `routed-foot`, `routed-bike` et `routed-car`.

- La durée et la distance viennent du fournisseur, sans estimation inventée à partir d'une ligne droite.
- Moto et train sont indisponibles faute de profils/données validés.
- La position du visiteur n'est pas stockée dans la base applicative.
- Le transfert des coordonnées au fournisseur exige une action explicite distincte de l'autorisation de géolocalisation. Le fournisseur reçoit aussi l'adresse réseau et peut journaliser la requête.
- Les requêtes sont espacées localement, annulables et limitées dans le temps. Cette limitation par page ne garantit pas le quota global de plusieurs utilisateurs.
- Les conditions d'utilisation, la confidentialité et la capacité des fournisseurs de tuiles/itinéraires doivent être validées avant le pilote.

Ordre des coordonnées : **PostGIS/GeoJSON = longitude, latitude ; Leaflet = latitude, longitude**. Latitude entre -90 et 90, longitude entre -180 et 180 ; `(0, 0)` refusé par les règles MVP.

## 7. Règles non négociables

Ne jamais collecter, publier ou introduire dans le MVP : identité d'enfant, victime mineure, plainte nominative, dossier individuel, détails d'affaire, décision confidentielle ou donnée médicale/sociale sensible. Aucun téléversement public de fichier n'est prévu.

Ne pas ajouter implicitement de chatbot juridique, gestion de plaintes, paiement, application mobile native, suivi individuel des visiteurs ou extension à d'autres juridictions. La mention des parquets dans certaines métadonnées n'élargit pas le périmètre validé.

Conserver : validation serveur, autorisation serveur, moindre privilège, sources vérifiables, publication manuelle, traçabilité, neutralité et fonctionnement sans géolocalisation. Un signalement ne modifie jamais automatiquement une fiche publique.

Avant une modification, lire les documents pertinents, reformuler l'objectif, proposer un plan court, nommer les fichiers et les risques. Ne pas ajouter de dépendance sans justification. Toute évolution du schéma passe par une migration. Ne pas écrire de secrets, utiliser des données de production, modifier l'historique Git, committer ou pousser sans autorisation.

## 8. Limites concrètes à traiter

1. **Fiches incomplètes côté interface :** l'API fournit notamment les contacts et le ressort territorial, mais `jurisdiction-detail.tsx` ne les affiche pas encore. Leur consultation fait partie du besoin MVP.
2. **Correction après publication :** l'interface désactive la correction des fiches publiées et l'API limite la modification aux brouillons/fiches à vérifier. Définir un parcours contrôlé de correction et de republication pour rendre les signalements réellement exploitables.
3. **Administration partielle :** pas de gestion complète des contacts, d'archivage ni de consultation de l'audit dans les routes/interface examinées. Ne pas confondre tables présentes et fonctionnalités terminées.
4. **Sécurité/exploitation à rapprocher des exigences :** les contrôles codés ne prouvent pas la conformité complète à la baseline. La configuration de session indique `2h`, contre `8h` dans la baseline ; les règles de limitation et de conservation doivent également être revérifiées avant pilote.
5. **Mono-instance :** ADR-004 limite le pilote ; la limitation de requêtes utilise un store mémoire. Ne pas passer à plusieurs instances sans revoir les stores et les sessions.
6. **Types au build :** `apps/web/next.config.ts` contient `typescript.ignoreBuildErrors: true`. Un build réussi ne prouve donc pas la validité des types : `pnpm run typecheck` reste indispensable.
7. **Données et déploiement :** choisir les sources autorisées, vérifier les juridictions sur le terrain, définir hébergement, domaine, comptes pilotes, HTTPS, sauvegardes, restauration et supervision.
8. **Documentation à synchroniser :** le calendrier de la roadmap du 6 au 11 août 2026 est historique, pas une preuve de livraison. Certaines mentions « conception » et décisions « à définir » sont dépassées par le code et les ADR.

Documents actuellement vides : `docs/architecture/components.md`, `docs/database/data-governance.md`, `docs/development/ai-usage.md`, `docs/development/code-quality.md`, `docs/development/definition-of-done.md`, `docs/development/git-conventions.md`, `docs/geospatial/coordinate-quality.md`, `docs/testing/user-testing.md`.

## 9. Exécuter et vérifier le projet

Depuis la racine, avec Node.js 24, pnpm 11 et Docker Compose :

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm run preview
```

Ouvrir `http://localhost:3000`. Selon le README, l'aperçu prépare une base fictive isolée `luka-preview`, port `55432`, applique la migration et charge la fiche de démonstration. Il ne crée aucun administrateur automatiquement. Le seed dispose d'un mécanisme optionnel de création de compte via variables d'environnement ; les secrets doivent être fournis hors du dépôt.

Si pnpm tente inutilement de réinstaller les dépendances présentes :

```bash
pnpm --config.verify-deps-before-run=false run preview
```

Contrôles du workspace :

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

**Résultats historiques :** `docs/testing/test-strategy.md` rapporte au 20 septembre 2026 un lint, un typecheck, un build et 9 tests API / 8 tests web réussis. Une recette Chrome à 390 px est documentée, avec des réponses d'itinéraire simulées ; un appel réel distinct au profil piéton est également rapporté. Ce sont des résultats consignés, pas des vérifications intégralement reproduites pour cette synthèse.

**Vérifications de cette synthèse :** état du code et documentation relus ; lint et vérification TypeScript réussis ; commande de tests web réussie (le runner affiche 2 fichiers de tests réussis). Les tests API, le build, la base, la recette navigateur et le déploiement n'ont pas été réexécutés pour cette modification documentaire.

La couverture existante reste limitée : une partie des tests web inspecte le code source ; elle ne remplace pas une recette de bout en bout. Compléter notamment les parcours administratifs, la publication, les contraintes PostGIS, le clavier, les erreurs réseau et la restauration.

## 10. Suite proposée à Claude

1. Confirmer la compréhension et établir un backlog court à partir des écarts ci-dessus et des critères d'acceptation.
2. Prioriser l'affichage des informations institutionnelles manquantes et le parcours de correction des fiches publiées.
3. Compléter les tests critiques et la recette mobile/clavier, puis corriger les anomalies bloquantes.
4. Synchroniser les documents obsolètes et compléter ceux nécessaires à l'exploitation.
5. Préparer la préproduction et les données pilotes autorisées ; ouvrir aux dix testeurs après validation des critères bloquants.

Cette liste est une proposition de reprise, pas une autorisation de déployer ou d'élargir le périmètre.

## 11. Message prêt à envoyer avec ce fichier

> Claude, je poursuis le développement de LUKA TRIBUNAL. Lis ce dossier de reprise pour comprendre le produit, le code déjà présent, les contraintes et les limites actuelles. Aide-moi à faire évoluer l'existant sans repartir de zéro. Commence par résumer ta compréhension et proposer trois priorités concrètes. Distingue toujours ce qui est implémenté, ce qui a été testé et ce qui reste à valider. Si tu n'as pas accès au dépôt, demande seulement les fichiers nécessaires à la tâche choisie et ne prétends pas les avoir inspectés. Pour chaque modification, indique le plan, les fichiers concernés, les risques, les critères de réussite et les vérifications. Respecte impérativement la protection de l'enfant, le périmètre MVP et l'absence de commit, push ou déploiement sans mon autorisation.

Sources principales : `README.md`, `AGENTS.md`, `docs/product/{vision,scope,roadmap}.md`, `docs/development/development-charter.md`, `docs/security/security-baseline.md`, `docs/architecture/overview.md`, `docs/database/data-model.md`, `docs/geospatial/geospatial-architecture.md`, `docs/decisions/README.md`, `docs/deployment/deployment-strategy.md`, `docs/testing/test-strategy.md`, manifestes, routes, migration, seed, composants et tests du dépôt.
