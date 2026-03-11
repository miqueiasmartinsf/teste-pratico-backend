import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const user = await User.create(payload)
    return response.created(user.serialize())
  }

  async login({ request, response, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)
    const { token, refreshToken } = await auth.use('jwt').generate(user)

    return response.ok({
      token,
      refreshToken,
      user: user.serialize(),
    })
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('jwt').revoke()
    return response.ok({ message: 'Logged out successfully' })
  }
}
