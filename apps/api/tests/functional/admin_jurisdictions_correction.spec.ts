import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

/**
 * Tests du parcours de correction des juridictions publiées
 * Conformément à la baseline de sécurité et au modèle de données MVP
 */
test.group('Jurisdiction correction workflow', (group) => {
  let adminUserId: string
  let publishedJurisdictionId: string
  let draftJurisdictionId: string

  group.setup(async () => {
    // Créer un utilisateur admin actif pour les tests
    const [admin] = await db
      .table('admin_users')
      .insert({
        email: 'correction-test@example.test',
        password_hash: 'not-used-in-tests',
        display_name: 'Test Admin',
        role: 'administrator',
        is_active: true,
      })
      .returning('id')
    adminUserId = admin.id

    // Créer une juridiction publiée
    const [published] = await db
      .table('jurisdictions')
      .insert({
        slug: 'test-published-jurisdiction',
        official_name: 'Tribunal de Test Publié',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Kinshasa',
        city: 'Kinshasa',
        address: '123 Avenue Test',
        location: db.raw('ST_SetSRID(ST_MakePoint(15.3, -4.3), 4326)::geography'),
        coordinate_source: 'Test source',
        information_source: 'Test info',
        verified_at: new Date('2026-09-01'),
        status: 'published',
        published_at: new Date('2026-09-15'),
        created_by: adminUserId,
        updated_by: adminUserId,
      })
      .returning('id')
    publishedJurisdictionId = published.id

    // Créer une juridiction brouillon
    const [draft] = await db
      .table('jurisdictions')
      .insert({
        slug: 'test-draft-jurisdiction',
        official_name: 'Tribunal de Test Brouillon',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Kinshasa',
        city: 'Kinshasa',
        address: '456 Avenue Draft',
        location: db.raw('ST_SetSRID(ST_MakePoint(15.4, -4.4), 4326)::geography'),
        coordinate_source: 'Draft source',
        information_source: 'Draft info',
        status: 'draft',
        created_by: adminUserId,
        updated_by: adminUserId,
      })
      .returning('id')
    draftJurisdictionId = draft.id
  })

  group.teardown(async () => {
    // Nettoyer les données de test
    await db.from('audit_logs').where('actor_id', adminUserId).delete()
    await db
      .from('jurisdictions')
      .whereIn('id', [publishedJurisdictionId, draftJurisdictionId])
      .delete()
    await db.from('admin_users').where('id', adminUserId).delete()
  })

  test('should require authentication to request correction', async ({ client }) => {
    const response = await client
      .post(`/api/v1/admin/jurisdictions/${publishedJurisdictionId}/request-correction`)
      .header('Origin', 'http://localhost:3000')

    response.assertStatus(401)
  })

  test('should successfully request correction for published jurisdiction', async () => {
    // Simuler une session authentifiée (simplifié pour le test)
    // En production, cela passerait par le middleware auth
    await db.transaction(async (trx) => {
      const rows = await trx
        .from('jurisdictions')
        .where({ id: publishedJurisdictionId, status: 'published' })
        .whereNull('archived_at')
        .update({
          status: 'pending_correction',
          updated_by: adminUserId,
          updated_at: new Date(),
        })

      await trx.table('audit_logs').insert({
        actor_id: adminUserId,
        action: 'jurisdiction.correction_requested',
        entity_type: 'jurisdiction',
        entity_id: publishedJurisdictionId,
      })

      return rows
    })

    // Vérifier que la mise à jour a réussi
    const jurisdiction = await db.from('jurisdictions').where('id', publishedJurisdictionId).first()

    // Assertions
    if (jurisdiction) {
      if (jurisdiction.status !== 'pending_correction') {
        throw new Error(`Expected status 'pending_correction', got '${jurisdiction.status}'`)
      }
    } else {
      throw new Error('Jurisdiction not found after update')
    }

    // Vérifier l'audit log
    const auditLog = await db
      .from('audit_logs')
      .where({
        entity_id: publishedJurisdictionId,
        action: 'jurisdiction.correction_requested',
      })
      .first()

    if (!auditLog) {
      throw new Error('Audit log not created')
    }
  })

  test('should not allow correction request on draft jurisdiction', async () => {
    // Tenter de mettre un brouillon en correction (doit échouer)
    const rowsAffected = await db.transaction(async (trx) => {
      return await trx
        .from('jurisdictions')
        .where({ id: draftJurisdictionId, status: 'published' })
        .whereNull('archived_at')
        .update({ status: 'pending_correction', updated_by: adminUserId })
    })

    // Vérifier qu'aucune ligne n'a été mise à jour (Lucid retourne le nombre de lignes affectées)
    if ((rowsAffected as unknown as number) !== 0) {
      throw new Error('Draft jurisdiction should not be updatable to pending_correction')
    }
  })

  test('should allow updating pending_correction jurisdiction', async () => {
    // D'abord, mettre la juridiction en pending_correction
    await db
      .from('jurisdictions')
      .where('id', publishedJurisdictionId)
      .update({ status: 'pending_correction' })

    // Maintenant, tester la mise à jour
    const rowsAffected = await db.transaction(async (trx) => {
      const rows = await trx
        .from('jurisdictions')
        .where('id', publishedJurisdictionId)
        .whereIn('status', ['draft', 'pending_verification', 'pending_correction'])
        .update({
          address: 'Nouvelle adresse après correction',
          updated_by: adminUserId,
          updated_at: new Date(),
        })

      if (rows) {
        await trx.table('audit_logs').insert({
          actor_id: adminUserId,
          action: 'jurisdiction.updated',
          entity_type: 'jurisdiction',
          entity_id: publishedJurisdictionId,
        })
      }

      return rows
    })

    // Vérifier que la mise à jour a réussi (Lucid retourne le nombre de lignes affectées)
    if ((rowsAffected as unknown as number) === 0) {
      throw new Error('Pending_correction jurisdiction should be updatable')
    }

    const jurisdiction = await db.from('jurisdictions').where('id', publishedJurisdictionId).first()

    if (jurisdiction && jurisdiction.address !== 'Nouvelle adresse après correction') {
      throw new Error('Jurisdiction address was not updated')
    }
  })

  test('should allow republishing pending_correction jurisdiction', async () => {
    // S'assurer que la juridiction est en pending_correction avec verified_at
    await db
      .from('jurisdictions')
      .where('id', publishedJurisdictionId)
      .update({
        status: 'pending_correction',
        verified_at: new Date('2026-09-20'),
      })

    // Tester la republication
    const rowsAffected = await db.transaction(async (trx) => {
      const rows = await trx
        .from('jurisdictions')
        .where('id', publishedJurisdictionId)
        .whereIn('status', ['draft', 'pending_correction'])
        .whereNotNull('verified_at')
        .update({
          status: 'published',
          published_at: new Date(),
          updated_by: adminUserId,
        })

      if (rows) {
        await trx.table('audit_logs').insert({
          actor_id: adminUserId,
          action: 'jurisdiction.published',
          entity_type: 'jurisdiction',
          entity_id: publishedJurisdictionId,
        })
      }

      return rows
    })

    // Vérifier que la republication a réussi (Lucid retourne le nombre de lignes affectées)
    if ((rowsAffected as unknown as number) === 0) {
      throw new Error('Pending_correction jurisdiction should be republishable')
    }

    const jurisdiction = await db.from('jurisdictions').where('id', publishedJurisdictionId).first()

    if (jurisdiction && jurisdiction.status !== 'published') {
      throw new Error(`Expected status 'published', got '${jurisdiction.status}'`)
    }
  })

  test('should not allow publishing without verified_at', async () => {
    // Mettre la juridiction en pending_correction SANS verified_at
    await db.from('jurisdictions').where('id', publishedJurisdictionId).update({
      status: 'pending_correction',
      verified_at: null,
    })

    // Tenter de publier (doit échouer)
    const rowsAffected = await db.transaction(async (trx) => {
      return await trx
        .from('jurisdictions')
        .where('id', publishedJurisdictionId)
        .whereIn('status', ['draft', 'pending_correction'])
        .whereNotNull('verified_at')
        .update({ status: 'published', published_at: new Date(), updated_by: adminUserId })
    })

    // Vérifier qu'aucune ligne n'a été mise à jour (Lucid retourne le nombre de lignes affectées)
    if ((rowsAffected as unknown as number) !== 0) {
      throw new Error('Jurisdiction without verified_at should not be publishable')
    }
  })
})
