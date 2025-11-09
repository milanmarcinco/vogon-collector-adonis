import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'
import { IClientSubscribeOptions } from 'mqtt'

import Parameter from '#models/parameter'

import { mqttMeasurementMessageValidator } from '#validators/measurement'
import MqttMessageEvent from '#events/mqtt_message_event'
import Device from '#models/device'

export interface MqttMessageTopic {
  topic: string
  qos: IClientSubscribeOptions['qos']
}

export interface MqttMessagePayload {
  topic: string
  message: string
}

@inject()
export default class MqttMessageListener {
  constructor(protected logger: Logger) {}

  static TOPICS: MqttMessageTopic[] = [{ topic: 'vogonair/+/raw', qos: 1 }]

  async handle(event: MqttMessageEvent) {
    await this.handleMeasurement(event.payload)
  }

  private async handleMeasurement({ topic, message }: MqttMessagePayload) {
    const [_, macAddress, __] = topic.split('/')

    const payload = JSON.parse(message)
    const data = await mqttMeasurementMessageValidator.validate(payload)

    try {
      const parameter = await Parameter.findByOrFail('code', data.parameter)
      const device = await Device.findByOrFail('mac_address', macAddress)

      await parameter.related('measurements').create({
        deviceId: device.id,
        value: data.value,
      })
    } catch {
      this.logger.error('Parameter or device not found for incoming measurement')
    }
  }
}
