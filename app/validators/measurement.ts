import vine from '@vinejs/vine'

export const mqttMeasurementMessageValidator = vine.compile(
  vine.object({
    sensor: vine.number().positive(),
    parameter: vine.number().positive(),
    value: vine.number(),
  })
)
