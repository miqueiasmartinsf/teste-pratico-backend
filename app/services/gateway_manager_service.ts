import Gateway from '#models/gateway'
import Gateway1Service from '#services/gateway1_service'
import Gateway2Service from '#services/gateway2_service'
import type { GatewayService, PaymentPayload, PaymentResult } from '#services/gateway_interface'

export default class GatewayManagerService {
  private resolveGatewayService(gatewayName: string): GatewayService {
    switch (gatewayName) {
      case 'Gateway1':
        return new Gateway1Service()
      case 'Gateway2':
        return new Gateway2Service()
      default:
        throw new Error(`Unknown gateway: ${gatewayName}`)
    }
  }

  async charge(payload: PaymentPayload): Promise<PaymentResult> {
    const activeGateways = await Gateway.query().where('is_active', true).orderBy('priority', 'asc')

    if (activeGateways.length === 0) {
      throw new Error('No active gateways available')
    }

    const errors: string[] = []

    for (const gateway of activeGateways) {
      try {
        const service = this.resolveGatewayService(gateway.name)
        const result = await service.charge(payload)
        result.gatewayId = gateway.id
        return result
      } catch (error) {
        errors.push(`${gateway.name}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    throw new Error(`All gateways failed: ${errors.join('; ')}`)
  }

  async refund(gatewayName: string, externalId: string): Promise<void> {
    const service = this.resolveGatewayService(gatewayName)
    await service.refund(externalId)
  }
}
