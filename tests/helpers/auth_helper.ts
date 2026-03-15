import User from '#models/user'
import { UserRole } from '#models/user'

/**
 * Creates a user and returns a JWT token via login
 */
export async function createUserAndLogin(
  client: any,
  overrides: {
    name?: string
    email?: string
    password?: string
    role?: UserRole
  } = {}
): Promise<{ token: string; user: any }> {
  const name = overrides.name ?? 'Test User'
  const email = overrides.email ?? `user_${Date.now()}@example.com`
  const password = overrides.password ?? 'password123'
  const role = overrides.role ?? UserRole.USER

  await User.create({
    name,
    email,
    hashedPassword: password,
    role,
  })

  const loginResponse = await client.post('/api/v1/auth/login').json({ email, password })
  const body = loginResponse.body()

  return { token: body.token, user: body.user }
}
