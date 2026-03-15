import Product from '#models/product'
import { createProductValidator, updateProductValidator } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ProductsController {
  async index({ response }: HttpContext) {
    const products = await Product.query().whereNull('deleted_at').orderBy('id', 'asc')
    return response.ok(products.map((p) => p.serialize()))
  }

  async show({ params, response }: HttpContext) {
    const product = await Product.query()
      .whereNull('deleted_at')
      .where('id', params.id)
      .firstOrFail()
    return response.ok(product.serialize())
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)
    const product = await Product.create(payload)
    return response.created(product.serialize())
  }

  async update({ params, request, response }: HttpContext) {
    const product = await Product.query()
      .whereNull('deleted_at')
      .where('id', params.id)
      .firstOrFail()
    const payload = await request.validateUsing(updateProductValidator)
    product.merge(payload)
    await product.save()
    return response.ok(product.serialize())
  }

  async destroy({ params, response }: HttpContext) {
    const product = await Product.query()
      .whereNull('deleted_at')
      .where('id', params.id)
      .firstOrFail()
    product.deletedAt = DateTime.now()
    await product.save()
    return response.ok({ message: 'Product deleted successfully' })
  }
}
