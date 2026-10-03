# Déploiement rapide LUKA TRIBUNAL MVP

**Date:** 3 octobre 2026
**Objectif:** Mise en ligne avant lundi avec les 12 tribunaux géolocalisés

---

## Option 1: Vercel + Neon PostgreSQL (Recommandé - 1h)

### Étape 1: Base de données Neon (10 min)

1. Créer compte sur https://neon.tech (gratuit)
2. Créer nouveau projet "luka-tribunal-mvp"
3. Activer extension PostGIS :
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   ```
4. Noter la connection string : `postgres://user:pass@host/db?sslmode=require`

### Étape 2: Migrations et données (10 min)

1. Exécuter migrations localement vers Neon :
   ```bash
   cd apps/api
   DATABASE_URL="postgres://..." node ace migration:run
   ```

2. Importer les 12 tribunaux :
   ```bash
   psql "postgres://..." < /tmp/import_12_tribunaux_fixed.sql
   ```

3. Créer compte admin :
   ```bash
   psql "postgres://..." <<EOF
   INSERT INTO admin_users (email, password_hash, display_name, role, is_active)
   VALUES ('admin@luka.cd', 'HASH_ICI', 'Admin MVP', 'administrator', true);
   EOF
   ```

### Étape 3: Déployer API sur Railway/Render (20 min)

**Railway.app (recommandé):**
1. Créer compte sur https://railway.app
2. New Project → Deploy from GitHub
3. Sélectionner le dépôt `luka-tribunal`
4. Root directory: `apps/api`
5. Build command: `pnpm install && pnpm run build`
6. Start command: `cd build && node bin/server.js`

**Variables d'environnement:**
```env
NODE_ENV=production
PORT=3333
HOST=0.0.0.0
APP_KEY=[générer avec: node ace generate:key]
LOG_LEVEL=info

DB_HOST=[depuis Neon]
DB_PORT=5432
DB_USER=[depuis Neon]
DB_PASSWORD=[depuis Neon]
DB_DATABASE=[depuis Neon]

CORS_ORIGIN=https://luka-tribunal.vercel.app
SESSION_DRIVER=cookie
```

7. Noter l'URL de l'API: `https://luka-api-xxx.railway.app`

### Étape 4: Déployer Web sur Vercel (15 min)

1. Créer compte sur https://vercel.com
2. Import Git Repository → Sélectionner `luka-tribunal`
3. Framework Preset: Next.js
4. Root Directory: `apps/web`
5. Build Command: `pnpm run build`
6. Output Directory: `.next`

**Variables d'environnement:**
```env
NEXT_PUBLIC_API_URL=https://luka-api-xxx.railway.app
```

7. Deploy → Attendre 2-3 minutes

### Étape 5: Tests critiques (15 min)

1. ✅ Ouvrir https://luka-tribunal.vercel.app
2. ✅ Vérifier affichage du logo
3. ✅ Rechercher "Kinshasa" → Doit afficher 5 TPE
4. ✅ Cliquer sur carte → Marqueurs visibles
5. ✅ Ouvrir fiche tribunal → Adresse + itinéraire
6. ✅ Tester signalement d'erreur
7. ✅ Admin: https://luka-tribunal.vercel.app/administration
8. ✅ Connexion avec admin@luka.cd
9. ✅ Vérifier liste des 13 juridictions
10. ✅ Publier un tribunal en pending_verification

---

## Option 2: Railway.app tout-en-un (45 min)

Railway peut héberger Web + API + PostgreSQL ensemble.

1. Créer projet Railway
2. Add PostgreSQL service (avec PostGIS)
3. Add service "API" (apps/api)
4. Add service "Web" (apps/web)
5. Configurer variables d'environnement
6. Déployer

**Avantage:** Tout au même endroit
**Inconvénient:** Plus lent que Vercel pour le frontend

---

## Checklist avant mise en ligne

- [ ] Les 12 tribunaux sont importés en `pending_verification`
- [ ] Au moins 1 tribunal est `published` pour la démo
- [ ] Compte admin fonctionnel
- [ ] Logo LUKA-TRIBUNAL visible
- [ ] HTTPS activé automatiquement
- [ ] Variables d'environnement sécurisées (pas de secrets en clair)
- [ ] CORS configuré correctement
- [ ] Cookies de session fonctionnent
- [ ] Carte interactive charge OpenStreetMap
- [ ] Itinéraires fonctionnent
- [ ] Signalements s'enregistrent en base

---

## Après déploiement

### Tâches prioritaires:

1. **Vérifier terrain les 12 adresses** pour coordonnées GPS précises
2. **Publier progressivement** après vérification
3. **Créer comptes admin** pour les modérateurs
4. **Tester sur mobile** (Android + iOS)
5. **Configurer sauvegardes** automatiques base de données
6. **Monitorer les erreurs** (Sentry ou équivalent)

### URL à communiquer aux testeurs:

- **Site public:** https://luka-tribunal.vercel.app
- **Administration:** https://luka-tribunal.vercel.app/administration
- **Support:** [Votre email de contact]

---

## Aide rapide

**Problème CORS?**
```env
CORS_ORIGIN=https://votre-domaine.vercel.app
```

**Connexion base refusée?**
- Vérifier que DB_HOST autorise les connexions externes
- Neon: Activer "Allow external connections"

**Build échoue?**
- Vérifier Node.js version 24+ dans les settings
- Vérifier pnpm installé

**API ne démarre pas?**
- Vérifier APP_KEY généré (32 caractères min)
- Vérifier toutes les variables DB_* définies

---

**Support:** Pour toute question, ouvrir une issue GitHub ou contacter l'équipe.
