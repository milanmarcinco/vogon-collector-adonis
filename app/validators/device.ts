import vine from '@vinejs/vine'

export const storeDeviceValidator = vine.compile(
  vine.object({
    macAddress: vine.string(),
  })
)
