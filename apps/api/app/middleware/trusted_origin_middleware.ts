import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS'])

export default class TrustedOriginMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    if (safeMethods.has(request.method())) return next()

    const allowedOrigins = (env.get('CORS_ORIGIN') ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
    const origin = request.header('origin')
    const requestedWith = request.header('x-requested-with')

    if (!origin || !allowedOrigins.includes(origin) || requestedWith !== 'XMLHttpRequest') {
      return response.forbidden({
        error: { code: 'UNTRUSTED_ORIGIN', message: 'Origine de la requête refusée.' },
      })
    }

    return next()
  }
}
