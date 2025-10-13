import mqtt, { IClientSubscribeOptions } from 'mqtt'

type MqttMessageParameters = Parameters<mqtt.OnMessageCallback>

interface MqttMessageTopic {
  topic: string
  qos: IClientSubscribeOptions['qos']
}

export interface MqttMessagePayload {
  topic: MqttMessageParameters[0]
  message: MqttMessageParameters[1]
  packet: MqttMessageParameters[2]
}

export default class MqttMessageListener {
  static TOPICS: MqttMessageTopic[] = [{ topic: '+/+/raw', qos: 1 }]

  handle({ topic, message }: MqttMessagePayload) {
    console.log('MQTT message received', topic, message.toString())
  }
}
