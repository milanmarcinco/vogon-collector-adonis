import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  }

  async down() {
    this.schema.raw('DROP EXTENSION IF EXISTS "uuid-ossp"')
  }
}
