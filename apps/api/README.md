# API LUKA TRIBUNAL

API REST AdonisJS 7 du MVP. Elle expose la recherche publique des juridictions,
la soumission de signalements non nominatifs et les opérations d'administration.

## Commandes

Depuis la racine du monorepo :

```bash
pnpm --filter @luka-tribunal/api dev
pnpm --filter @luka-tribunal/api test
pnpm --filter @luka-tribunal/api build
```

La configuration locale attendue est documentée dans `.env.example`. Ne jamais
y placer de secret réel. PostgreSQL avec PostGIS est requis pour les migrations.
