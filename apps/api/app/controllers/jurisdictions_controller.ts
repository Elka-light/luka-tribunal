import { jurisdictionSlugValidator, listJurisdictionsValidator } from '#validators/jurisdiction'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

const publicColumns = [
  'id',
  'slug',
  'official_name as officialName',
  'common_name as commonName',
  'jurisdiction_type as jurisdictionType',
  'province',
  'city',
  'address',
  'information_source as informationSource',
] as const

export default class JurisdictionsController {
  async index({ request }: HttpContext) {
    const filters = await listJurisdictionsValidator.validate(request.qs())
    const query = db
      .from('jurisdictions')
      .select(...publicColumns)
      .select(
        db.raw('verified_at::text AS "verifiedAt"'),
        db.raw('ST_Y(location::geometry) AS latitude'),
        db.raw('ST_X(location::geometry) AS longitude')
      )
      .where('status', 'published')
      .whereNull('archived_at')
      .orderBy('official_name', 'asc')
      .orderBy('id', 'asc')
      .offset(filters.offset ?? 0)
      .limit((filters.limit ?? 20) + 1)

    if (filters.q) {
      query.where((builder) => {
        builder
          .whereILike('official_name', `%${filters.q}%`)
          .orWhereILike('common_name', `%${filters.q}%`)
      })
    }
    if (filters.province) query.whereILike('province', filters.province)
    if (filters.city) query.whereILike('city', filters.city)

    const rows = await query
    const limit = filters.limit ?? 20
    return {
      data: rows.slice(0, limit),
      meta: { nextOffset: rows.length > limit ? (filters.offset ?? 0) + limit : null },
    }
  }

  async show({ params, response }: HttpContext) {
    const { slug } = await jurisdictionSlugValidator.validate(params)
    const jurisdiction = await db
      .from('jurisdictions')
      .select(...publicColumns)
      .select(
        db.raw('verified_at::text AS "verifiedAt"'),
        'municipality',
        'territory',
        'locality',
        'territorial_jurisdiction as territorialJurisdiction',
        'coordinate_source as coordinateSource',
        db.raw('ST_Y(location::geometry) AS latitude'),
        db.raw('ST_X(location::geometry) AS longitude')
      )
      .where({ slug, status: 'published' })
      .whereNull('archived_at')
      .first()

    if (!jurisdiction) {
      return response.notFound({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Juridiction introuvable.' },
      })
    }

    const contacts = await db
      .from('jurisdiction_contacts')
      .select('type', 'label', 'value')
      .where({ jurisdiction_id: jurisdiction.id, is_public: true })
      .orderBy('type', 'asc')

    return { data: { ...jurisdiction, contacts } }
  }
}
