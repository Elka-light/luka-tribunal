# API LUKA TRIBUNAL

API REST AdonisJS 7 du MVP. Elle expose la recherche publique des juridictions,
la soumission de signalements non nominatifs et les opérations d'administration.

## Commandes

Depuis la racine du monorepo :

```bash
pnpm --filter api dev
pnpm --filter api test
pnpm --filter api build
```

La configuration locale attendue est documentée dans `.env.example`. Ne jamais
y placer de secret réel. PostgreSQL avec PostGIS est requis pour les migrations.
