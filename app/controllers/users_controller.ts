import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({ response }: HttpContext) {
    const users = await User.query().orderBy('id', 'asc')
    return response.ok(users.map((u) => u.serialize()))
  }

  async show({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return response.ok(user.serialize())
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      hashedPassword: payload.password,
      role: payload.role,
    })
    return response.created(user.serialize())
  }

  async update({ params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const payload = await request.validateUsing(updateUserValidator)

    if (payload.name) user.name = payload.name
    if (payload.email) user.email = payload.email
    if (payload.password) user.hashedPassword = payload.password
    if (payload.role) user.role = payload.role

    await user.save()
    return response.ok(user.serialize())
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()
    return response.ok({ message: 'User deleted successfully' })
  }
}
