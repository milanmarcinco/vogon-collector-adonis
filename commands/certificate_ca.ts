import { CertificateService } from '#services/certificate_service'
import { BaseCommand } from '@adonisjs/core/ace'
import fs from 'node:fs/promises'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class Certificate extends BaseCommand {
  static commandName = 'generate:certificate:ca'
  static description = 'Generate the CA certificate and private key'

  static options: CommandOptions = {}

  async run() {
    const { certificate, privateKey } = CertificateService.generateCertificateAuthority({
      expirationYears: 30,
    })

    const certPath = 'certs/ca.pem'
    await fs.writeFile(certPath, certificate, {
      encoding: 'utf-8',
    })

    const keyPath = 'certs/ca.key'
    await fs.writeFile(keyPath, privateKey, {
      encoding: 'utf-8',
    })

    this.logger.info(`CA certificate saved to: ${certPath}`)
    this.logger.info(`CA private key saved to: ${keyPath}`)
    this.logger.success('CA certificate and private key generated successfully.')
  }
}
