import { inject } from '@adonisjs/core'
import { args, BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import fs from 'node:fs/promises'

import { CertificateService } from '#services/certificate_service'

export default class CertificateServer extends BaseCommand {
  static commandName = 'generate:certificate:server'
  static description = 'Generate the server certificate and private key'

  static options: CommandOptions = {}

  @args.string({
    argumentName: 'common-name',
    description: 'Common name of the server',
  })
  declare commonName: string

  @args.string({
    argumentName: 'domain-name',
    description: 'Domain (DNS) name of the server',
  })
  declare domainName: string

  @inject()
  async run(certificateService: CertificateService) {
    const { certificate, privateKey } = certificateService.generateServerCertificate({
      commonName: this.commonName,
      domainName: this.domainName,
      expirationYears: 20,
    })

    const certPath = 'certs/server.pem'
    await fs.writeFile(certPath, certificate, {
      encoding: 'utf-8',
    })

    const keyPath = 'certs/server.key'
    await fs.writeFile(keyPath, privateKey, {
      encoding: 'utf-8',
    })

    this.logger.info(`Server certificate saved to: ${certPath}`)
    this.logger.info(`Server private key saved to: ${keyPath}`)
    this.logger.success('Server certificate and private key generated successfully.')
  }
}
