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
