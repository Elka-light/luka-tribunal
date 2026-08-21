# Critères d'acceptation du MVP — LUKA TRIBUNAL

## 1. Règles générales de recette

Le MVP est accepté uniquement si tous les critères marqués **bloquant** sont
satisfaits sur smartphone et ordinateur. Les tests utilisent exclusivement des
données fictives clairement identifiées ou des données institutionnelles dont la
publication a été autorisée et vérifiée.

## 2. Critères du parcours public

### AC-PUB-01 — Accueil et limites — Bloquant

- l'accueil explique que le service sert à l'information et à l'orientation ;
- un avertissement demande de confirmer l'information auprès de l'autorité compétente ;
- la recherche est accessible sans authentification ;
- aucune fonction de plainte, dossier ou conseil juridique personnalisé n'est proposée.

### AC-PUB-02 — Recherche — Bloquant

- une recherche peut être effectuée par nom, province ou ville ;
- les paramètres sont validés et leur longueur est limitée ;
- seuls les enregistrements publiés sont retournés ;
- une recherche vide ou sans résultat produit un message explicite ;
- l'affichage en liste ne dépend ni de Leaflet ni des tuiles cartographiques.

### AC-PUB-03 — Carte — Bloquant

- chaque juridiction publiée possédant des coordonnées valides a un marqueur ;
- sélectionner un marqueur permet d'ouvrir ou d'atteindre sa fiche ;
- une panne de tuiles n'empêche pas la consultation de la liste ;
- la carte indique l'attribution OpenStreetMap requise.

### AC-PUB-04 — Fiche — Bloquant

- une fiche affiche le nom, la localisation descriptive et les contacts disponibles ;
- elle affiche la source, le statut et la date de vérification disponibles ;
- elle rappelle la portée informative du service ;
- un identifiant inconnu ou non publié retourne une erreur publique sans détail interne.

### AC-PUB-05 — Géolocalisation — Bloquant

- la position n'est demandée qu'après une action explicite du visiteur ;
- un refus ou une erreur laisse la recherche, la liste et les fiches utilisables ;
- la position précise n'est envoyée ni à l'API applicative ni aux journaux ;
- aucune position de visiteur n'est persistée.

### AC-PUB-06 — Itinéraire — Bloquant

- le bouton comporte un libellé textuel ;
- l'ouverture est volontaire et mène vers un service externe avec la destination ;
- l'interface indique qu'un service tiers est utilisé ;
- aucun historique d'itinéraire n'est conservé par LUKA TRIBUNAL.

### AC-PUB-07 — Signalement anonyme — Bloquant

- le formulaire ne demande aucun nom, téléphone, courriel ou fichier ;
- la catégorie appartient à une liste fermée et le commentaire est court et limité ;
- un avertissement interdit les données personnelles et judiciaires ;
- les entrées sont validées côté serveur et les soumissions sont limitées en fréquence ;
- la confirmation ne promet pas une correction immédiate ;
- le signalement ne modifie jamais automatiquement la fiche publique.

## 3. Critères administratifs

### AC-ADM-01 — Accès — Bloquant

- les routes administratives refusent tout utilisateur non authentifié ;
- le contrôle d'autorisation est effectué côté serveur ;
- les mots de passe sont hachés et aucun secret n'est écrit dans Git ou les journaux ;
- les erreurs de connexion ne révèlent pas l'existence d'un compte.

### AC-ADM-02 — Données et publication — Bloquant

- nom, source, statut et coordonnées sont validés côté serveur ;
- latitude et longitude respectent leurs bornes et sont stockées en SRID 4326 ;
- les statuts minimaux sont `draft`, `pending_verification` et `published` ;
- une fiche ne peut être publiée sans source et date de vérification ;
- seules les fiches `published` sont visibles publiquement.

### AC-ADM-03 — Signalements et audit — Bloquant

- un administrateur peut consulter et classer un signalement reçu ;
- le texte d'un signalement n'est jamais exposé par une route publique ;
- création, modification, publication et traitement sont journalisés ;
- les journaux n'enregistrent ni secret ni position précise d'un visiteur.

## 4. Critères techniques et géospatiaux

### AC-TECH-01 — Données — Bloquant

- PostgreSQL avec PostGIS est activé par migration ;
- la position utilise `geography(Point, 4326)` et un index GiST ;
- toutes les migrations possèdent une procédure de retour arrière lorsque possible ;
- aucune donnée de production n'est requise pour exécuter les tests.

### AC-TECH-02 — API — Bloquant

- toutes les entrées sont validées ;
- les erreurs publiques suivent un format stable sans pile d'exécution ;
- CORS est limité aux origines configurées ;
- les endpoints sensibles et le signalement sont soumis à une limitation de requêtes.

### AC-TECH-03 — Interface — Bloquant

- les actions principales ont un texte visible et sont utilisables au clavier ;
- les champs ont des libellés et les erreurs sont associées aux champs concernés ;
- les pages essentielles restent utilisables à 320 px de largeur ;
- les états chargement, vide et erreur sont perceptibles sans dépendre de la couleur seule.

### AC-TECH-04 — Qualité — Bloquant

- TypeScript strict est activé ;
- lint, vérification des types, tests et build réussissent ;
- les parcours recherche, fiche, refus de géolocalisation et signalement sont testés ;
- l'authentification, l'autorisation, la validation des coordonnées et la publication sont testées ;
- aucune dépendance nouvelle n'est ajoutée sans justification documentaire.

## 5. Critères de mise en ligne pilote

- une URL HTTPS est accessible aux dix testeurs prévus ;
- les variables et procédures de déploiement sont documentées sans valeur secrète ;
- une sauvegarde et une procédure de restauration sont définies ;
- un contrôle de santé permet de vérifier le web, l'API et la base ;
- les données pilotes ont une source, une date et un statut vérifiable ;
- une vérification finale confirme l'absence de donnée concernant un enfant ou une affaire ;
- les limitations connues sont communiquées aux testeurs.

## 6. Règle d'arbitrage du délai

Si un critère bloquant est menacé, une fonction `Should` ou reportée est retirée
avant de réduire la sécurité, la confidentialité, l'accessibilité essentielle ou
la disponibilité de la liste sans carte. Une mise en ligne sans données pilotes
autorisées peut utiliser des données fictives explicitement étiquetées « démonstration ».
