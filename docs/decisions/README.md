# Registre des décisions d'architecture

- ADR-001 : architecture Web/API séparée et monorepo pnpm — accepté ;
- ADR-002 : PostgreSQL/PostGIS et `geography(Point, 4326)` — accepté ;
- ADR-003 : authentification administrative par session — accepté ;
- ADR-004 : pilote API mono-instance avec stores locaux — accepté temporairement.
- ADR-005 : AdonisJS 7 et Node.js 24 pour intégrer les correctifs de sécurité — accepté.

ADR-004 interdit une mise à l'échelle horizontale avant adoption d'un store partagé
pour les sessions et la limitation de requêtes. Toute décision d'hébergement, de
fournisseur de tuiles ou d'authentification renforcée doit être ajoutée à ce registre.

ADR-005 remplace la contrainte AdonisJS 6 du cahier initial. Les dépendances AdonisJS
sont alignées sur leurs versions majeures compatibles avec Core 7. Assembler reste
fixé à 8.4.0 tant que Core 7.4.0 n'expose pas un hook `indexEntities` compatible avec
le type `CodeGen` ajouté dans Assembler 8.5.0.
