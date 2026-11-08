# Sources des données — LUKA TRIBUNAL

## 1. Statut des données

Les données actuelles des tribunaux pour enfants sont **en cours de vérification** avant publication dans le MVP pilote.

**Statut dans la base :** `pending_verification`
**Publication publique :** Non (les fiches ne sont pas encore accessibles publiquement)
**Prochaines étapes :** Validation terrain et institutionnelle avant changement de statut à `published`

## 2. Source principale

**Document de référence :** Liste officielle des adresses des Tribunaux pour enfants (TPE)
**Date du document source :** Octobre 2026
**Origine institutionnelle :** À confirmer et documenter avant publication
**Type de document :** Liste administrative des adresses

## 3. Tribunaux répertoriés (12)

### Kinshasa (5 tribunaux)
1. **TPE de Gombe** — N° 100, croisement des avenues Kabambare et Kasa-Vubu, quartier Aketi
2. **TPE de Ngaliema** — Croisement de la route de Matadi et de l'avenue de la Poste, quartier Joli Parc
3. **TPE de Kalamu** — N° A9-AM, avenue Victoire, quartier Matonge
4. **TPE de Matete** — N° 2, avenue de la Plaine, quartier Masiala, 12e Rue résidentielle, commune de Limete
5. **TPE de Kinkole** — Place Sainte-Thérèse, commune de la N'Sele

### Autres provinces (7 tribunaux)
6. **TPE de Bunia** (Ituri) — Boulevard de la Libération, commune de Mbunya
7. **TPE de Mbanza-Ngungu** (Kongo Central) — N° 53, croisement des avenues Monseigneur Nzita et Mobutu
8. **TPE de Kolwezi** (Lualaba) — N° 4, avenue Molo, quartier Mununka
9. **TPE de Mbuji-Mayi** (Kasaï-Oriental) — Avenue du Parquet, quartier Kajiba
10. **TPE de Kananga** (Kasaï-Central) — Avenue du Produit, localité Kamulumba
11. **TPE de Kalemie** (Tanganyika) — Colline d'État, boulevard Lumumba
12. **TPE de Bukavu** (Sud-Kivu) — Quartier Kasali, commune de Kadutu

## 4. Géolocalisation

**Méthode :** Géocodage OpenStreetMap/Nominatim
**Précision actuelle :** Centre-ville (city_center) pour la plupart des tribunaux
**Marge d'erreur estimée :** ≈ 5 km (coordonnées approximatives)
**Coordonnées vérifiées sur le terrain :** 0/12 (en attente)

### Champs géographiques dans la base
- `location` : Point géographique PostGIS (WGS 84, SRID 4326)
- `coordinate_precision_meters` : 5000 mètres (centre-ville) ou 50 mètres (adresse précise)
- `coordinate_source` : "Géocodage OpenStreetMap/Nominatim (city_center)" ou similaire

## 5. Limites et avertissements

⚠️ **Les coordonnées actuelles sont approximatives** (centre-ville uniquement pour la plupart des tribunaux).

⚠️ **Vérification terrain obligatoire** avant publication :
- Confirmer l'existence du tribunal à l'adresse indiquée
- Vérifier l'exactitude de l'adresse postale
- Obtenir les coordonnées GPS précises si possible
- Valider les contacts institutionnels (téléphone, email)

⚠️ **Source institutionnelle à confirmer** :
- Obtenir l'autorisation de publication
- Documenter l'origine exacte du document source
- Établir un contact avec l'institution émettrice
- Mettre en place un processus de mise à jour

## 6. Processus de validation avant publication

### Étape 1 : Validation documentaire
- [ ] Confirmer l'origine institutionnelle du document source
- [ ] Obtenir l'autorisation écrite de publication
- [ ] Vérifier la date de validité des informations

### Étape 2 : Validation terrain (recommandé)
- [ ] Contact téléphonique avec chaque tribunal (si disponible)
- [ ] Confirmation de l'adresse par un acteur local de confiance
- [ ] Obtention des coordonnées GPS précises

### Étape 3 : Validation technique
- [ ] Vérifier que les coordonnées ne tombent pas en zone inhabitée
- [ ] Comparer avec d'autres sources cartographiques si disponibles
- [ ] Valider la cohérence province/ville/adresse

### Étape 4 : Publication
- [ ] Changer le statut à `published` dans la base de données
- [ ] Documenter la date de vérification (`verified_at`)
- [ ] Établir un calendrier de révision périodique

## 7. Responsabilités

**Collecte initiale :** Import automatisé depuis document source
**Vérification :** À attribuer avant pilote
**Validation avant publication :** Responsable du projet
**Mise à jour périodique :** À définir selon la stratégie de maintenance

## 8. Conformité et protection

Ces données concernent uniquement :
- ✅ Adresses institutionnelles publiques
- ✅ Informations de localisation des bâtiments judiciaires
- ✅ Coordonnées institutionnelles (téléphone/email du tribunal)

Ces données **ne contiennent jamais** :
- ❌ Identité d'enfants
- ❌ Dossiers individuels
- ❌ Informations sur des affaires en cours
- ❌ Données personnelles sensibles

## 9. Mise à jour de ce document

**Dernière mise à jour :** 8 novembre 2026
**Prochaine révision prévue :** Avant lancement du pilote
**Responsable :** À définir

---

**Note importante :** Ce document doit être mis à jour à chaque modification des sources ou du processus de validation. Toute publication de données nécessite l'approbation du responsable du projet et le respect de la baseline de sécurité.
