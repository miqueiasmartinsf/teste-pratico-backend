import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { UserRole } from '#models/user'

/**
 * Role middleware enforces that the authenticated user has one of the
 * required roles before proceeding.
 */
export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { roles: UserRole[] }) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({ message: 'Authentication required' })
    }

    if (!options.roles.includes(user.role)) {
      return ctx.response.forbidden({
        message: `Access denied. Required roles: ${options.roles.join(', ')}`,
      })
    }

    return next()
  }
}
