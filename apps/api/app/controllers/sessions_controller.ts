import User from '#models/user'
import { loginValidator } from '#validators/session'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionsController {
  async store({ request, auth, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    try {
      const user = await User.verifyCredentials(email.toLowerCase(), password)
      if (!user.isActive) throw new Error('Inactive account')
      await auth.use('web').login(user)
      return { data: { id: user.id, displayName: user.displayName, role: user.role } }
    } catch {
      return response.unauthorized({
        error: { code: 'INVALID_CREDENTIALS', message: 'Identifiants invalides.' },
      })
    }
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.noContent()
  }

  async show({ auth }: HttpContext) {
    const user = auth.user!
    return { data: { id: user.id, displayName: user.displayName, role: user.role } }
  }
}
