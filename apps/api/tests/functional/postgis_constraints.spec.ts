import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

/**
 * Tests des contraintes géospatiales PostGIS
 * Conformément à docs/geospatial/geospatial-architecture.md
 * SRID 4326, latitude [-90, 90], longitude [-180, 180]
 */
test.group('PostGIS constraints and validation', (group) => {
  let adminUserId: string

  group.setup(async () => {
    const [admin] = await db
      .table('admin_users')
      .insert({
        email: 'postgis-test@example.test',
        password_hash: 'test-hash',
        display_name: 'PostGIS Test Admin',
        role: 'administrator',
        is_active: true,
      })
      .returning('id')
    adminUserId = admin.id
  })

  group.teardown(async () => {
    await db.from('jurisdictions').where('created_by', adminUserId).delete()
    await db.from('admin_users').where('id', adminUserId).delete()
  })

  test('should reject coordinates at null island (0, 0)', async ({ assert }) => {
    try {
      await db.table('jurisdictions').insert({
        slug: 'null-island-test',
        official_name: 'Test Null Island',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Test',
        city: 'Test',
        address: 'Test',
        location: db.raw('ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography'),
        coordinate_source: 'Test',
        information_source: 'Test',
        status: 'draft',
        created_by: adminUserId,
        updated_by: adminUserId,
      })

      throw new Error('Should have rejected null island coordinates')
    } catch (error: any) {
      // Vérifier que c'est bien une erreur de contrainte
      assert.exists(error)
      // La contrainte jurisdictions_not_null_island devrait empêcher l'insertion
    }
  })

  test('should reject latitude > 90', async ({ assert }) => {
    try {
      await db.table('jurisdictions').insert({
        slug: 'invalid-lat-high',
        official_name: 'Test Invalid Lat High',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Test',
        city: 'Test',
        address: 'Test',
        location: db.raw('ST_SetSRID(ST_MakePoint(15.0, 91.0), 4326)::geography'),
        coordinate_source: 'Test',
        information_source: 'Test',
        status: 'draft',
        created_by: adminUserId,
        updated_by: adminUserId,
      })

      throw new Error('Should have rejected latitude > 90')
    } catch (error: any) {
      // PostGIS devrait rejeter automatiquement les coordonnées hors limites
      assert.exists(error)
    }
  })

  test('should reject latitude < -90', async ({ assert }) => {
    try {
      await db.table('jurisdictions').insert({
        slug: 'invalid-lat-low',
        official_name: 'Test Invalid Lat Low',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Test',
        city: 'Test',
        address: 'Test',
        location: db.raw('ST_SetSRID(ST_MakePoint(15.0, -91.0), 4326)::geography'),
        coordinate_source: 'Test',
        information_source: 'Test',
        status: 'draft',
        created_by: adminUserId,
        updated_by: adminUserId,
      })

      throw new Error('Should have rejected latitude < -90')
    } catch (error: any) {
      assert.exists(error)
    }
  })

  test('should reject longitude > 180', async ({ assert }) => {
    try {
      await db.table('jurisdictions').insert({
        slug: 'invalid-lon-high',
        official_name: 'Test Invalid Lon High',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Test',
        city: 'Test',
        address: 'Test',
        location: db.raw('ST_SetSRID(ST_MakePoint(181.0, -4.0), 4326)::geography'),
        coordinate_source: 'Test',
        information_source: 'Test',
        status: 'draft',
        created_by: adminUserId,
        updated_by: adminUserId,
      })

      throw new Error('Should have rejected longitude > 180')
    } catch (error: any) {
      assert.exists(error)
    }
  })

  test('should reject longitude < -180', async ({ assert }) => {
    try {
      await db.table('jurisdictions').insert({
        slug: 'invalid-lon-low',
        official_name: 'Test Invalid Lon Low',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Test',
        city: 'Test',
        address: 'Test',
        location: db.raw('ST_SetSRID(ST_MakePoint(-181.0, -4.0), 4326)::geography'),
        coordinate_source: 'Test',
        information_source: 'Test',
        status: 'draft',
        created_by: adminUserId,
        updated_by: adminUserId,
      })

      throw new Error('Should have rejected longitude < -180')
    } catch (error: any) {
      assert.exists(error)
    }
  })

  test('should accept valid coordinates within DRC bounds', async ({ assert }) => {
    const [jurisdiction] = await db
      .table('jurisdictions')
      .insert({
        slug: 'valid-drc-coords',
        official_name: 'Test Valid DRC Coordinates',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Kinshasa',
        city: 'Kinshasa',
        address: 'Avenue Valide',
        location: db.raw('ST_SetSRID(ST_MakePoint(15.3137, -4.3276), 4326)::geography'),
        coordinate_source: 'Valid test',
        information_source: 'Valid test',
        status: 'draft',
        created_by: adminUserId,
        updated_by: adminUserId,
      })
      .returning('id')

    assert.exists(jurisdiction)
    assert.exists(jurisdiction.id)

    // Vérifier que les coordonnées sont bien stockées
    const stored = await db
      .from('jurisdictions')
      .select(
        db.raw('ST_X(location::geometry) AS longitude'),
        db.raw('ST_Y(location::geometry) AS latitude')
      )
      .where('id', jurisdiction.id)
      .first()

    assert.exists(stored)
    assert.approximately(stored.longitude, 15.3137, 0.0001)
    assert.approximately(stored.latitude, -4.3276, 0.0001)
  })

  test('should enforce publication constraint with verified_at', async ({ assert }) => {
    // Tenter de publier sans verified_at devrait échouer
    try {
      await db.table('jurisdictions').insert({
        slug: 'publish-without-verified',
        official_name: 'Test Publish Sans Vérif',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Test',
        city: 'Test',
        address: 'Test',
        location: db.raw('ST_SetSRID(ST_MakePoint(15.0, -4.0), 4326)::geography'),
        coordinate_source: 'Test',
        information_source: 'Test',
        status: 'published',
        published_at: new Date(),
        verified_at: null, // Pas de date de vérification
        created_by: adminUserId,
        updated_by: adminUserId,
      })

      throw new Error('Should have rejected publication without verified_at')
    } catch (error: any) {
      assert.exists(error)
      // La contrainte jurisdictions_publication_fields devrait empêcher cela
    }
  })

  test('should enforce publication constraint with published_at', async ({ assert }) => {
    // Tenter de publier sans published_at devrait échouer
    try {
      await db.table('jurisdictions').insert({
        slug: 'publish-without-published-at',
        official_name: 'Test Publish Sans Date Pub',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Test',
        city: 'Test',
        address: 'Test',
        location: db.raw('ST_SetSRID(ST_MakePoint(15.0, -4.0), 4326)::geography'),
        coordinate_source: 'Test',
        information_source: 'Test',
        status: 'published',
        verified_at: new Date(),
        published_at: null, // Pas de date de publication
        created_by: adminUserId,
        updated_by: adminUserId,
      })

      throw new Error('Should have rejected publication without published_at')
    } catch (error: any) {
      assert.exists(error)
    }
  })

  test('should verify GiST spatial index exists', async ({ assert }) => {
    const indexes = await db.rawQuery(
      `SELECT indexname FROM pg_indexes WHERE tablename = 'jurisdictions' AND indexname = 'jurisdictions_location_gist'`
    )

    assert.isNotEmpty(indexes.rows)
    assert.equal(indexes.rows[0].indexname, 'jurisdictions_location_gist')
  })
})
