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
      .limit(filters.limit ?? 20)

    if (filters.q) {
      query.where((builder) => {
        builder
          .whereILike('official_name', `%${filters.q}%`)
          .orWhereILike('common_name', `%${filters.q}%`)
      })
    }
    if (filters.province) query.whereILike('province', filters.province)
    if (filters.city) query.whereILike('city', filters.city)

    return { data: await query }
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
