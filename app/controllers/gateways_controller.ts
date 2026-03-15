import Gateway from '#models/gateway'
import { updateGatewayValidator } from '#validators/gateway'
import type { HttpContext } from '@adonisjs/core/http'

export default class GatewaysController {
  async index({ response }: HttpContext) {
    const gateways = await Gateway.query().orderBy('priority', 'asc')
    return response.ok(gateways.map((g) => g.serialize()))
  }

  async update({ params, request, response }: HttpContext) {
    const gateway = await Gateway.findOrFail(params.id)
    const payload = await request.validateUsing(updateGatewayValidator)
    gateway.merge(payload)
    await gateway.save()
    return response.ok(gateway.serialize())
  }
}
