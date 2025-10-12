import { BaseSeeder } from '@adonisjs/lucid/seeders'

import Parameter from '#models/parameter'
import Sensor from '#models/sensor'

export default class extends BaseSeeder {
  async run() {
    const sensors = await Sensor.createMany([
      {
        name: 'dht22',
      },
      {
        name: 'sds011',
      },
    ])

    const parameters = await Parameter.createMany([
      { name: 'temperature' },
      { name: 'humidity' },
      { name: 'pm25' },
      { name: 'pm10' },
    ])

    const [dht22, sds011] = sensors
    const [temperature, humidity, pm25, pm10] = parameters

    await dht22.related('parameters').attach([temperature.id, humidity.id])
    await sds011.related('parameters').attach([pm25.id, pm10.id])
  }
}
