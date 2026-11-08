# 🚀 Guide de déploiement LUKA TRIBUNAL sur Railway

**Date :** 8 novembre 2026
**Durée estimée :** 30-45 minutes
**Coût :** ~$10-20/mois après les $5 gratuits

---

## ✅ Prérequis

- [ ] Compte GitHub (obligatoire pour Railway)
- [ ] Git configuré localement
- [ ] Code local à jour avec toutes les modifications

---

## Étape 1 : Commit et Push sur GitHub (5 min)

### 1.1 Créer un commit avec toutes les améliorations

```bash
# Ajouter tous les fichiers modifiés
git add apps/web/src/components/jurisdiction-detail.tsx
git add apps/web/next.config.ts
git add apps/api/config/session.ts
git add apps/api/start/limiter.ts
git add apps/api/start/routes.ts
git add docs/deployment/deployment-strategy.md
git add data/SOURCES.md
git add railway.json
git add apps/api/railway.toml
git add apps/web/railway.toml
git add .nvmrc

# Créer le commit
git commit -m "feat: prepare production deployment with Railway

- Add complete jurisdiction details display (contacts, territorial jurisdiction)
- Enable strict TypeScript validation (ignoreBuildErrors: false)
- Fix security baseline compliance (8h sessions, 120 req/min public API)
- Add real tribunals data sources documentation
- Create comprehensive deployment strategy
- Add Railway configuration files

Ready for production deployment.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 1.2 Pousser sur GitHub

```bash
# Pousser sur la branche actuelle
git push origin chore/mvp-preview

# OU créer une branche de production
git checkout -b production
git push origin production
```

**⚠️ Important :** Notez le nom de votre dépôt GitHub (ex: `Elka-light/luka-tribunal`)

---

## Étape 2 : Créer un compte Railway (3 min)

1. Allez sur **https://railway.app**
2. Cliquez sur **"Start a New Project"**
3. Choisissez **"Login with GitHub"**
4. Autorisez Railway à accéder à votre dépôt GitHub
5. ✅ Vous obtenez **$5 de crédit gratuit** (pas de carte requise initialement)

---

## Étape 3 : Créer le projet et la base de données (5 min)

### 3.1 Créer un nouveau projet

1. Dans Railway, cliquez sur **"New Project"**
2. Choisissez **"Deploy from GitHub repo"**
3. Sélectionnez votre dépôt **`luka-tribunal`**
4. Railway va détecter le monorepo automatiquement

### 3.2 Ajouter PostgreSQL avec PostGIS

1. Dans votre projet, cliquez sur **"+ New"**
2. Choisissez **"Database"** → **"PostgreSQL"**
3. Attendez que la base soit créée (1-2 minutes)
4. ✅ PostgreSQL est maintenant disponible

### 3.3 Activer l'extension PostGIS

1. Cliquez sur le service **Postgres**
2. Allez dans l'onglet **"Data"** ou **"Query"**
3. Exécutez cette commande SQL :
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   ```
4. ✅ PostGIS est maintenant activé

---

## Étape 4 : Déployer l'API AdonisJS (10 min)

### 4.1 Créer le service API

1. Cliquez sur **"+ New"** → **"GitHub Repo"**
2. Sélectionnez **`luka-tribunal`** à nouveau
3. Railway va créer un nouveau service

### 4.2 Configurer le service API

1. **Root Directory :** Cliquez sur le service → **Settings** → **Root Directory**
   - Définir : `apps/api`

2. **Custom Build Command :** (dans Settings)
   ```bash
   cd ../.. && pnpm install --frozen-lockfile && pnpm --filter api build
   ```

3. **Custom Start Command :**
   ```bash
   cd build && node bin/server.js
   ```

### 4.3 Configurer les variables d'environnement de l'API

Dans l'onglet **Variables** du service API, ajouter :

```bash
NODE_ENV=production
PORT=3333
HOST=0.0.0.0
APP_KEY=<générer ci-dessous>
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_DATABASE=${{Postgres.PGDATABASE}}
CORS_ORIGIN=<à définir après déploiement du frontend>
SESSION_DRIVER=cookie
LOG_LEVEL=info
```

**Générer APP_KEY :**
```bash
# Localement, exécuter :
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copier le résultat dans APP_KEY
```

### 4.4 Déployer

Railway va automatiquement déployer. Attendez que le déploiement réussisse (voyant vert).

1. Notez l'URL de l'API (ex: `https://luka-tribunal-api.up.railway.app`)

---

## Étape 5 : Exécuter les migrations (5 min)

### Option A : Via Railway CLI (recommandé)

1. **Installer Railway CLI :**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login :**
   ```bash
   railway login
   ```

3. **Lier le projet :**
   ```bash
   railway link
   # Sélectionner votre projet
   ```

4. **Exécuter les migrations :**
   ```bash
   railway run --service api node ace migration:run
   ```

### Option B : Via le dashboard Railway

1. Dans le service API, onglet **Settings**
2. **One-off Command :**
   ```bash
   cd build && node ace migration:run
   ```

✅ Les migrations sont appliquées !

---

## Étape 6 : Déployer le Frontend Next.js (8 min)

### 6.1 Créer le service Frontend

1. Cliquez sur **"+ New"** → **"GitHub Repo"**
2. Sélectionnez **`luka-tribunal`** à nouveau

### 6.2 Configurer le service Frontend

1. **Root Directory :**
   - Définir : `apps/web`

2. **Custom Build Command :**
   ```bash
   cd ../.. && pnpm install --frozen-lockfile && pnpm --filter web build
   ```

3. **Custom Start Command :**
   ```bash
   pnpm run start
   ```

### 6.3 Configurer les variables d'environnement du Frontend

Dans l'onglet **Variables** du service Web :

```bash
NEXT_PUBLIC_API_URL=https://votre-api.up.railway.app
```

Remplacez `votre-api.up.railway.app` par l'URL de votre API (Étape 4.4).

### 6.4 Déployer

Railway va déployer automatiquement.

1. ✅ Notez l'URL du frontend (ex: `https://luka-tribunal.up.railway.app`)

---

## Étape 7 : Finaliser la configuration CORS (2 min)

1. Retournez dans le service **API**
2. Variables → **CORS_ORIGIN**
3. Mettez l'URL du frontend : `https://luka-tribunal.up.railway.app`
4. Railway va redéployer automatiquement

---

## Étape 8 : Charger les données et publier un tribunal (5 min)

### 8.1 Créer un compte administrateur

Via Railway CLI ou One-off Command :

```bash
# Avec les variables d'environnement
ADMIN_EMAIL=votre@email.com ADMIN_PASSWORD=VotreMotDePasseSecurise123! railway run --service api node ace db:seed
```

### 8.2 Charger les 12 tribunaux

```bash
railway run --service api node ace db:seed --files=database/seeders/real_tribunaux_seeder.ts
```

### 8.3 Publier un tribunal pour test

1. Connectez-vous à l'interface admin : `https://votre-frontend.up.railway.app/administration`
2. Email : `votre@email.com`
3. Mot de passe : `VotreMotDePasseSecurise123!`
4. Trouvez un tribunal dans la liste
5. Cliquez sur "Demander correction" (pour modifier)
6. Modifiez si nécessaire
7. Cliquez sur "Publier"

---

## Étape 9 : Configurer un domaine personnalisé (optionnel, 5 min)

### Si vous avez un domaine :

1. **Frontend :**
   - Service Web → Settings → **Generate Domain**
   - Ou **Custom Domain** → ajouter `luka-tribunal.cd`

2. **API :**
   - Service API → Settings → **Generate Domain**
   - Ou **Custom Domain** → ajouter `api.luka-tribunal.cd`

3. **Configurer le DNS :**
   - Type : CNAME
   - Nom : `@` (ou `luka-tribunal`)
   - Valeur : fournie par Railway

---

## Étape 10 : Vérification finale (5 min)

### ✅ Checklist de vérification :

- [ ] Frontend accessible : `https://votre-frontend.up.railway.app`
- [ ] API répond : `https://votre-api.up.railway.app/health`
- [ ] Recherche fonctionne (au moins 1 tribunal publié)
- [ ] Carte s'affiche correctement
- [ ] Fiche juridiction avec toutes les sections
- [ ] Itinéraires fonctionnent (à pied, vélo, voiture)
- [ ] Formulaire de signalement fonctionne
- [ ] Interface admin accessible
- [ ] Connexion admin fonctionne

### Tests rapides :

```bash
# Tester l'API
curl https://votre-api.up.railway.app/health

# Tester les juridictions
curl https://votre-api.up.railway.app/api/v1/jurisdictions
```

---

## 🎉 Félicitations !

Votre application est maintenant **EN LIGNE** !

**URLs à partager :**
- 🌐 **Application publique :** https://votre-frontend.up.railway.app
- 🔧 **Interface admin :** https://votre-frontend.up.railway.app/administration
- 📡 **API :** https://votre-api.up.railway.app

---

## 📊 Surveillance et maintenance

### Dans Railway Dashboard :

1. **Metrics :** Voir CPU, RAM, requêtes
2. **Logs :** Voir les logs en temps réel
3. **Deployments :** Historique des déploiements
4. **Usage :** Consommation du crédit

### Redéploiement automatique :

Railway redéploie automatiquement à chaque **`git push`** sur la branche configurée.

---

## 🆘 Dépannage

### Problème : Build échoue

**Solution :**
- Vérifier les logs dans Railway
- Vérifier que `pnpm install` fonctionne localement
- Vérifier que les chemins de `Root Directory` sont corrects

### Problème : API ne démarre pas

**Solution :**
- Vérifier les variables d'environnement (surtout `APP_KEY`)
- Vérifier les logs pour voir l'erreur exacte
- Vérifier que les migrations sont appliquées

### Problème : Frontend affiche une erreur

**Solution :**
- Vérifier que `NEXT_PUBLIC_API_URL` pointe vers l'API
- Vérifier que `CORS_ORIGIN` dans l'API correspond au frontend
- Vérifier que l'API répond bien (`/health`)

### Problème : Pas de données

**Solution :**
- Exécuter les seeders (étape 8.2)
- Vérifier que les migrations sont appliquées
- Se connecter à l'admin et publier au moins un tribunal

---

## 💰 Coûts estimés

| Service | Ressources | Prix mensuel |
|---------|-----------|--------------|
| PostgreSQL | 256 MB RAM | ~$5 |
| API (AdonisJS) | 512 MB RAM | ~$5 |
| Frontend (Next.js) | 512 MB RAM | ~$5 |
| **Total** | | **~$15/mois** |

**Crédit gratuit :** $5/mois (≈ 1 mois gratuit)

---

## 🔒 Sécurité

✅ **Déjà configuré :**
- HTTPS automatique (Railway)
- Variables d'environnement sécurisées
- Secrets non versionnés
- Sessions 8h
- Limitation de requêtes

⚠️ **À faire :**
- Changer le mot de passe admin après la première connexion
- Surveiller les logs pour activités suspectes
- Configurer les sauvegardes PostgreSQL (Railway Pro)

---

**Bon déploiement ! 🚀**
