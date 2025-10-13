import { BaseEvent } from '@adonisjs/core/events'

import { MqttMessagePayload } from '#listeners/mqtt_message'

export default class MqttMessageEvent extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public payload: MqttMessagePayload) {
    super()
  }
}
