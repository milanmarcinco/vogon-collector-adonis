import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'parameter_sensor'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('parameter_id').notNullable().references('parameters.id').onDelete('CASCADE')
      table.uuid('sensor_id').notNullable().references('sensors.id').onDelete('CASCADE')

      table.primary(['sensor_id', 'parameter_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
