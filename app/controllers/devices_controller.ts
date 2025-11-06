import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import { CertificateService } from '#services/certificate_service'
import env from '#start/env'
import { storeDeviceValidator } from '#validators/device'
import db from '@adonisjs/lucid/services/db'
import MqttAcl from '#models/mqtt_acl'

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

      const { certificate, privateKey } = this.certificateService.generateClientCertificate({
        commonName: device.macAddress,
        validityYears: this.validityYears,
      })

      const config = {
        certificate,
        privateKey,
      }

      return response.created({
        device,
        config,
      })
    } catch {
      await trx.rollback()
    }

    return response.internalServerError()
  }

  // async getConfigForDevice({ auth, request, response }: HttpContext) {
  //   const user = auth.getUserOrFail()
  //   const { deviceId } = await request.validateUsing(getConfigForDeviceValidator)
  //   const device = await user.related('devices').query().where('id', deviceId).firstOrFail()

  //   const { certificate, privateKey } = this.certificateService.generateClientCertificate({
  //     commonName: device.macAddress,
  //     validityYears: this.validityYears,
  //   })

  //   const config = {
  //     certificate,
  //     privateKey,
  //   }

  //   return response.ok({ config })
  // }
}
