# Registre des décisions d'architecture

- ADR-001 : architecture Web/API séparée et monorepo pnpm — accepté ;
- ADR-002 : PostgreSQL/PostGIS et `geography(Point, 4326)` — accepté ;
- ADR-003 : authentification administrative par session — accepté ;
- ADR-004 : pilote API mono-instance avec stores locaux — accepté temporairement.

ADR-004 interdit une mise à l'échelle horizontale avant adoption d'un store partagé
pour les sessions et la limitation de requêtes. Toute décision d'hébergement, de
fournisseur de tuiles ou d'authentification renforcée doit être ajoutée à ce registre.
