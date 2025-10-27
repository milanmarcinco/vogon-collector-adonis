import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'measurements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('device_id').references('id').inTable('devices').notNullable().onDelete('CASCADE')

      table
        .uuid('parameter_id')
        .notNullable()
        .references('id')
        .inTable('parameters')
        .onDelete('CASCADE')

      table.double('value').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.primary(['created_at', 'device_id', 'id'], {
        constraintName: 'measurements_pkey',
      })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
