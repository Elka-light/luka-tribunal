import { createReportValidator } from '#validators/report'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

export default class ReportsController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createReportValidator)
    const jurisdiction = await db
      .from('jurisdictions')
      .select('id')
      .where({ id: payload.jurisdictionId, status: 'published' })
      .whereNull('archived_at')
      .first()

    if (!jurisdiction) {
      return response.notFound({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Juridiction introuvable.' },
      })
    }

    const [report] = await db
      .table('reports')
      .insert({
        jurisdiction_id: payload.jurisdictionId,
        category: payload.category,
        comment: payload.comment || null,
      })
      .returning(['id', 'created_at as createdAt'])

    return response.created({
      data: report,
      message: 'Signalement reçu. Il sera vérifié manuellement.',
    })
  }
}
