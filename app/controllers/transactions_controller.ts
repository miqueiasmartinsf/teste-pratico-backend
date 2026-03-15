import Client from '#models/client'
import Product from '#models/product'
import Transaction, { type TransactionStatus } from '#models/transaction'
import TransactionProduct from '#models/transaction_product'
import GatewayManagerService from '#services/gateway_manager_service'
import { purchaseValidator } from '#validators/transaction'
import type { HttpContext } from '@adonisjs/core/http'

export default class TransactionsController {
  async index({ response }: HttpContext) {
    const transactions = await Transaction.query()
      .preload('client')
      .preload('gateway')
      .preload('products', (query) => query.preload('product'))
      .orderBy('created_at', 'desc')

    return response.ok(transactions.map((t) => t.serialize()))
  }

  async show({ params, response }: HttpContext) {
    const transaction = await Transaction.query()
      .where('id', params.id)
      .preload('client')
      .preload('gateway')
      .preload('products', (query) => query.preload('product'))
      .firstOrFail()

    return response.ok(transaction.serialize())
  }

  async purchase({ request, response }: HttpContext) {
    const payload = await request.validateUsing(purchaseValidator)

    // Find or create client
    let client = await Client.findBy('email', payload.client.email)
    if (!client) {
      client = await Client.create({
        name: payload.client.name,
        email: payload.client.email,
      })
    }

    // Load and validate products
    const productIds = payload.products.map((p) => p.id)
    const products = await Product.query().whereNull('deleted_at').whereIn('id', productIds)

    if (products.length !== productIds.length) {
      return response.unprocessableEntity({
        message: 'One or more products not found or unavailable',
      })
    }

    // Calculate total
    const totalAmount = payload.products.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id)!
      return sum + product.amount * item.quantity
    }, 0)

    // Charge via gateway manager
    const gatewayManager = new GatewayManagerService()
    const chargeResult = await gatewayManager.charge({
      amount: totalAmount,
      name: payload.client.name,
      email: payload.client.email,
      cardNumber: payload.card.number,
      cvv: payload.card.cvv,
    })

    // Persist transaction
    const transaction = await Transaction.create({
      clientId: client.id,
      gatewayId: chargeResult.gatewayId,
      externalId: chargeResult.externalId,
      status: (chargeResult.status === 'authorized' || chargeResult.status === 'paid'
        ? 'paid'
        : chargeResult.status) as TransactionStatus,
      amount: totalAmount,
      cardLastNumbers: chargeResult.cardLastNumbers,
    })

    // Persist transaction products
    for (const item of payload.products) {
      const product = products.find((p) => p.id === item.id)!
      await TransactionProduct.create({
        transactionId: transaction.id,
        productId: product.id,
        quantity: item.quantity,
        unitAmount: product.amount,
      })
    }

    // Load full transaction with relations
    await transaction.load('client')
    await transaction.load('gateway')
    await transaction.load('products', (query) => query.preload('product'))

    return response.created(transaction.serialize())
  }

  async refund({ params, response }: HttpContext) {
    const transaction = await Transaction.query()
      .where('id', params.id)
      .preload('gateway')
      .firstOrFail()

    if (transaction.status === 'refunded') {
      return response.unprocessableEntity({ message: 'Transaction is already refunded' })
    }

    if (transaction.status !== 'paid') {
      return response.unprocessableEntity({ message: 'Only paid transactions can be refunded' })
    }

    const gatewayManager = new GatewayManagerService()
    await gatewayManager.refund(transaction.gateway.name, transaction.externalId)

    transaction.status = 'refunded'
    await transaction.save()

    return response.ok(transaction.serialize())
  }
}
