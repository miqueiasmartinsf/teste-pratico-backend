import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { createUserAndLogin } from '../helpers/auth_helper.js'

test.group('Products', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('ADMIN can list products', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'ADMIN' })

    const response = await client.get('/api/v1/products').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })

  test('USER cannot access products', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'USER' })

    const response = await client.get('/api/v1/products').header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
  })

  test('ADMIN can create a product', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'ADMIN' })

    const response = await client
      .post('/api/v1/products')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Widget', amount: 1999 })

    response.assertStatus(201)
    response.assertBodyContains({ name: 'Widget', amount: 1999 })
  })

  test('product amount must be positive', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'ADMIN' })

    const response = await client
      .post('/api/v1/products')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Bad Product', amount: -10 })

    response.assertStatus(422)
  })

  test('MANAGER can create a product', async ({ client }) => {
    const { token } = await createUserAndLogin(client, { role: 'MANAGER' })

    const response = await client
      .post('/api/v1/products')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Gadget', amount: 5000 })

    response.assertStatus(201)
  })

  test('FINANCE can update a product', async ({ client }) => {
    const adminToken = await createUserAndLogin(client, { role: 'ADMIN' })
    const financeToken = await createUserAndLogin(client, {
      role: 'FINANCE',
      email: 'finance@example.com',
    })

    const createRes = await client
      .post('/api/v1/products')
      .header('Authorization', `Bearer ${adminToken.token}`)
      .json({ name: 'Product', amount: 100 })
    const productId = (createRes.body() as any).id

    const response = await client
      .put(`/api/v1/products/${productId}`)
      .header('Authorization', `Bearer ${financeToken.token}`)
      .json({ amount: 200 })

    response.assertStatus(200)
    response.assertBodyContains({ amount: 200 })
  })

  test('ADMIN can soft-delete a product', async ({ client, assert }) => {
    const { token } = await createUserAndLogin(client, { role: 'ADMIN' })

    const createRes = await client
      .post('/api/v1/products')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'To Delete', amount: 500 })
    const productId = (createRes.body() as any).id

    const deleteRes = await client
      .delete(`/api/v1/products/${productId}`)
      .header('Authorization', `Bearer ${token}`)
    deleteRes.assertStatus(200)

    // Confirm it no longer appears in list
    const listRes = await client.get('/api/v1/products').header('Authorization', `Bearer ${token}`)
    const products: any[] = listRes.body() as any[]
    const exists = products.some((p) => p.id === productId)
    listRes.assertStatus(200)
    assert.isFalse(exists)
  })
})
