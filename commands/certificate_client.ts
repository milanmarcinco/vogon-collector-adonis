import { args, BaseCommand } from '@adonisjs/core/ace'
import { inject } from '@adonisjs/core'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import fs from 'node:fs/promises'

import { CertificateService } from '#services/certificate_service'

export default class CertificateClient extends BaseCommand {
  static commandName = 'generate:certificate:client'
  static description = 'Generate the client certificate and private key'

  static options: CommandOptions = {}

  @args.string({
    argumentName: 'mac-address',
    description: 'MAC address of the client device',
  })
  declare macAddress: string

  @inject()
  async run(certificateService: CertificateService) {
    const { certificate, privateKey } = certificateService.generateClientCertificate({
      commonName: this.macAddress,
      expirationYears: 10,
    })

    const certPath = 'certs/client.pem'
    await fs.writeFile(certPath, certificate, {
      encoding: 'utf-8',
    })

    const keyPath = 'certs/client.key'
    await fs.writeFile(keyPath, privateKey, {
      encoding: 'utf-8',
    })

    this.logger.info(`Client certificate saved to: ${certPath}`)
    this.logger.info(`Client private key saved to: ${keyPath}`)
    this.logger.success('Client certificate and private key generated successfully.')
  }
}
