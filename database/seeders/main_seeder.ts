import { BaseSeeder } from '@adonisjs/lucid/seeders'

import Parameter from '#models/parameter'
import Sensor from '#models/sensor'

export default class extends BaseSeeder {
  async run() {
    const sensors = await Sensor.createMany([
      {
        name: 'dht22',
        code: 0x01,
      },
      {
        name: 'sds011',
        code: 0x02,
      },
    ])

    const parameters = await Parameter.createMany([
      { name: 'temperature', code: 0x01 },
      { name: 'humidity', code: 0x02 },
      { name: 'pm2.5', code: 0x03 },
      { name: 'pm10', code: 0x04 },
    ])

    const [dht22, sds011] = sensors
    const [temperature, humidity, pm25, pm10] = parameters

    await dht22.related('parameters').attach([temperature.id, humidity.id])
    await sds011.related('parameters').attach([pm25.id, pm10.id])
  }
}
