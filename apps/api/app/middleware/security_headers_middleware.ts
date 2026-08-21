import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SecurityHeadersMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    response.header('X-Content-Type-Options', 'nosniff')
    response.header('X-Frame-Options', 'DENY')
    response.header('Referrer-Policy', 'no-referrer')
    response.header('Permissions-Policy', 'geolocation=(), camera=(), microphone=()')
    const path = request.url()
    if (path.startsWith('/api/v1/admin') || path.startsWith('/api/v1/reports')) {
      response.header('Cache-Control', 'no-store')
    }
    await next()
  }
}
