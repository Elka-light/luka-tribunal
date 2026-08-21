# Format d'erreur API

Les erreurs métier publiques suivent la forme :

```json
{ "error": { "code": "RESOURCE_NOT_FOUND", "message": "Juridiction introuvable." } }
```

Les codes HTTP utilisés sont notamment `401`, `404`, `422`, `429` et `500`. Aucun
message public ne contient pile d'exécution, SQL, chemin interne, secret ou indication
sur l'existence d'un compte administrateur. Les erreurs de validation restent celles
normalisées par AdonisJS/VineJS et sont traitées comme un contrat à stabiliser avant
l'ouverture à des partenaires externes.
