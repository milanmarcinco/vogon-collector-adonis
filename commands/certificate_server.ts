import { inject } from '@adonisjs/core'
import { args, BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import fs from 'node:fs/promises'

import { CertificateService } from '#services/certificate_service'
import env from '#start/env'

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
    required: false,
  })
  declare domainName: string

  @args.string({
    argumentName: 'ip-address',
    description: 'IP address of the server',
    required: false,
  })
  declare ipAddress: string

  validityYears = 20

  @inject()
  async run(certificateService: CertificateService) {
    const certDir = env.get('PATH_CERT_DIR')

    const { certificate, privateKey } = certificateService.generateServerCertificate({
      commonName: this.commonName,
      sanDns: this.domainName,
      sanIp: this.ipAddress,
      validFrom: new Date(),
      validTo: new Date(Date.now() + this.validityYears * 365 * 24 * 3600 * 1000),
    })

    const certPath = `${certDir}/server.pem`
    await fs.writeFile(certPath, certificate, {
      encoding: 'utf-8',
    })

    const keyPath = `${certDir}/server.key`
    await fs.writeFile(keyPath, privateKey, {
      encoding: 'utf-8',
    })

    this.logger.info(`Server certificate saved to: ${certPath}`)
    this.logger.info(`Server private key saved to: ${keyPath}`)
    this.logger.success('Server certificate and private key generated successfully.')
  }
}
