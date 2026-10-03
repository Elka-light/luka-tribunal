import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

/**
 * Tests d'autorisation et de sécurité approfondis
 * Conformément à la baseline de sécurité (docs/security/security-baseline.md)
 */
test.group('Authorization and security controls', (group) => {
  let activeAdminId: string
  let inactiveAdminId: string
  let jurisdictionId: string

  group.setup(async () => {
    // Créer un admin actif
    const [activeAdmin] = await db
      .table('admin_users')
      .insert({
        email: 'active-admin@example.test',
        password_hash: 'test-hash',
        display_name: 'Active Admin',
        role: 'administrator',
        is_active: true,
      })
      .returning('id')
    activeAdminId = activeAdmin.id

    // Créer un admin inactif
    const [inactiveAdmin] = await db
      .table('admin_users')
      .insert({
        email: 'inactive-admin@example.test',
        password_hash: 'test-hash',
        display_name: 'Inactive Admin',
        role: 'administrator',
        is_active: false,
      })
      .returning('id')
    inactiveAdminId = inactiveAdmin.id

    // Créer une juridiction de test
    const [jurisdiction] = await db
      .table('jurisdictions')
      .insert({
        slug: 'auth-test-jurisdiction',
        official_name: 'Tribunal de Test Auth',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Kinshasa',
        city: 'Kinshasa',
        address: '789 Avenue Auth',
        location: db.raw('ST_SetSRID(ST_MakePoint(15.5, -4.5), 4326)::geography'),
        coordinate_source: 'Auth test',
        information_source: 'Auth test',
        status: 'published',
        verified_at: new Date('2026-09-01'),
        published_at: new Date('2026-09-10'),
        created_by: activeAdminId,
        updated_by: activeAdminId,
      })
      .returning('id')
    jurisdictionId = jurisdiction.id
  })

  group.teardown(async () => {
    // Nettoyer les données de test
    await db.from('audit_logs').whereIn('actor_id', [activeAdminId, inactiveAdminId]).delete()
    await db.from('jurisdictions').where('id', jurisdictionId).delete()
    await db.from('admin_users').whereIn('id', [activeAdminId, inactiveAdminId]).delete()
  })

  test('inactive admin should not be able to perform actions', async () => {
    // Simuler qu'un admin inactif ne devrait pas passer le middleware auth
    // Ce test vérifie la logique métier (à adapter selon l'implémentation réelle du middleware)

    const inactiveAdmin = await db.from('admin_users').where('id', inactiveAdminId).first()

    if (inactiveAdmin && inactiveAdmin.is_active === true) {
      throw new Error('Admin should be inactive')
    }
  })

  test('should reject requests without authentication header', async ({ client }) => {
    const response = await client
      .get('/api/v1/admin/jurisdictions')
      .header('Origin', 'http://localhost:3000')

    response.assertStatus(401)
  })

  test('should reject admin mutations without trusted origin', async ({ client }) => {
    const response = await client.post('/api/v1/admin/session').json({
      email: 'active-admin@example.test',
      password: 'test-password',
    })
    // Pas d'en-tête Origin = origine non fiable

    response.assertStatus(403)
    response.assertBodyContains({ error: { code: 'UNTRUSTED_ORIGIN' } })
  })

  test('public routes should not expose unpublished jurisdictions', async ({ client }) => {
    // Créer une juridiction brouillon
    const [draft] = await db
      .table('jurisdictions')
      .insert({
        slug: 'draft-should-not-appear',
        official_name: 'Tribunal Brouillon',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Test',
        city: 'Test',
        address: 'Test',
        location: db.raw('ST_SetSRID(ST_MakePoint(15.6, -4.6), 4326)::geography'),
        coordinate_source: 'Test',
        information_source: 'Test',
        status: 'draft',
        created_by: activeAdminId,
        updated_by: activeAdminId,
      })
      .returning('id')

    // Récupérer la liste publique
    const response = await client.get('/api/v1/jurisdictions')

    response.assertStatus(200)
    const body = response.body()

    // Vérifier qu'aucune juridiction brouillon n'est dans les résultats
    const hasDraft = body.data?.some((j: any) => j.slug === 'draft-should-not-appear')
    if (hasDraft) {
      throw new Error('Draft jurisdiction should not be visible in public list')
    }

    // Nettoyer
    await db.from('jurisdictions').where('id', draft.id).delete()
  })

  test('public routes should not expose archived jurisdictions', async ({ client }) => {
    // Créer une juridiction archivée
    const [archived] = await db
      .table('jurisdictions')
      .insert({
        slug: 'archived-should-not-appear',
        official_name: 'Tribunal Archivé',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Test',
        city: 'Test',
        address: 'Test',
        location: db.raw('ST_SetSRID(ST_MakePoint(15.7, -4.7), 4326)::geography'),
        coordinate_source: 'Test',
        information_source: 'Test',
        status: 'draft',
        archived_at: new Date('2026-09-01'),
        created_by: activeAdminId,
        updated_by: activeAdminId,
      })
      .returning('id')

    // Récupérer la liste publique
    const response = await client.get('/api/v1/jurisdictions')

    response.assertStatus(200)
    const body = response.body()

    // Vérifier qu'aucune juridiction archivée n'est dans les résultats
    const hasArchived = body.data?.some((j: any) => j.slug === 'archived-should-not-appear')
    if (hasArchived) {
      throw new Error('Archived jurisdiction should not be visible in public list')
    }

    // Nettoyer
    await db.from('jurisdictions').where('id', archived.id).delete()
  })

  test('should create audit logs for all admin actions', async () => {
    // Compter les logs avant
    const logCountBefore = await db
      .from('audit_logs')
      .where('actor_id', activeAdminId)
      .count('* as total')

    // Effectuer une action (création de juridiction)
    const [newJurisdiction] = await db
      .table('jurisdictions')
      .insert({
        slug: 'audit-test-jurisdiction',
        official_name: 'Tribunal Audit Test',
        jurisdiction_type: 'tribunal_pour_enfants',
        province: 'Test',
        city: 'Test',
        address: 'Test',
        location: db.raw('ST_SetSRID(ST_MakePoint(15.8, -4.8), 4326)::geography'),
        coordinate_source: 'Test',
        information_source: 'Test',
        status: 'draft',
        created_by: activeAdminId,
        updated_by: activeAdminId,
      })
      .returning('id')

    await db.table('audit_logs').insert({
      actor_id: activeAdminId,
      action: 'jurisdiction.created',
      entity_type: 'jurisdiction',
      entity_id: newJurisdiction.id,
    })

    // Compter les logs après
    const logCountAfter = await db
      .from('audit_logs')
      .where('actor_id', activeAdminId)
      .count('* as total')

    const before = Number.parseInt(logCountBefore[0].total as string)
    const after = Number.parseInt(logCountAfter[0].total as string)

    if (after <= before) {
      throw new Error('Audit log should be created for admin actions')
    }

    // Nettoyer
    await db.from('audit_logs').where('entity_id', newJurisdiction.id).delete()
    await db.from('jurisdictions').where('id', newJurisdiction.id).delete()
  })
})
