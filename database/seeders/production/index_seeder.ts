import { BaseSeeder } from '@adonisjs/lucid/seeders'
import app from '@adonisjs/core/services/app'

export default class ProductionSeeder extends BaseSeeder {
  private async seed(Seeder: { default: typeof BaseSeeder }) {
    if (
      !Seeder.default.environment ||
      (!Seeder.default.environment.includes('production') && app.inProduction)
    )
      return

    await new Seeder.default(this.client).run()
  }

  async run() {
    await this.seed(await import('#database/seeders/common/sensors_and_parameters'))
  }
}
