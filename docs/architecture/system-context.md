# Contexte du système

Acteurs : visiteur public, professionnel de l'orientation et administrateur autorisé.
LUKA TRIBUNAL fournit une orientation institutionnelle, jamais une décision ou un
conseil juridique.

Systèmes externes : fournisseur de tuiles OpenStreetMap, service d'itinéraire externe,
hébergeur et gestionnaire de secrets. Le navigateur public communique avec le Web et
l'API HTTPS. Seule l'API communique avec PostgreSQL/PostGIS. Les dépendances externes
ne reçoivent aucune donnée judiciaire ; la position du visiteur ne quitte pas le
navigateur par l'intermédiaire de l'API.
