import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'gateways'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.integer('priority').notNullable().defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // Seed default gateways
    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          name: 'Gateway1',
          is_active: true,
          priority: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Gateway2',
          is_active: true,
          priority: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
