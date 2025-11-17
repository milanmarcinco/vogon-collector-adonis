import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async signUp({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.create({ email, password })
    const token = await User.accessTokens.create(user)

    return response.created({
      token: token.value!.release(),
      type: token.type,
      expiresAt: token.expiresAt,
    })
  }

  async signIn({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return response.created({
      token: token.value!.release(),
      type: token.type,
      expiresAt: token.expiresAt,
    })
  }

  async signOut({ auth, response }: HttpContext) {
    await auth.use('api').invalidateToken()
    return response.ok({ success: true })
  }

  async delete({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    auth.use('api').invalidateToken()
    await user.delete()

    return response.ok({ success: true })
  }
}
