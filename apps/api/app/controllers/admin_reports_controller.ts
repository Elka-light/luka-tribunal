import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

const statusValidator = vine.compile(
  vine.object({ status: vine.enum(['new', 'reviewing', 'resolved', 'rejected']) })
)

export default class AdminReportsController {
  async index() {
    return {
      data: await db
        .from('reports')
        .select(
          'id',
          'jurisdiction_id as jurisdictionId',
          'category',
          'comment',
          'status',
          'created_at as createdAt'
        )
        .orderBy('created_at', 'desc')
        .limit(100),
    }
  }

  async update({ params, request, auth }: HttpContext) {
    const { status } = await request.validateUsing(statusValidator)
    await db.transaction(async (trx) => {
      await trx
        .from('reports')
        .where('id', params.id)
        .update({ status, handled_by: auth.user!.id, handled_at: new Date() })
      await trx.table('audit_logs').insert({
        actor_id: auth.user!.id,
        action: 'report.status_updated',
        entity_type: 'report',
        entity_id: params.id,
        metadata: JSON.stringify({ status }),
      })
    })
    return { data: { id: params.id, status } }
  }
}
