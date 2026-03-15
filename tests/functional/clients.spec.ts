import Client from '#models/client'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { createUserAndLogin } from '../helpers/auth_helper.js'

test.group('Clients', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('authenticated user can list clients', async ({ client }) => {
    await Client.createMany([
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ])

    const { token } = await createUserAndLogin(client, { role: 'USER' })

    const response = await client
      .get('/api/v1/clients')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains([{ email: 'alice@example.com' }])
  })

  test('authenticated user can view client detail', async ({ client }) => {
    const dbClient = await Client.create({ name: 'Charlie', email: 'charlie@example.com' })

    const { token } = await createUserAndLogin(client, { role: 'USER' })

    const response = await client
      .get(`/api/v1/clients/${dbClient.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({ email: 'charlie@example.com', transactions: [] })
  })

  test('unauthenticated request returns 401', async ({ client }) => {
    const response = await client.get('/api/v1/clients')
    response.assertStatus(401)
  })
})
