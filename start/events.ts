import MqttMessageEvent from '#events/mqtt_message'
import emitter from '@adonisjs/core/services/emitter'

const MqttMessageListener = () => import('#listeners/mqtt_message_listener')

emitter.on(MqttMessageEvent, MqttMessageListener)
