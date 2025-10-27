import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

import Parameter from '#models/parameter'
import Device from '#models/device'

export default class Measurement extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare deviceId: string

  @belongsTo(() => Device)
  declare device: BelongsTo<typeof Device>

  @column()
  declare parameterId: string

  @belongsTo(() => Parameter)
  declare parameter: BelongsTo<typeof Parameter>

  @column()
  declare value: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
