import { inject } from '@adonisjs/core'
import { args, BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import fs from 'node:fs/promises'

import { CertificateService } from '#services/certificate_service'
import env from '#start/env'

export default class CertificateClient extends BaseCommand {
  static commandName = 'generate:certificate:client'
  static description = 'Generate the client certificate and private key'

  static options: CommandOptions = {}

  @args.string({
    argumentName: 'mac-address',
    description: 'MAC address of the client device',
  })
  declare macAddress: string

  validityYears = 10

  @inject()
  async run(certificateService: CertificateService) {
    const certDir = env.get('PATH_CERT_DIR')

    const { certificate, privateKey } = certificateService.generateClientCertificate({
      commonName: this.macAddress,
      validFrom: new Date(),
      validTo: new Date(Date.now() + this.validityYears * 365 * 24 * 3600 * 1000),
    })

    const certPath = `${certDir}/client.pem`
    await fs.writeFile(certPath, certificate, {
      encoding: 'utf-8',
    })

    const keyPath = `${certDir}/client.key`
    await fs.writeFile(keyPath, privateKey, {
      encoding: 'utf-8',
    })

    this.logger.info(`Client certificate saved to: ${certPath}`)
    this.logger.info(`Client private key saved to: ${keyPath}`)
    this.logger.success('Client certificate and private key generated successfully.')
  }
}
