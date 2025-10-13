import { BaseEvent } from '@adonisjs/core/events'

import { MqttMessagePayload } from '#listeners/mqtt_message_listener'

export default class MqttMessageEvent extends BaseEvent {
  constructor(public payload: MqttMessagePayload) {
    super()
  }
}
