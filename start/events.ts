import emitter from '@adonisjs/core/services/emitter'

import MqttMessageEvent from '#events/mqtt_message_event'

const MqttMessageListener = () => import('#listeners/mqtt_message_listener')

emitter.on(MqttMessageEvent, [MqttMessageListener])
