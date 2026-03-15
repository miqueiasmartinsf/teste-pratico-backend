import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transaction_products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('transaction_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('transactions')
        .onDelete('CASCADE')
      table
        .integer('product_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('products')
        .onDelete('RESTRICT')
      table.integer('quantity').notNullable().defaultTo(1)
      table.integer('unit_amount').notNullable().comment('Unit price in cents at time of purchase')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
