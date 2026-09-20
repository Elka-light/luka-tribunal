# Architecture géospatiale du MVP — LUKA TRIBUNAL

## 1. Décision

Les positions des juridictions sont stockées dans PostgreSQL/PostGIS avec le type
`geography(Point, 4326)`. Ce type permet des calculs en mètres sur le référentiel
WGS 84 et évite d'introduire une formule de distance simplifiée dans l'application.

Le navigateur utilise Leaflet et les tuiles OpenStreetMap pour l'affichage. La liste
des résultats reste entièrement utilisable si la carte ou les tuiles échouent.

## 2. Convention de coordonnées

- latitude : axe nord-sud, intervalle `[-90, 90]` ;
- longitude : axe est-ouest, intervalle `[-180, 180]` ;
- SRID : `4326` ;
- construction PostGIS : `ST_MakePoint(longitude, latitude)` ;
- GeoJSON : `[longitude, latitude]` ;
- Leaflet : `[latitude, longitude]`.

La différence d'ordre entre GeoJSON/PostGIS et Leaflet doit être rendue explicite
dans les fonctions de conversion et couverte par des tests avec des valeurs non
symétriques. Exemple de test : Kinshasa approximative, longitude `15.322`, latitude
`-4.325`.

## 3. Validation et ingestion

Avant toute écriture :

1. parser des nombres finis, sans coercition ambiguë ;
2. vérifier les bornes latitude et longitude ;
3. exiger la source de la coordonnée ;
4. enregistrer, si connue, la précision estimée en mètres ;
5. construire le point avec `ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)` ;
6. convertir en `geography` ;
7. refuser un point invalide au lieu de le corriger silencieusement.

Les coordonnées `(0, 0)` sont refusées pour le MVP, car elles indiquent généralement
une valeur manquante. Une coordonnée n'est jamais déduite d'une adresse sans conserver
le fournisseur, la date et le niveau de confiance de cette opération.

## 4. Stockage et index

La colonne de référence est :

```sql
location geography(Point, 4326) NOT NULL
```

Un index GiST est obligatoire :

```sql
CREATE INDEX jurisdictions_location_gist
ON jurisdictions USING GIST (location);
```

La latitude et la longitude ne sont pas dupliquées en colonnes persistantes. L'API
les extrait avec `ST_Y(location::geometry)` et `ST_X(location::geometry)`.

## 5. Requêtes

Le MVP recherche d'abord par nom et divisions administratives. Si une recherche de
proximité est ajoutée conformément au périmètre :

- `ST_DWithin` filtre dans un rayon exprimé en mètres ;
- `ST_Distance` calcule une distance en mètres ;
- le point utilisateur est passé comme paramètre et n'est ni stocké ni journalisé ;
- une limite maximale de rayon et de résultats est appliquée ;
- les requêtes sont paramétrées, jamais assemblées en SQL depuis une entrée brute.

Aucune formule de Haversine applicative ne remplace PostGIS.

## 6. Contrat API

L'API publique renvoie des nombres séparés pour réduire les ambiguïtés :

```json
{
  "location": {
    "latitude": -4.325,
    "longitude": 15.322
  }
}
```

Lorsqu'un objet GeoJSON est nécessaire, il respecte RFC 7946 et utilise l'ordre
`[longitude, latitude]`. Le contrat indique toujours l'ordre retenu.

## 7. Géolocalisation du visiteur

La position est demandée uniquement après une action explicite. Elle reste en mémoire
dans le navigateur et sert à centrer la carte. Elle n'est pas envoyée à l'API du MVP,
stockée, placée dans une URL, transmise à un outil analytique ou écrite dans les logs.
Le refus et les erreurs n'empêchent ni la recherche ni la consultation des fiches.

## 8. Carte et services tiers

- la carte affiche l'attribution OpenStreetMap ;
- les tuiles sont chargées seulement lorsque la carte est affichée ;
- l'URL et la politique du fournisseur de tuiles sont configurables ;
- l'ouverture d'un itinéraire est volontaire et signale le recours à un tiers ;
- aucune clé privée de fournisseur cartographique n'est exposée côté client ;
- aucune garantie d'itinéraire n'est donnée par LUKA TRIBUNAL.

La politique du fournisseur de tuiles et le service d'itinéraire de production doivent
être validés avant le pilote public. Le serveur standard d'OpenStreetMap ne doit pas
être considéré comme une infrastructure garantie pour une montée en charge.

## 9. Qualité des coordonnées

Chaque point conserve : source, date de collecte ou vérification, statut et précision
estimée lorsqu'elle est connue. Une vérification humaine est requise avant publication.
Une carte ne constitue pas à elle seule une preuve de l'exactitude institutionnelle.

Tests obligatoires : bornes, valeurs non numériques, inversion détectable, SRID,
extraction latitude/longitude, index GiST et exclusion publique des brouillons.

## Extension demandée le 20 septembre 2026 : carte et itinéraires intégrés

La demande utilisateur étend le MVP : les résultats publiés sont chargés par pages
et affichés sur une carte commune. Un marqueur ou le sélecteur accessible permet de
choisir « Se rendre à ce tribunal ». La liste reste indépendante des tuiles.
« Tous les tribunaux » désigne le référentiel publié disponible, pas un inventaire
national exhaustif : les données actuelles de démonstration sont fictives.

Le départ peut être fourni par géolocalisation volontaire ou clic explicite sur la
carte. Un repère bleu indique le départ ; un bouton permet de l'effacer. Aucun suivi
continu, historique, localStorage ou envoi de position à l'API applicative.

Après information sur le transfert, le bouton « Transmettre et calculer
l’itinéraire » autorise une requête directe du navigateur à FOSSGIS, qui conserve
les requêtes dans ses journaux. Cette action constitue une exception explicite à
la règle précédente de position limitée au navigateur ; la seule géolocalisation
n'autorise pas le transfert au moteur d'itinéraire. Le fournisseur reçoit aussi
l'adresse réseau. Voir https://routing.openstreetmap.de/about.html.

Profils distincts : `routed-foot`, `routed-bike`, `routed-car`. La durée et la distance
proviennent de la réponse OSRM, jamais d'une vitesse moyenne appliquée à une ligne
droite. La géométrie GeoJSON est validée avant conversion vers Leaflet. Les durées
restent indicatives et n'intègrent pas le trafic en temps réel. Aucun profil moto
ni horaire ferroviaire n'est fourni : ces modes sont indiqués indisponibles.

Les requêtes sont séquentielles et espacées d'au moins 1,1 seconde par instance de
page ; elles expirent après 15 secondes et sont annulées lors d'un changement de
départ, de destination, de mode ou au démontage. Les anciennes réponses sont ignorées.
Cette limite locale ne garantit pas un quota agrégé entre visiteurs : l'utilisation
pilote multiutilisateur et les conditions FOSSGIS doivent être validées avant mise
en ligne, ou remplacées par un service dimensionné. Attribution et lien de
correction OpenStreetMap sont affichés. La CSP autorise uniquement l'origine choisie.

Les tests de parsing emploient des fixtures, sans solliciter le fournisseur.
Une panne du fournisseur ne doit ni inventer une durée ni bloquer les fiches.
