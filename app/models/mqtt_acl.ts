import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

import Device from '#models/device'

export default class MqttAcl extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare deviceId: string

  @column()
  declare topic: string

  @column()
  declare action: 'subscribe' | 'publish' | 'all'

  @column()
  declare permission: 'allow' | 'deny'

  @column()
  declare qos: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Device)
  declare device: BelongsTo<typeof Device>
}
