import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { createUserAndLogin } from '../helpers/auth_helper.js'

test.group('Users', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('ADMIN can list users', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'ADMIN' })

    const response = await client.get('/api/v1/users').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })

  test('FINANCE cannot list users', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'FINANCE' })

    const response = await client.get('/api/v1/users').header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
  })

  test('MANAGER can create a user', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'MANAGER' })

    const response = await client
      .post('/api/v1/users')
      .header('Authorization', `Bearer ${token}`)
      .json({
        name: 'New Employee',
        email: 'employee@example.com',
        password: 'password123',
        role: 'USER',
      })

    response.assertStatus(201)
    response.assertBodyContains({ email: 'employee@example.com', role: 'USER' })
  })

  test('ADMIN can update a user role', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'ADMIN' })

    const createRes = await client
      .post('/api/v1/users')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Worker', email: 'worker@example.com', password: 'password123', role: 'USER' })
    const userId = (createRes.body() as any).id

    const response = await client
      .put(`/api/v1/users/${userId}`)
      .header('Authorization', `Bearer ${token}`)
      .json({ role: 'FINANCE' })

    response.assertStatus(200)
    response.assertBodyContains({ role: 'FINANCE' })
  })

  test('ADMIN can delete a user', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'ADMIN' })

    const createRes = await client
      .post('/api/v1/users')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Temp', email: 'temp@example.com', password: 'password123', role: 'USER' })
    const userId = (createRes.body() as any).id

    const response = await client
      .delete(`/api/v1/users/${userId}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })
})
