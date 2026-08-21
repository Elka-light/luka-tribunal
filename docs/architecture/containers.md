# Conteneurs logiques du MVP

- Web Next.js : pages, formulaires, liste, fiche, carte et administration ;
- API AdonisJS : validation, règles métier, sessions, autorisation et audit ;
- PostgreSQL/PostGIS : intégrité relationnelle et géographique ;
- proxy HTTPS : terminaison TLS, limites réseau et en-têtes d'infrastructure.

Le Web et l'API sont déployables séparément. CORS contient une liste exacte d'origines.
PostgreSQL reste privé. Le pilote initial utilise une seule instance API ; toute mise à
l'échelle exige un store partagé pour sessions et rate limiting et une nouvelle revue
du modèle de menaces.
