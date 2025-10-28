import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

import Measurement from '#models/measurement'
import MqttAcl from '#models/mqtt_acl'
import User from '#models/user'

export default class Device extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare macAddress: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Measurement)
  declare measurements: HasMany<typeof Measurement>

  @hasMany(() => MqttAcl)
  declare mqttAcls: HasMany<typeof MqttAcl>
}
