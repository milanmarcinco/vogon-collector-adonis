import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'mqtt_acls'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('device_id').references('id').inTable('devices').notNullable().onDelete('CASCADE')

      table.string('topic').notNullable()
      table.enum('action', ['subscribe', 'publish', 'all']).notNullable()
      table.enum('permission', ['allow', 'deny']).notNullable()
      table.smallint('qos').defaultTo(null)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
