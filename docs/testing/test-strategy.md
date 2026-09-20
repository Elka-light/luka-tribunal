# Stratégie de tests du MVP — LUKA TRIBUNAL

## Objectif

Les tests sont reproductibles, indépendants de la production et concentrés sur les
risques : publication, autorisation, validation, coordonnées, signalements et parcours
public sans carte.

## Niveaux

- unitaires : conversions et règles métier pures ;
- API : validation, réponses, authentification et autorisation avec Japa ;
- base : migrations, contraintes, SRID et index GiST sur PostgreSQL/PostGIS de test ;
- Web : composants et états chargement, vide et erreur ;
- bout en bout : recherche, fiche, refus de géolocalisation et signalement.

## Environnements et données

Les tests utilisent une base dédiée et réinitialisable. Les fixtures sont fictives,
explicitement marquées démonstration et ne contiennent aucune donnée concernant un
enfant ou une affaire. Les suites ne contactent aucun fournisseur de tuiles réel.

## Contrôles bloquants

Avant fusion : lint, TypeScript, tests concernés et build. Avant pilote : migrations
sur base vierge, retour arrière contrôlé, index spatial, tests d'accès, contrôle des
logs, recette clavier et largeur 320 px.

Le succès d'un script vide ne compte pas comme un test. Toute vérification non exécutée
est signalée explicitement.

## Vérification de la carte — 20 septembre 2026

- `pnpm run lint`, `pnpm run typecheck` et `pnpm run build` : réussis.
- `pnpm run test` : 9 tests API et 8 tests web réussis.
- Nouveaux tests reproductibles : pagination (validation), profils de transport,
  ordre longitude/latitude, géométrie reçue, durées et réponses invalides.
- Recette Chrome à 390 px : marqueur ouvrant l'action de trajet, refus de
  géolocalisation, départ fictif, aucune requête d'itinéraire avant confirmation,
  tracé, passage pied/vélo, suppression du départ et absence de débordement horizontal.
  Pour reproduire sans position réelle : remplacer la géolocalisation via les outils
  du navigateur par -4.32, 15.31 ; les réponses de parcours de cette recette étaient
  simulées (780 secondes, 1100 mètres), elles ne constituent pas des durées réelles.
- Un appel séparé au profil piéton réel, entre deux points fictifs de Kinshasa,
  a répondu `Ok`, avec géométrie et en-têtes CORS permettant le navigateur.
- Non couverts : exactitude sur le terrain, horaires ferroviaires, profil moto,
  quota agrégé du fournisseur, inventaire national réel et recette exhaustive clavier.
