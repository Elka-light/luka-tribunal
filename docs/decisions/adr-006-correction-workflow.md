# ADR-006 : Workflow de correction des juridictions publiées

## Statut

**Accepté** — 29 septembre 2026

## Contexte

Dans la version initiale du MVP, les juridictions suivent ce cycle de vie :

```
draft → pending_verification → published
```

**Problème identifié :**

Une fois qu'une juridiction est publiée (`status = 'published'`), elle ne peut plus être modifiée via la route `PUT /api/v1/admin/jurisdictions/:id`, car cette route limite les modifications aux statuts `draft` et `pending_verification`.

Les signalements anonymes (`reports`) permettent au public de signaler des erreurs, mais il n'existe aucun mécanisme pour exploiter ces signalements et corriger une fiche publiée de manière contrôlée et traçable.

**Besoins métier :**

1. Permettre la correction d'informations erronées sur une juridiction publiée
2. Maintenir la traçabilité complète via `audit_logs`
3. Éviter la modification directe des fiches publiées (principe de contrôle)
4. Exploiter les signalements pour améliorer la qualité des données

## Décision

Nous ajoutons un nouveau statut `pending_correction` au type ENUM `jurisdiction_status` et créons un workflow de correction contrôlé.

### Nouveau workflow

```
published → request correction → pending_correction → update → publish → published
```

### Transitions autorisées

1. **`published` → `pending_correction`**
   - Route : `POST /api/v1/admin/jurisdictions/:id/request-correction`
   - Condition : juridiction publiée et non archivée
   - Audit : `jurisdiction.correction_requested`

2. **`pending_correction` → modification**
   - Route : `PUT /api/v1/admin/jurisdictions/:id` (étendue)
   - Condition : ajout de `pending_correction` à la liste des statuts modifiables
   - Audit : `jurisdiction.updated`

3. **`pending_correction` → `published`**
   - Route : `POST /api/v1/admin/jurisdictions/:id/publish` (étendue)
   - Condition : `verified_at` non nul (contrainte existante maintenue)
   - Audit : `jurisdiction.published`

### Modifications techniques

**Migration `0002_add_pending_correction_status.ts` :**

```sql
ALTER TYPE jurisdiction_status ADD VALUE IF NOT EXISTS 'pending_correction';
```

**Contrôleur `admin_jurisdictions_controller.ts` :**

- Méthode `update` : ligne 73 modifiée pour accepter `['draft', 'pending_verification', 'pending_correction']`
- Méthode `publish` : ligne 114 modifiée pour accepter `['draft', 'pending_correction']`
- Nouvelle méthode `requestCorrection` : passe une fiche `published` en `pending_correction`

**Routes `routes.ts` :**

- Nouvelle route : `POST /api/v1/admin/jurisdictions/:id/request-correction`
- Protection : authentification, origine de confiance, limitation de requêtes admin

## Conséquences

### Positives

✅ **Traçabilité complète** : Chaque transition crée un `audit_log` avec acteur et date
✅ **Sécurité maintenue** : Autorisation serveur, validation VineJS, pas de modification directe des fiches publiées
✅ **Signalements exploitables** : Les administrateurs peuvent maintenant corriger les erreurs signalées
✅ **Réversibilité** : Les contraintes PostgreSQL (coordonnées, publication) restent actives
✅ **Compatibilité** : Les fiches existantes ne sont pas affectées, seul le type ENUM est étendu

### Négatives

⚠️ **Migration ENUM non complètement réversible** : PostgreSQL ne permet pas de supprimer une valeur d'un ENUM facilement. Un retour arrière nécessiterait de s'assurer qu'aucune juridiction n'a le statut `pending_correction`, puis de recréer le type manuellement.

⚠️ **Complexité du workflow** : Le cycle de vie des juridictions devient plus complexe (4 statuts au lieu de 3)

### Risques atténués

- **Perte de données** : La migration n'affecte que le type ENUM, pas les données existantes
- **Contournement de sécurité** : Toutes les routes passent par le middleware `auth()` et `trustedOrigin()`
- **Publication accidentelle** : La contrainte `verified_at IS NOT NULL` reste active

## Alternatives considérées

### Alternative 1 : Permettre la modification directe des fiches publiées

❌ **Rejetée** : Perte de traçabilité, risque de modification accidentelle, pas de workflow de validation

### Alternative 2 : Créer une table de révisions (versioning)

❌ **Rejetée pour le MVP** : Trop complexe, nécessite une refonte du modèle de données, hors périmètre MVP

### Alternative 3 : Forcer la dépublication puis republication

❌ **Rejetée** : Interruption de service pour les visiteurs, perte de la date de publication originale

## Tests

Les tests suivants ont été créés pour valider le workflow :

**`tests/functional/admin_jurisdictions_correction.spec.ts` :**

- ✅ Passage d'une fiche `published` en `pending_correction`
- ✅ Modification d'une fiche `pending_correction`
- ✅ Republication d'une fiche `pending_correction` → `published`
- ✅ Rejet de la publication sans `verified_at`
- ✅ Audit logs créés pour chaque transition

**`tests/functional/authorization.spec.ts` :**

- ✅ Admins inactifs ne peuvent pas agir
- ✅ Fiches brouillons/archivées non exposées publiquement
- ✅ Audit logs créés pour toutes actions admin

**`tests/functional/postgis_constraints.spec.ts` :**

- ✅ Rejet des coordonnées invalides (null island, hors limites)
- ✅ Contraintes de publication respectées
- ✅ Index spatial GiST vérifié

## Documentation à mettre à jour

- ✅ `docs/decisions/README.md` : ajout ADR-006
- ⏳ `docs/database/data-model.md` : ajout du statut `pending_correction` dans la section 3
- ⏳ `docs/api/endpoints.md` : documentation de la nouvelle route (si ce fichier existe)

## Références

- Baseline de sécurité : `docs/security/security-baseline.md`
- Modèle de données : `docs/database/data-model.md`
- Charte de développement : `docs/development/development-charter.md`
- ADR-003 : Authentification administrative par session
