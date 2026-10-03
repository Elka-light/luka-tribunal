import { createAdminJurisdictionValidator } from '#validators/admin_jurisdiction'
import { toPostgisPoint } from '#services/coordinates'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminJurisdictionsController {
  async index() {
    return {
      data: await db
        .from('jurisdictions')
        .select(
          'id',
          'slug',
          'official_name as officialName',
          'jurisdiction_type as jurisdictionType',
          'status',
          'province',
          'city',
          'address',
          'coordinate_source as coordinateSource',
          'information_source as informationSource',
          db.raw('verified_at::text AS "verifiedAt"'),
          db.raw('ST_Y(location::geometry) AS latitude'),
          db.raw('ST_X(location::geometry) AS longitude')
        )
        .whereNull('archived_at')
        .orderBy('official_name'),
    }
  }

  async store({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(createAdminJurisdictionValidator)
    const [longitude, latitude] = toPostgisPoint(payload)
    const id = await db.transaction(async (trx) => {
      const [created] = await trx
        .table('jurisdictions')
        .insert({
          slug: payload.slug,
          official_name: payload.officialName,
          jurisdiction_type: payload.jurisdictionType,
          province: payload.province,
          city: payload.city || null,
          address: payload.address,
          location: trx.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography', [
            longitude,
            latitude,
          ]),
          coordinate_source: payload.coordinateSource,
          information_source: payload.informationSource,
          verified_at: payload.verifiedAt || null,
          created_by: auth.user!.id,
          updated_by: auth.user!.id,
        })
        .returning('id')
      await trx.table('audit_logs').insert({
        actor_id: auth.user!.id,
        action: 'jurisdiction.created',
        entity_type: 'jurisdiction',
        entity_id: created.id,
      })
      return created.id
    })
    return response.created({ data: { id, status: 'draft' } })
  }

  async update({ params, request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(createAdminJurisdictionValidator)
    const [longitude, latitude] = toPostgisPoint(payload)
    const updated = await db.transaction(async (trx) => {
      const rows = await trx
        .from('jurisdictions')
        .where('id', params.id)
        .whereIn('status', ['draft', 'pending_verification', 'pending_correction'])
        .update({
          slug: payload.slug,
          official_name: payload.officialName,
          jurisdiction_type: payload.jurisdictionType,
          province: payload.province,
          city: payload.city || null,
          address: payload.address,
          location: trx.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography', [
            longitude,
            latitude,
          ]),
          coordinate_source: payload.coordinateSource,
          information_source: payload.informationSource,
          verified_at: payload.verifiedAt || null,
          updated_by: auth.user!.id,
          updated_at: new Date(),
        })
      if (rows) {
        await trx.table('audit_logs').insert({
          actor_id: auth.user!.id,
          action: 'jurisdiction.updated',
          entity_type: 'jurisdiction',
          entity_id: params.id,
        })
      }
      return rows
    })
    if (!updated) {
      return response.notFound({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Fiche introuvable ou non modifiable.' },
      })
    }
    return { data: { id: params.id } }
  }

  async publish({ params, auth, response }: HttpContext) {
    const updated = await db.transaction(async (trx) => {
      const rows = await trx
        .from('jurisdictions')
        .where('id', params.id)
        .whereIn('status', ['draft', 'pending_correction'])
        .whereNotNull('verified_at')
        .update({ status: 'published', published_at: new Date(), updated_by: auth.user!.id })
      if (rows) {
        await trx.table('audit_logs').insert({
          actor_id: auth.user!.id,
          action: 'jurisdiction.published',
          entity_type: 'jurisdiction',
          entity_id: params.id,
        })
      }
      return rows
    })
    if (!updated) {
      return response.unprocessableEntity({
        error: {
          code: 'PUBLICATION_NOT_ALLOWED',
          message: 'La fiche doit être vérifiée avant publication.',
        },
      })
    }
    return { data: { id: params.id, status: 'published' } }
  }

  async requestCorrection({ params, auth, response }: HttpContext) {
    const updated = await db.transaction(async (trx) => {
      const rows = await trx
        .from('jurisdictions')
        .where({ id: params.id, status: 'published' })
        .whereNull('archived_at')
        .update({ status: 'pending_correction', updated_by: auth.user!.id, updated_at: new Date() })
      if (rows) {
        await trx.table('audit_logs').insert({
          actor_id: auth.user!.id,
          action: 'jurisdiction.correction_requested',
          entity_type: 'jurisdiction',
          entity_id: params.id,
        })
      }
      return rows
    })
    if (!updated) {
      return response.unprocessableEntity({
        error: {
          code: 'CORRECTION_NOT_ALLOWED',
          message: 'Seule une fiche publiée peut être mise en correction.',
        },
      })
    }
    return { data: { id: params.id, status: 'pending_correction' } }
  }
}
