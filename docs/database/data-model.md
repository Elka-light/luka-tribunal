# Modèle de données du MVP — LUKA TRIBUNAL

## 1. Statut et portée

- Version : 1.0
- Statut : décision de référence pour le socle MVP
- SGBD : PostgreSQL avec PostGIS

Le modèle conserve uniquement des informations institutionnelles sur les juridictions,
des comptes administratifs autorisés, des signalements anonymes minimisés et une
trace des actions administratives. Il ne contient ni dossier judiciaire individuel,
ni identité d'enfant, ni plainte nominative, ni position d'un visiteur.

## 2. Principes

- identifiants techniques UUID générés côté base ;
- dates stockées en UTC avec `timestamptz` ;
- coordonnées stockées dans `geography(Point, 4326)` ;
- suppression logique des juridictions via `archived_at` ;
- publication explicite et contrôlée côté serveur ;
- clés étrangères et contraintes définies en base ;
- texte libre réduit au strict nécessaire ;
- aucune donnée de production dans les seeds ou les tests.

## 3. Énumérations métier

### `jurisdiction_status`

- `draft` : non visible publiquement ;
- `pending_verification` : à vérifier, non visible publiquement ;
- `published` : visible publiquement si les conditions de publication sont remplies ;
- `pending_correction` : en cours de correction après publication, non visible publiquement durant la correction (ajouté par ADR-006, 29/09/2026).

### `report_category`

- `incorrect_address` ;
- `incorrect_coordinates` ;
- `incorrect_contact` ;
- `closed_or_moved` ;
- `other`.

### `report_status`

- `new` ;
- `reviewing` ;
- `resolved` ;
- `rejected`.

## 4. Tables

### 4.1 `jurisdictions`

| Colonne | Type | Règle |
|---|---|---|
| `id` | `uuid` | clé primaire, valeur générée |
| `slug` | `varchar(160)` | unique, non nul |
| `official_name` | `varchar(200)` | non nul |
| `common_name` | `varchar(200)` | facultatif |
| `jurisdiction_type` | `varchar(80)` | valeur institutionnelle contrôlée par l'application |
| `province` | `varchar(120)` | non nul |
| `city` | `varchar(120)` | facultatif |
| `municipality` | `varchar(120)` | facultatif |
| `territory` | `varchar(120)` | facultatif |
| `locality` | `varchar(160)` | facultatif |
| `address` | `varchar(500)` | non nul |
| `territorial_jurisdiction` | `text` | facultatif, portée informative |
| `location` | `geography(Point, 4326)` | non nul |
| `coordinate_precision_meters` | `integer` | facultatif, strictement positif |
| `coordinate_source` | `varchar(500)` | non nul |
| `information_source` | `varchar(500)` | non nul |
| `collected_at` | `date` | facultatif |
| `verified_at` | `date` | requis pour publier |
| `status` | `jurisdiction_status` | non nul, défaut `draft` |
| `published_at` | `timestamptz` | requis pour publier |
| `created_by` | `uuid` | référence `admin_users.id` |
| `updated_by` | `uuid` | référence `admin_users.id` |
| `created_at` | `timestamptz` | non nul |
| `updated_at` | `timestamptz` | non nul |
| `archived_at` | `timestamptz` | facultatif |

Contraintes principales :

- `coordinate_precision_meters > 0` lorsqu'il est renseigné ;
- un enregistrement `published` possède `verified_at`, `published_at`,
  `information_source` et `coordinate_source` ;
- un enregistrement archivé n'est jamais exposé publiquement ;
- index B-tree sur `status`, `province`, `city` et `slug` ;
- index GiST sur `location` ;
- index de recherche textuelle à décider seulement après mesure du besoin.

### 4.2 `jurisdiction_contacts`

| Colonne | Type | Règle |
|---|---|---|
| `id` | `uuid` | clé primaire |
| `jurisdiction_id` | `uuid` | FK, suppression en cascade |
| `type` | `varchar(30)` | `phone`, `email` ou `website` |
| `label` | `varchar(100)` | facultatif |
| `value` | `varchar(320)` | non nul, validé selon le type |
| `is_public` | `boolean` | défaut `false` |
| `created_at` | `timestamptz` | non nul |
| `updated_at` | `timestamptz` | non nul |

Seuls les contacts institutionnels explicitement marqués publics sont exposés.

### 4.3 `admin_users`

| Colonne | Type | Règle |
|---|---|---|
| `id` | `uuid` | clé primaire |
| `email` | `varchar(320)` | unique, normalisé, non public |
| `password_hash` | `varchar(255)` | non nul, jamais journalisé |
| `display_name` | `varchar(120)` | nom professionnel minimal |
| `role` | `varchar(30)` | `administrator` pour le MVP |
| `is_active` | `boolean` | défaut `true` |
| `last_login_at` | `timestamptz` | facultatif |
| `created_at` | `timestamptz` | non nul |
| `updated_at` | `timestamptz` | non nul |

La création de compte ne possède aucune route publique. Le premier compte est créé
par une commande d'exploitation utilisant un secret transmis hors de Git.

### 4.4 `reports`

| Colonne | Type | Règle |
|---|---|---|
| `id` | `uuid` | clé primaire |
| `jurisdiction_id` | `uuid` | FK, non nul |
| `category` | `report_category` | non nul |
| `comment` | `varchar(1000)` | facultatif, texte brut |
| `status` | `report_status` | défaut `new` |
| `handled_by` | `uuid` | FK facultative vers `admin_users` |
| `handled_at` | `timestamptz` | facultatif |
| `created_at` | `timestamptz` | non nul |

Le formulaire ne collecte ni nom, ni téléphone, ni courriel, ni adresse IP en base,
ni fichier. La limitation de fréquence utilise un identifiant technique éphémère au
niveau applicatif ou du proxy, non une colonne de cette table. Un signalement est
supprimé au plus tard 90 jours après sa résolution ou son rejet, et réévalué après
180 jours s'il reste ouvert.

### 4.5 `audit_logs`

| Colonne | Type | Règle |
|---|---|---|
| `id` | `uuid` | clé primaire |
| `actor_id` | `uuid` | FK vers `admin_users`, non nul |
| `action` | `varchar(80)` | action issue d'une liste fermée |
| `entity_type` | `varchar(50)` | type autorisé |
| `entity_id` | `uuid` | identifiant de la ressource |
| `metadata` | `jsonb` | facultatif, liste blanche de champs non sensibles |
| `created_at` | `timestamptz` | non nul |

Les journaux d'audit n'enregistrent jamais de mot de passe, jeton, texte complet de
signalement, position de visiteur ou ancienne valeur contenant une donnée interdite.
Ils sont conservés 12 mois pour le pilote, puis supprimés selon une procédure tracée.

## 5. Règles d'accès aux données

- public : lecture des seules juridictions `published`, non archivées, et de leurs
  seuls contacts `is_public = true` ;
- administration : opérations authentifiées et autorisées côté serveur ;
- signalement : création publique uniquement, aucune lecture publique ;
- audit : écriture applicative et lecture administrative restreinte ;
- aucune table n'est directement accessible depuis le navigateur.

## 6. Transactions et publication

La modification d'une juridiction et l'écriture de son audit sont atomiques. La
publication vérifie dans la même transaction les champs obligatoires, la validité
du point, la source et la date de vérification. Un signalement ne modifie jamais une
juridiction automatiquement.

## 7. Migrations et retour arrière

Les migrations :

1. activent `postgis` et `pgcrypto` explicitement ;
2. créent types, tables, contraintes et index ;
3. disposent d'une méthode `down` dans l'ordre inverse ;
4. ne suppriment aucune donnée existante sans sauvegarde et validation humaine.

L'extension PostGIS peut rester installée lors d'un retour arrière si d'autres objets
de la base peuvent en dépendre. Ce choix doit être expliqué dans la migration.

## 8. Données de démonstration

Les seeds du dépôt utilisent uniquement des juridictions fictives, avec des noms et
contacts manifestement non réels, marquées comme démonstration. Les coordonnées sont
plausibles pour tester la carte mais ne prétendent pas représenter une institution.
