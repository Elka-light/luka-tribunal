import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSeeder {
  async run() {
    await db.rawQuery(`
      INSERT INTO jurisdictions (
        slug, official_name, common_name, jurisdiction_type, province, city,
        address, location, coordinate_precision_meters, coordinate_source,
        information_source, collected_at, verified_at, status, published_at
      ) VALUES (
        'tribunal-enfants-demo-kinshasa',
        'Tribunal pour enfants de démonstration — Kinshasa',
        'Tribunal démo Kinshasa',
        'tribunal_for_children',
        'Kinshasa',
        'Kinshasa',
        'Adresse fictive — ne pas utiliser pour un déplacement réel',
        ST_SetSRID(ST_MakePoint(15.322, -4.325), 4326)::geography,
        1000,
        'Coordonnées fictives pour tests techniques',
        'Donnée fictive de démonstration — aucune source institutionnelle',
        CURRENT_DATE,
        CURRENT_DATE,
        'published',
        now()
      )
      ON CONFLICT (slug) DO NOTHING;
    `)

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    const adminPassword = process.env.ADMIN_PASSWORD
    if (adminEmail && adminPassword && adminPassword.length >= 12) {
      const existingAdmin = await db.from('admin_users').where('email', adminEmail).first()
      if (!existingAdmin) {
        await db.table('admin_users').insert({
          email: adminEmail,
          password_hash: await hash.make(adminPassword),
          display_name: process.env.ADMIN_DISPLAY_NAME?.trim() || 'Administrateur pilote',
        })
      }
    }
  }
}
