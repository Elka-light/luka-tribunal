# Préparation de la mise en ligne pilote

## État au 8 novembre 2026

Un aperçu local avec PostgreSQL/PostGIS et données fictives est disponible via
`pnpm run preview`, après build. Ce lancement sert à la revue du produit ; il ne
constitue pas un déploiement public.

**Avancées récentes :**
- ✅ Workflow de correction des juridictions publiées implémenté et testé (30 tests passants)
- ✅ Affichage complet des fiches avec contacts institutionnels et ressort territorial
- ✅ Validation TypeScript activée dans le build Next.js (`ignoreBuildErrors: false`)
- ✅ Conformité baseline sécurité : sessions 8h, limitation API publique 120 req/min
- ✅ 12 tribunaux réels géolocalisés en statut `pending_verification`
- ✅ Documentation des sources de données créée ([data/SOURCES.md](../../data/SOURCES.md))

**Blocages avant pilote :**
- ⚠️ Validation terrain des 12 tribunaux (adresses et coordonnées GPS précises)
- ⚠️ Autorisation institutionnelle de publication des données
- ⚠️ Hébergeur, domaine et infrastructure HTTPS non définis
- ⚠️ Procédures de sauvegarde/restauration à tester
- ⚠️ Comptes administrateurs pilotes à créer

## Ordre de livraison

1. Examiner l'accueil, la recherche, la fiche, la carte et le signalement en local.
2. Consigner et corriger les retours visuels et fonctionnels.
3. Compléter la recette des critères de `docs/product/acceptance-criteria.md`,
   notamment mobile, clavier, publication et comptes inactifs.
4. Choisir hébergement, domaine, administrateur pilote et données autorisées.
5. Préparer HTTPS, secrets, accès privé à PostgreSQL, sauvegarde et restauration.
6. Exécuter lint, TypeScript, tests, build et audit des dépendances en CI.
7. Déployer en préproduction, vérifier les parcours réels et ouvrir aux dix testeurs
   seulement après validation des critères bloquants.

## Configuration de déploiement à respecter

- Node.js 24 et dépendances installées depuis le lockfile.
- Web : `pnpm --filter web build`, puis `pnpm --filter web start`.
- API : `pnpm --filter api build`, installer les dépendances de production dans
  `apps/api/build`, puis lancer `node bin/server.js` depuis ce dossier.
- Injecter les variables décrites dans `apps/api/.env.example`, sans reprendre ses
  valeurs factices. Configurer l'URL publique de l'API avant le build web.
- Fournir web et API sur des origines HTTPS compatibles avec les cookies SameSite,
  et configurer CORS avec l'origine exacte du web.
- Exécuter les migrations avec un rôle dédié, avant ouverture du trafic.
- Ne pas lancer le script d'aperçu ni charger automatiquement son seed en production.
- Sauvegarder avant migration ; tester une restauration sur une base séparée.
  Le stockage, la fréquence et la rétention des sauvegardes restent à définir
  avec l'hébergeur. Ne pas utiliser une migration descendante comme retour arrière
  automatique lorsqu'elle supprimerait des données.
- Contrôler `/health` et une lecture réelle des juridictions : `/health` seul ne
  vérifie pas la connexion à PostgreSQL.

## Hébergement et infrastructure (à définir avant pilote)

### Options d'hébergement recommandées

**Option 1 : PaaS managé (recommandé pour MVP)**
- Providers : Railway, Render, Fly.io, ou similaire
- ✅ Avantages : HTTPS automatique, déploiement Git, PostgreSQL managé, scaling facile
- ❌ Inconvénients : Coûts récurrents, dépendance au fournisseur
- **Coût estimé :** ~15-30 USD/mois pour le pilote (10 utilisateurs)

**Option 2 : VPS auto-géré**
- Providers : DigitalOcean, Hetzner, Linode
- ✅ Avantages : Contrôle complet, coûts prévisibles
- ❌ Inconvénients : Maintenance système requise, configuration HTTPS/backups manuelle
- **Coût estimé :** ~10-20 USD/mois + temps de configuration

**Option 3 : Hébergement institutionnel**
- Si l'institution dispose d'une infrastructure existante
- ✅ Avantages : Intégration institutionnelle, contrôle des données
- ❌ Inconvénients : Processus d'approbation, contraintes techniques possibles

### Domaine

**Recommandations :**
- Format suggéré : `luka-tribunal.cd` ou `tribunaux-enfants.cd`
- Domaine `.cd` (RDC) à privilégier pour la légitimité institutionnelle
- Alternative : sous-domaine d'une institution partenaire

**Prérequis DNS :**
- Enregistrement A/AAAA pointant vers l'IP du serveur
- Certificat SSL/TLS (Let's Encrypt gratuit ou certificat institutionnel)
- Configuration HTTPS avec redirection HTTP → HTTPS

### Configuration HTTPS

**Certificat SSL/TLS :**
```bash
# Avec Let's Encrypt (gratuit, auto-renouvelable)
certbot certonly --standalone -d luka-tribunal.cd -d www.luka-tribunal.cd
```

**En-têtes de sécurité (déjà configurés dans le code) :**
- `Strict-Transport-Security` (HSTS) : à activer après validation du domaine
- `Content-Security-Policy` : déjà configuré pour Leaflet/OpenStreetMap
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`

### Base de données PostgreSQL/PostGIS

**Configuration production :**
- PostgreSQL 16 + extension PostGIS 3.4
- Accès privé uniquement (pas d'exposition publique)
- Connexion chiffrée (SSL/TLS)
- Compte applicatif avec privilèges minimaux
- Compte migration séparé avec privilèges supérieurs (temporaire)

**Sauvegardes automatiques :**
```bash
# Sauvegarde quotidienne recommandée
pg_dump -Fc luka_prod > backup_$(date +%Y%m%d).dump
```

**Politique de rétention suggérée :**
- Quotidien : 7 jours
- Hebdomadaire : 4 semaines
- Mensuel : 3 mois
- Stockage chiffré hors serveur principal

### Variables d'environnement production

**Côté API (apps/api/.env) :**
```bash
NODE_ENV=production
PORT=3333
HOST=0.0.0.0
APP_KEY=<générer 32+ caractères aléatoires>
DB_HOST=<ip-ou-hostname-privé>
DB_PORT=5432
DB_USER=luka_app
DB_PASSWORD=<mot-de-passe-fort>
DB_DATABASE=luka_prod
CORS_ORIGIN=https://luka-tribunal.cd
SESSION_DRIVER=cookie
LOG_LEVEL=info
```

**Côté Web (apps/web/.env.production) :**
```bash
NEXT_PUBLIC_API_URL=https://api.luka-tribunal.cd
```

**⚠️ Jamais versionner ces fichiers. Utiliser un gestionnaire de secrets (Railway Secrets, Render Environment, HashiCorp Vault, etc.)**

## Checklist de déploiement

### Pré-déploiement
- [ ] Choisir l'hébergeur et créer les comptes
- [ ] Réserver le nom de domaine
- [ ] Configurer le DNS et obtenir le certificat SSL
- [ ] Créer la base PostgreSQL de production
- [ ] Générer et stocker tous les secrets de manière sécurisée
- [ ] Tester la sauvegarde et la restauration sur base de test

### Déploiement initial
- [ ] Déployer l'API avec les variables d'environnement production
- [ ] Exécuter les migrations avec le compte privilégié
- [ ] Créer le(s) compte(s) administrateur via seed sécurisé
- [ ] Déployer le frontend Web
- [ ] Vérifier `/health` et requête réelle à `/api/v1/jurisdictions`
- [ ] Tester la connexion administrateur
- [ ] Vérifier HTTPS et redirection HTTP → HTTPS
- [ ] Valider les en-têtes de sécurité

### Validation des données
- [ ] Importer les 12 tribunaux validés (avec autorisation institutionnelle)
- [ ] Vérifier chaque fiche manuellement
- [ ] Ajouter contacts institutionnels si disponibles
- [ ] Publier uniquement les juridictions vérifiées terrain
- [ ] Tester le parcours complet : recherche → fiche → carte → itinéraire

### Post-déploiement
- [ ] Configurer la sauvegarde automatique quotidienne
- [ ] Mettre en place le monitoring (uptime, erreurs, performances)
- [ ] Documenter les procédures d'urgence (restauration, rollback)
- [ ] Former les administrateurs pilotes
- [ ] Préparer le canal de remontée des bugs/retours

### Avant ouverture aux testeurs
- [ ] Tester tous les critères d'acceptation bloquants
- [ ] Vérifier l'affichage mobile (390px minimum)
- [ ] Tester la navigation clavier complète
- [ ] Valider l'accessibilité de base
- [ ] Préparer la communication aux 10 testeurs pilotes

## Limites encore ouvertes

La carte commune et les itinéraires à pied, à vélo et en voiture sont implémentés.
Les modes moto et train restent indisponibles ; valider le service externe et ses
conditions de confidentialité et de charge avant le pilote.

L'aperçu local ne crée pas de compte administrateur automatiquement (sécurité).
Les tests existants (30 passants) ne remplacent pas la recette de bout en bout,
mobile et accessibilité.

Les politiques d'utilisation des tuiles OpenStreetMap et du service de routage
OSRM doivent être validées avant le pilote (vérifier les quotas et conditions).

## Support et maintenance post-pilote

**À définir avant le lancement :**
- Responsable technique de l'infrastructure
- Procédure de mise à jour des dépendances (mensuellement recommandé)
- Calendrier de révision des données des tribunaux
- Process de traitement des signalements
- Politique de réponse aux incidents de sécurité
