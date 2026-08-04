Charte de développement — LUKA TRIBUNAL
1. Objet
Cette charte définit les règles obligatoires de conception, de développement, de test, de sécurité, de documentation et de versionnement du projet LUKA TRIBUNAL.
Elle s’applique :
    • au développeur principal ;
    • aux futurs collaborateurs ;
    • aux prestataires ;
    • aux contributeurs ;
    • à Codex ;
    • aux autres assistants d’intelligence artificielle.
2. Source de vérité
Le dépôt GitHub officiel constitue la source de vérité du projet.
Une fonctionnalité, une décision ou une règle importante ne doit pas exister uniquement :
    • dans une conversation ;
    • dans un message WhatsApp ;
    • dans la mémoire d’un développeur ;
    • dans une réponse d’intelligence artificielle ;
    • dans un fichier non versionné.
Toute décision importante doit être documentée dans le dépôt.
3. Ordre de priorité
En cas de contradiction, l’ordre suivant s’applique :
    1. exigences légales et protection de l’enfant ;
    2. règles de sécurité ;
    3. vision produit ;
    4. périmètre du MVP ;
    5. décisions d’architecture ;
    6. modèle de données ;
    7. conventions API ;
    8. user stories ;
    9. implémentation technique.
Le code ne peut pas contredire la documentation de niveau supérieur sans décision d’architecture formelle.
4. Principes techniques
Le projet applique de manière pragmatique :
    • KISS ;
    • DRY ;
    • séparation des responsabilités ;
    • moindre privilège ;
    • Security by Design ;
    • Privacy by Design ;
    • API First ;
    • validation systématique des entrées ;
    • documentation continue ;
    • migrations de base réversibles ;
    • automatisation des vérifications répétitives.
La complexité ne doit être ajoutée que lorsqu’elle répond à un besoin démontré.
5. Technologies de référence
Frontend
    • Next.js ;
    • React ;
    • TypeScript ;
    • Tailwind CSS ;
    • TanStack Query ;
    • React Hook Form ;
    • Zod ;
    • Leaflet ;
    • OpenStreetMap.
Backend
    • AdonisJS 6 ;
    • TypeScript ;
    • Lucid ORM ;
    • VineJS ;
    • API REST ;
    • Japa.
Base de données
    • PostgreSQL ;
    • PostGIS ;
    • index spatiaux GiST ;
    • système géographique WGS 84 et SRID 4326.
Infrastructure
    • Git ;
    • GitHub ;
    • pnpm ;
    • Docker ;
    • GitHub Actions ;
    • HTTPS ;
    • sauvegardes ;
    • monitoring.
Toute nouvelle technologie doit être justifiée par une décision d’architecture.
6. Organisation du travail
Chaque fonctionnalité suit ce cycle :
    1. besoin identifié ;
    2. user story rédigée ;
    3. critères d’acceptation définis ;
    4. risques analysés ;
    5. solution technique conçue ;
    6. branche Git créée ;
    7. développement limité au périmètre convenu ;
    8. tests exécutés ;
    9. revue de code réalisée ;
    10. documentation mise à jour ;
    11. validation fonctionnelle ;
    12. fusion dans main ;
    13. déploiement en préproduction ;
    14. validation avant production.
7. Gestion des branches
La branche principale est :
main
Elle doit rester stable.
Les branches temporaires utilisent les préfixes suivants :
feature/
fix/
refactor/
docs/
test/
security/
chore/
Exemples :
feature/jurisdiction-search
feature/map-geolocation
fix/incorrect-distance
security/admin-rate-limit
docs/geospatial-architecture
Une branche doit traiter une seule fonctionnalité ou correction logique.
8. Conventions de commits
Les messages suivent le format :
type(scope): description
Types autorisés :
feat
fix
docs
test
refactor
security
chore
ci
build
perf
Exemples :
feat(search): add jurisdiction name filter
fix(map): correct marker coordinates
docs(security): define access control rules
test(api): add jurisdiction endpoint tests
security(auth): limit failed login attempts
chore(repo): initialize monorepo structure
Les commits doivent être :
    • petits ;
    • compréhensibles ;
    • cohérents ;
    • consacrés à une seule modification logique ;
    • dépourvus de secrets.
9. Qualité du code
Aucun code ne peut être accepté s’il présente :
    • une erreur de compilation ;
    • une erreur TypeScript ;
    • une erreur de lint ;
    • une validation manquante ;
    • un secret écrit en dur ;
    • une requête SQL vulnérable ;
    • une duplication importante non justifiée ;
    • une gestion d’erreur absente ;
    • une dépendance inutile ;
    • une modification non documentée de la base ;
    • une donnée relative à un enfant.
Le typage strict doit être activé.
L’utilisation de any doit être exceptionnelle et expliquée.
10. Base de données
Toute modification de structure doit être réalisée par migration.
Une migration doit :
    • avoir un nom explicite ;
    • être réversible lorsque cela est possible ;
    • utiliser les types appropriés ;
    • définir les contraintes nécessaires ;
    • créer les index utiles ;
    • éviter les suppressions irréversibles sans validation ;
    • préserver l’historique.
Aucune donnée de production ne doit être utilisée dans les tests locaux.
11. Données géospatiales
Les coordonnées doivent être validées.
Pour chaque point géographique :
    • la latitude doit être comprise entre -90 et 90 ;
    • la longitude doit être comprise entre -180 et 180 ;
    • le système de référence doit être documenté ;
    • la source doit être conservée ;
    • la précision doit être indiquée lorsque possible ;
    • les points non vérifiés doivent être signalés.
Les coordonnées ne doivent pas être inversées.
L’ordre standard attendu dans les représentations géographiques doit être documenté pour éviter la confusion entre latitude et longitude.
12. Sécurité
Les règles suivantes sont obligatoires :
    • aucun secret dans Git ;
    • aucune donnée sensible dans les journaux ;
    • aucune information nominative sur un enfant ;
    • validation de toutes les entrées ;
    • contrôle d’accès côté serveur ;
    • mots de passe hachés ;
    • limitation des requêtes sensibles ;
    • HTTPS en production ;
    • CORS limité ;
    • messages d’erreur sans détails internes ;
    • compte de base de données avec privilèges minimaux ;
    • journalisation des actions administratives ;
    • sauvegardes régulières ;
    • dépendances surveillées.
Les contrôles de sécurité ne doivent jamais dépendre uniquement de l’interface frontend.
13. Revue de code
Toute revue doit vérifier :
    • conformité au besoin ;
    • respect du périmètre ;
    • qualité du typage ;
    • gestion des erreurs ;
    • validation des données ;
    • sécurité ;
    • performance ;
    • qualité des requêtes ;
    • tests ;
    • documentation ;
    • absence de données sensibles ;
    • absence de modification imprévue.
Une revue ne se limite pas à vérifier que le code fonctionne.
14. Utilisation de l’intelligence artificielle
L’IA est un assistant et non l’autorité finale.
Avant de générer du code, elle doit :
    1. lire les documents pertinents ;
    2. présenter un plan ;
    3. identifier les fichiers concernés ;
    4. signaler les risques ;
    5. limiter la tâche au périmètre demandé.
Après la génération, elle doit :
    1. exécuter ou proposer les tests ;
    2. exécuter le lint ;
    3. vérifier les types ;
    4. résumer les modifications ;
    5. signaler les points non vérifiés ;
    6. ne pas effectuer de commit sans autorisation.
Tout code généré doit être relu par un humain.
15. Documentation
Toute fonctionnalité importante doit mettre à jour les documents concernés.
Doivent être documentés :
    • les règles métier ;
    • les endpoints ;
    • les modèles de données ;
    • les décisions techniques ;
    • les variables d’environnement ;
    • les procédures de déploiement ;
    • les procédures de sauvegarde ;
    • les limitations connues.
16. Tests
Les tests doivent couvrir en priorité :
    • les règles métier ;
    • l’authentification ;
    • les autorisations ;
    • la recherche ;
    • la validation ;
    • les opérations géospatiales ;
    • les erreurs ;
    • les migrations ;
    • les parcours utilisateurs essentiels.
Un test doit être reproductible et indépendant des données de production.
17. Définition de terminé
Une tâche est terminée seulement lorsque :
    • les critères d’acceptation sont satisfaits ;
    • le code compile ;
    • les types sont valides ;
    • le lint réussit ;
    • les tests concernés réussissent ;
    • la sécurité a été vérifiée ;
    • la documentation est mise à jour ;
    • aucun secret n’est présent ;
    • le résultat a été validé fonctionnellement.
18. Gestion des erreurs
Une erreur doit :
    • être interceptée au niveau approprié ;
    • produire un message compréhensible pour l’utilisateur ;
    • être journalisée sans donnée sensible ;
    • utiliser un code HTTP adapté pour l’API ;
    • ne pas révéler la structure interne du système.
19. Décisions d’architecture
Toute décision importante doit être documentée dans :
docs/decisions/
Exemples :
    • choix de PostGIS ;
    • choix de Next.js ;
    • choix d’AdonisJS 6 ;
    • choix de l’hébergement ;
    • méthode d’authentification ;
    • fournisseur cartographique ;
    • stratégie hors connexion.
Une décision doit décrire :
    • le contexte ;
    • le problème ;
    • les options étudiées ;
    • la décision ;
    • les conséquences ;
    • le statut.
20. Interdictions
Il est interdit de :
    • développer directement dans le dossier personnel /home/lalu ;
    • initialiser Git dans /home/lalu ;
    • utiliser git add . sans vérifier git status ;
    • publier un fichier .env ;
    • versionner node_modules ;
    • publier des données judiciaires nominatives ;
    • modifier la production manuellement sans procédure ;
    • supprimer une table de production sans sauvegarde ;
    • accepter aveuglément du code produit par une IA ;
    • fusionner une fonctionnalité non testée ;
    • contourner un contrôle de sécurité pour gagner du temps.
