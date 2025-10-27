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

  static TOPICS: MqttMessageTopic[] = [{ topic: '+/+/raw', qos: 1 }]

  async handle(event: MqttMessageEvent) {
    await this.handleMeasurement(event.payload.message)
  }

  private async handleMeasurement(message: MqttMessagePayload['message']) {
    const payload = JSON.parse(message)
    const data = await mqttMeasurementMessageValidator.validate(payload)

    const parameter = await Parameter.findByOrFail('code', data.parameter)
    const device = await Device.findByOrFail('mac_address', data.address)

    await parameter.related('measurements').create({
      deviceId: device.id,
      value: data.value,
    })
  }
}
