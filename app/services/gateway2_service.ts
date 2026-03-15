import env from '#start/env'
import type { GatewayService, PaymentPayload, PaymentResult } from '#services/gateway_interface'

export default class Gateway2Service implements GatewayService {
  readonly gatewayId = 2
  private baseUrl: string

  constructor() {
    this.baseUrl = env.get('GATEWAY2_URL') ?? 'http://localhost:3002'
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Gateway-Auth-Token': env.get('GATEWAY2_AUTH_TOKEN') ?? '',
      'Gateway-Auth-Secret': env.get('GATEWAY2_AUTH_SECRET') ?? '',
    }
  }

  async charge(payload: PaymentPayload): Promise<PaymentResult> {
    const response = await fetch(`${this.baseUrl}/transacoes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        valor: payload.amount,
        nome: payload.name,
        email: payload.email,
        numeroCartao: payload.cardNumber,
        cvv: payload.cvv,
      }),
    })

    if (!response.ok) {
      throw new Error(`Gateway2 charge failed: ${response.status}`)
    }

    const data = (await response.json()) as { id: string; status: string; numeroCartao: string }
    return {
      externalId: data.id,
      status: data.status,
      gatewayId: this.gatewayId,
      cardLastNumbers: data.numeroCartao?.slice(-4) ?? '',
    }
  }

  async refund(externalId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/transacoes/reembolso`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ id: externalId }),
    })

    if (!response.ok) {
      throw new Error(`Gateway2 refund failed: ${response.status}`)
    }
  }
}
