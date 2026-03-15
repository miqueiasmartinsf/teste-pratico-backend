import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('client_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('clients')
        .onDelete('CASCADE')
      table
        .integer('gateway_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('gateways')
        .onDelete('RESTRICT')
      table.string('external_id').notNullable()
      table.string('status').notNullable().defaultTo('pending')
      table.integer('amount').notNullable().comment('Total amount in cents')
      table.string('card_last_numbers', 4).nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
