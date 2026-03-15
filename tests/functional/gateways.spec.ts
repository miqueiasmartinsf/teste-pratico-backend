import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { createUserAndLogin } from '../helpers/auth_helper.js'

test.group('Gateways', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('ADMIN can list gateways', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'ADMIN' })

    const response = await client.get('/api/v1/gateways').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains([{ name: 'Gateway1' }, { name: 'Gateway2' }])
  })

  test('MANAGER cannot list gateways', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'MANAGER' })

    const response = await client.get('/api/v1/gateways').header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
  })

  test('ADMIN can toggle gateway active status', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'ADMIN' })

    const listRes = await client.get('/api/v1/gateways').header('Authorization', `Bearer ${token}`)
    const gatewayId = listRes.body()[0].id

    const response = await client
      .patch(`/api/v1/gateways/${gatewayId}`)
      .header('Authorization', `Bearer ${token}`)
      .json({ isActive: false })

    response.assertStatus(200)
    response.assertBodyContains({ isActive: false })
  })

  test('ADMIN can change gateway priority', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'ADMIN' })

    const listRes = await client.get('/api/v1/gateways').header('Authorization', `Bearer ${token}`)
    const gatewayId = listRes.body()[0].id

    const response = await client
      .patch(`/api/v1/gateways/${gatewayId}`)
      .header('Authorization', `Bearer ${token}`)
      .json({ priority: 5 })

    response.assertStatus(200)
    response.assertBodyContains({ priority: 5 })
  })

  test('unauthenticated request is rejected', async ({ client }) => {
    const response = await client.get('/api/v1/gateways')
    response.assertStatus(401)
  })
})
