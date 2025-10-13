import type { ApplicationService } from '@adonisjs/core/types'
import mqtt from 'mqtt'

import MqttMessageEvent from '#events/mqtt_message_event'
import MqttMessageListener from '#listeners/mqtt_message_listener'
import env from '#start/env'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    'mqtt.client': mqtt.MqttClient
  }
}

export default class MqttProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    const { host, port } = {
      host: env.get('MQTT_HOST'),
      port: env.get('MQTT_PORT'),
    }

    const mqttUrl = `mqtt://${host}:${port}`

    this.app.container.singleton('mqtt.client', () => {
      const client = mqtt.connect(mqttUrl, {
        reconnectPeriod: 3000,
        reconnectOnConnackError: true,
        protocolVersion: 5,
        manualConnect: true,
      })

      return client
    })
  }

  /**
   * The container bindings have booted
   */
  async boot() {
    const client = await this.app.container.make('mqtt.client')
    const logger = await this.app.container.make('logger')

    client.on('connect', async () => {
      logger.info(`MQTT[connection]: connected to ${client.options.host}:${client.options.port}`)

      try {
        await Promise.all(
          MqttMessageListener.TOPICS.map(({ topic, qos }) => {
            return client.subscribeAsync(topic, { qos })
          })
        )

        logger.info('MQTT[subscriptions]: subscribed')
      } catch (error) {
        logger.error('MQTT[subscription_error]', error)
      }
    })

    client.on('reconnect', () => {
      logger.info('MQTT reconnecting...')
    })

    client.on('disconnect', () => {
      logger.warn('MQTT[connection]: disconnected')
    })

    client.on('error', (error) => {
      logger.error('MQTT[connection_error]', error)
    })

    client.on('message', (topic, message, _) => {
      const stringMessage = message.toString()
      logger.debug(`MQTT[${topic}]: ${stringMessage}`)

      MqttMessageEvent.dispatch({
        topic,
        message: stringMessage,
      })
    })
  }

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {
    if (this.app.getEnvironment() !== 'web') return
    const client = await this.app.container.make('mqtt.client')
    client.connect()
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    if (this.app.getEnvironment() !== 'web') return
    const client = await this.app.container.make('mqtt.client')
    if (!client.stream) return
    await client.endAsync()
  }
}
