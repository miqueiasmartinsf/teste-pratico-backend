import env from '#start/env'
import type { GatewayService, PaymentPayload, PaymentResult } from '#services/gateway_interface'

export default class Gateway1Service implements GatewayService {
  readonly gatewayId = 1
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = env.get('GATEWAY1_URL') ?? 'http://localhost:3001'
  }

  private async authenticate(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: env.get('GATEWAY1_EMAIL') ?? '',
        token: env.get('GATEWAY1_TOKEN') ?? '',
      }),
    })

    if (!response.ok) {
      throw new Error(`Gateway1 auth failed: ${response.status}`)
    }

    const data = (await response.json()) as { token: string }
    return data.token
  }

  private async getToken(): Promise<string> {
    if (!this.token) {
      this.token = await this.authenticate()
    }
    return this.token
  }

  async charge(payload: PaymentPayload): Promise<PaymentResult> {
    const token = await this.getToken()

    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: payload.amount,
        name: payload.name,
        email: payload.email,
        cardNumber: payload.cardNumber,
        cvv: payload.cvv,
      }),
    })

    if (!response.ok) {
      // Token may have expired – retry once
      if (response.status === 401) {
        this.token = null
        const freshToken = await this.getToken()
        const retry = await fetch(`${this.baseUrl}/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${freshToken}`,
          },
          body: JSON.stringify({
            amount: payload.amount,
            name: payload.name,
            email: payload.email,
            cardNumber: payload.cardNumber,
            cvv: payload.cvv,
          }),
        })

        if (!retry.ok) {
          throw new Error(`Gateway1 charge failed after token refresh: ${retry.status}`)
        }

        const retryData = (await retry.json()) as { id: string; status: string; cardNumber: string }
        return {
          externalId: retryData.id,
          status: retryData.status,
          gatewayId: this.gatewayId,
          cardLastNumbers: retryData.cardNumber?.slice(-4) ?? '',
        }
      }

      throw new Error(`Gateway1 charge failed: ${response.status}`)
    }

    const data = (await response.json()) as { id: string; status: string; cardNumber: string }
    return {
      externalId: data.id,
      status: data.status,
      gatewayId: this.gatewayId,
      cardLastNumbers: data.cardNumber?.slice(-4) ?? '',
    }
  }

  async refund(externalId: string): Promise<void> {
    const token = await this.getToken()

    const response = await fetch(`${this.baseUrl}/transactions/${externalId}/charge_back`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Gateway1 refund failed: ${response.status}`)
    }
  }
}
