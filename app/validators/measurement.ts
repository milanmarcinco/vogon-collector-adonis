import vine from '@vinejs/vine'

export const mqttMeasurementMessageValidator = vine.compile(
  vine.object({
    sensor: vine.number().positive(),
    parameter: vine.number().positive(),
    address: vine.string().minLength(1).maxLength(255),
    value: vine.number(),
  })
)
