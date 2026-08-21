# Feuille de route accélérée du MVP — 6 jours

## 1. Cible

Fenêtre de réalisation : du **6 août 2026 au 11 août 2026 inclus**.

Résultat attendu : une version expérimentale accessible à environ dix testeurs,
conforme au périmètre, avec recherche, liste, carte, fiche, itinéraire externe,
géolocalisation consentie, signalement anonyme et administration minimale.

Le calendrier est une cible de réalisation, pas une autorisation de publier des
données institutionnelles non vérifiées. En leur absence, la recette utilise des
données fictives identifiées comme telles.

## 2. Jalons quotidiens

### Jour 1 — Jeudi 6 août : cadrage exécutable

- finaliser personas, user stories et critères d'acceptation ;
- fixer le modèle de données, les statuts et les règles géospatiales ;
- définir architecture, sécurité minimale, contrats API et stratégie de tests ;
- sélectionner ou préparer les données pilotes autorisées ;
- produire les décisions techniques indispensables.

**Sortie attendue :** aucune décision structurante nécessaire au code ne reste implicite.

### Jour 2 — Vendredi 7 août : socle technique

- initialiser Next.js, AdonisJS 7 et TypeScript strict ;
- configurer le monorepo, lint, types, tests et build ;
- configurer PostgreSQL/PostGIS et les migrations réversibles ;
- implémenter modèles, validation, erreurs API et données de démonstration ;
- établir authentification et autorisation administratives minimales.

**Sortie attendue :** le projet démarre localement et la chaîne qualité fonctionne.

### Jour 3 — Samedi 8 août : cœur public

- exposer la liste, la recherche filtrée et la fiche publique ;
- n'exposer que les juridictions publiées ;
- construire accueil, recherche, liste et fiche mobile-first ;
- gérer chargement, absence de résultat et erreurs ;
- ajouter les tests API et composants prioritaires.

**Sortie attendue :** une juridiction peut être trouvée et consultée sans carte.

### Jour 4 — Dimanche 9 août : carte et contribution

- intégrer Leaflet et OpenStreetMap avec attribution ;
- ajouter la géolocalisation uniquement après consentement ;
- garantir le repli vers la liste ;
- ajouter l'itinéraire externe ;
- implémenter le signalement anonyme validé et limité en fréquence ;
- terminer l'administration minimale et l'audit essentiel.

**Sortie attendue :** tous les parcours fonctionnels du MVP sont intégrés.

### Jour 5 — Lundi 10 août : durcissement et recette

- tester validation, authentification, autorisation, XSS, CORS et erreurs ;
- tester les coordonnées, le SRID, l'index spatial et les migrations ;
- vérifier clavier, petit écran, contraste et connexion dégradée ;
- exécuter lint, types, tests et build ;
- corriger uniquement les anomalies bloquantes et majeures ;
- préparer déploiement, sauvegarde et restauration.

**Sortie attendue :** candidat de mise en ligne sans défaut bloquant connu.

### Jour 6 — Mardi 11 août : mise en ligne pilote

- déployer sous HTTPS dans l'environnement pilote ;
- exécuter les contrôles de santé et une recette de bout en bout ;
- vérifier les secrets, les journaux et l'absence de données interdites ;
- charger uniquement les données pilotes autorisées ;
- transmettre les limites et le protocole de test aux dix testeurs ;
- consigner les anomalies et décisions pour l'itération suivante.

**Sortie attendue :** MVP accessible aux testeurs ou décision explicite de non-déploiement
si un critère de sécurité, de confidentialité ou d'intégrité des données échoue.

## 3. Priorité en cas de retard

Ordre de protection :

1. absence de données sensibles, sécurité et contrôle de publication ;
2. recherche, liste et fiche ;
3. validité des données et traçabilité ;
4. carte, géolocalisation et itinéraire ;
5. traitement des signalements dans l'interface d'administration ;
6. améliorations visuelles et fonctions non bloquantes.

Ne sont jamais utilisés comme variables d'ajustement : validation serveur,
autorisation, migrations, tests critiques, liste indépendante de la carte et
protection de l'enfant.

## 4. Dépendances externes à confirmer immédiatement

- disponibilité d'un environnement PostgreSQL/PostGIS ;
- choix de l'hébergement web, API et base de données ;
- domaine ou URL pilote et certificat HTTPS ;
- identité de l'administrateur pilote, transmise hors de Git ;
- liste des juridictions et sources autorisées ;
- politique de tuiles OpenStreetMap et service d'itinéraire retenu.

Une dépendance externe non disponible n'arrête pas le développement local, mais
peut empêcher la mise en ligne réelle au sixième jour.

## 5. Suivi quotidien

Chaque fin de journée doit consigner : fonctionnalités terminées, tests réussis,
risques nouveaux, décisions en attente et objectif du lendemain. Aucun commit ni
push n'est effectué par un assistant IA sans autorisation explicite.
