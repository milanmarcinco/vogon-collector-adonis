import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'measurements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('device_address', 255).notNullable()

      table
        .uuid('parameter_id')
        .notNullable()
        .references('id')
        .inTable('parameters')
        .onDelete('CASCADE')

      table.double('value').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.primary(['created_at', 'device_address'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
