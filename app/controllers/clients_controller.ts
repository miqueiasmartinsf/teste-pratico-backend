import Client from '#models/client'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClientsController {
  async index({ response }: HttpContext) {
    const clients = await Client.query().orderBy('id', 'asc')
    return response.ok(clients.map((c) => c.serialize()))
  }

  async show({ params, response }: HttpContext) {
    const client = await Client.query()
      .where('id', params.id)
      .preload('transactions', (query) => {
        query
          .preload('gateway')
          .preload('products', (pQuery) => {
            pQuery.preload('product')
          })
          .orderBy('created_at', 'desc')
      })
      .firstOrFail()

    return response.ok(client.serialize())
  }
}
