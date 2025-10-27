import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'measurements'

  async up() {
    this.schema.raw(`
      SELECT create_hypertable('measurements', 'created_at');
    `)
  }
}
