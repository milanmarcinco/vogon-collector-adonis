import MqttMessageEvent from '#events/mqtt_message'
import emitter from '@adonisjs/core/services/emitter'

const MqttMessageListener = () => import('#listeners/mqtt_message')

emitter.on(MqttMessageEvent, MqttMessageListener)
