import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

import { CertificateService } from '#services/certificate_service'
import { DeviceService } from '#services/device_service'

import MqttAcl from '#models/mqtt_acl'

import { storeDeviceValidator } from '#validators/device'

import env from '#start/env'

@inject()
export default class DevicesController {
  validityYears: number

  constructor(
    private deviceService: DeviceService,
    private certificateService: CertificateService
  ) {
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

  async getConfigForDevice({ auth, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const device = await user.related('devices').query().where('id', params.deviceId).firstOrFail()
    return this.deviceService.getDeviceConfig(device)
  }

  async getCertificateForDevice({ auth, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const device = await user.related('devices').query().where('id', params.deviceId).firstOrFail()

    const { now, then } = this.certificateService.getDatetimeYearsFromNow(this.validityYears)

    return this.certificateService.generateClientCertificate({
      commonName: device.macAddress,
      validFrom: now,
      validTo: then,
    })
  }
}
