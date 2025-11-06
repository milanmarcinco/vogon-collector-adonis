import vine from '@vinejs/vine'

export const storeDeviceValidator = vine.compile(
  vine.object({
    macAddress: vine.string(),
  })
)

// export const getConfigForDeviceValidator = vine.compile(
//   vine.object({
//     deviceId: vine.string().uuid(),
//   })
// )
