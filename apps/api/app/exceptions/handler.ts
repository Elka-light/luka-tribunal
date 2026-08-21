import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 500

    if (!Number.isFinite(status) || status >= 500) {
      return ctx.response.internalServerError({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Une erreur interne est survenue.',
          requestId: ctx.request.id(),
        },
      })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
