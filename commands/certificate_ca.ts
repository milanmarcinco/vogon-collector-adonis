import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import fs from 'node:fs/promises'

import { CertificateService } from '#services/certificate_service'
import env from '#start/env'

export default class Certificate extends BaseCommand {
  static commandName = 'generate:certificate:ca'
  static description = 'Generate the CA certificate and private key'

  static options: CommandOptions = {}

  validityYears = 30

  async run() {
    const certDir = env.get('PATH_CERT_DIR')

    const { certificate, privateKey } = CertificateService.generateCertificateAuthority({
      validFrom: new Date(),
      validTo: new Date(Date.now() + this.validityYears * 365 * 24 * 3600 * 1000),
    })

    const certPath = `${certDir}/ca.pem`
    await fs.writeFile(certPath, certificate, {
      encoding: 'utf-8',
    })

    const keyPath = `${certDir}/ca.key`
    await fs.writeFile(keyPath, privateKey, {
      encoding: 'utf-8',
    })

    this.logger.info(`CA certificate saved to: ${certPath}`)
    this.logger.info(`CA private key saved to: ${keyPath}`)
    this.logger.success('CA certificate and private key generated successfully.')
  }
}
