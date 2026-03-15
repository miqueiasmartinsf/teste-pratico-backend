export interface PaymentPayload {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export interface PaymentResult {
  externalId: string
  status: string
  gatewayId: number
  cardLastNumbers: string
}

export interface GatewayService {
  charge(payload: PaymentPayload): Promise<PaymentResult>
  refund(externalId: string): Promise<void>
}
