import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Auth', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should register a new user', async ({ client }) => {
    const response = await client.post('/api/v1/auth/register').json({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    })

    response.assertStatus(201)
    response.assertBodyContains({ email: 'test@example.com', role: 'USER' })
  })

  test('should not register with duplicate email', async ({ client }) => {
    await client.post('/api/v1/auth/register').json({
      name: 'First User',
      email: 'duplicate@example.com',
      password: 'password123',
    })

    const response = await client.post('/api/v1/auth/register').json({
      name: 'Second User',
      email: 'duplicate@example.com',
      password: 'password123',
    })

    response.assertStatus(422)
  })

  test('should login with valid credentials', async ({ client }) => {
    await client.post('/api/v1/auth/register').json({
      name: 'Login User',
      email: 'login@example.com',
      password: 'password123',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'login@example.com',
      password: 'password123',
    })

    response.assertStatus(200)
    response.assertBodyContains({ user: { email: 'login@example.com' } })
  })

  test('should not login with invalid credentials', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    })

    response.assertStatus(400)
  })

  test('should not register with short password', async ({ client }) => {
    const response = await client.post('/api/v1/auth/register').json({
      name: 'User',
      email: 'user@example.com',
      password: '123',
    })

    response.assertStatus(422)
  })
})
