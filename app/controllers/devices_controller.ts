import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

import MqttAcl from '#models/mqtt_acl'
import { CertificateService } from '#services/certificate_service'
import env from '#start/env'
import { storeDeviceValidator } from '#validators/device'

@inject()
export default class DevicesController {
  validityYears: number

  constructor(private certificateService: CertificateService) {
    this.validityYears = env.get('CERT_CLIENT_EXPIRY_YEARS')
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const { macAddress } = await request.validateUsing(storeDeviceValidator)
    const trx = await db.transaction()

    try {
      const device = await user
        .related('devices')
        .updateOrCreate({ macAddress }, { macAddress }, { client: trx })

      await MqttAcl.create(
        {
          deviceId: device.id,
          topic: `vogonair/${device.macAddress}/raw`,
          action: 'publish',
          permission: 'allow',
          qos: 1,
        },
        { client: trx }
      )

      await trx.commit()

      return response.created(device)
    } catch {
      await trx.rollback()
    }

    return response.internalServerError()
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const device = await user.related('devices').query().where('id', params.deviceId).firstOrFail()
    await device.delete()

    return response.ok(device)
  }

  async getConfigForDevice({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const device = await user.related('devices').query().where('id', params.deviceId).firstOrFail()

    device

    return response.ok({})
  }

  async getCertificateForDevice({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const device = await user.related('devices').query().where('id', params.deviceId).firstOrFail()

    const validFrom = new Date()
    const validTo = new Date(Date.now() + this.validityYears * 365 * 24 * 3600 * 1000)

    const { certificate, privateKey } = this.certificateService.generateClientCertificate({
      commonName: device.macAddress,
      validFrom,
      validTo,
    })

    return response.ok({
      certificate,
      privateKey,
      validFrom,
      validTo,
    })
  }
}
