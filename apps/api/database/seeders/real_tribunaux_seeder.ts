import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Seeder pour les 12 tribunaux pour enfants géolocalisés
 * Source: Liste officielle des adresses des TPE (octobre 2026)
 * État: pending_verification (nécessite vérification terrain avant publication)
 */
export default class extends BaseSeeder {
  async run() {
    console.log('📋 Chargement des tribunaux géolocalisés...')

    // Charger le fichier JSON des tribunaux géolocalisés
    const dataPath = join(process.cwd(), '..', '..', 'data', 'tribunaux_geolocalises.json')
    const tribunaux = JSON.parse(await readFile(dataPath, 'utf-8'))

    console.log(`   Found ${tribunaux.length} tribunaux to import`)

    // Créer un utilisateur système pour l'import initial
    let systemUserId: number

    const existingSystem = await db.from('admin_users').where('email', 'system@luka-tribunal.local').first()

    if (existingSystem) {
      systemUserId = existingSystem.id
    } else {
      const [systemUser] = await db.table('admin_users').insert({
        email: 'system@luka-tribunal.local',
        password_hash: 'not_usable_account',
        display_name: 'Système (Import automatique)',
        role: 'admin',
        is_active: false, // Compte désactivé, utilisé uniquement pour l'attribution des imports
      }).returning('id')
      systemUserId = systemUser.id
    }

    // Importer chaque tribunal
    for (const tribunal of tribunaux) {
      const slug = `tpe-${tribunal.ville.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${tribunal.id}`

      // Vérifier si existe déjà
      const existing = await db.from('jurisdictions').where('slug', slug).first()
      if (existing) {
        console.log(`   ⏭️  Skipped: ${tribunal.nom} (already exists)`)
        continue
      }

      // Insérer la juridiction
      await db.rawQuery(`
        INSERT INTO jurisdictions (
          slug,
          official_name,
          common_name,
          jurisdiction_type,
          province,
          city,
          address,
          location,
          coordinate_precision_meters,
          coordinate_source,
          information_source,
          collected_at,
          status,
          created_by,
          updated_by
        ) VALUES (
          ?,
          ?,
          ?,
          'tribunal_pour_enfants',
          ?,
          ?,
          ?,
          ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
          ?,
          ?,
          'Liste officielle des adresses des TPE (octobre 2026)',
          CURRENT_DATE,
          'pending_verification',
          ?,
          ?
        )
      `, [
        slug,
        tribunal.nom,
        tribunal.nom.replace('TPE de ', 'Tribunal pour enfants de '),
        tribunal.province,
        tribunal.ville,
        tribunal.adresse + (tribunal.complement_adresse ? ` (${tribunal.complement_adresse})` : ''),
        tribunal.geocode.lon, // longitude en premier pour PostGIS
        tribunal.geocode.lat, // latitude en second
        tribunal.geocode.precision === 'address' ? 50 : 5000, // 50m si adresse précise, 5km si centre-ville
        `Géocodage OpenStreetMap/Nominatim (${tribunal.geocode.precision})`,
        systemUserId,
        systemUserId
      ])

      console.log(`   ✅ Imported: ${tribunal.nom}`)
    }

    console.log(`\n✅ Import terminé: ${tribunaux.length} tribunaux`)
    console.log('⚠️  Statut: pending_verification (vérification terrain requise)')
    console.log('📍 Note: Coordonnées approximatives (centre-ville) pour la plupart')
  }
}
