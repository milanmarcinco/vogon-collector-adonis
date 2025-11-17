import env from '#start/env'
import forge from 'node-forge'
import { generateKeyPairSync, randomBytes } from 'node:crypto'
import fs from 'node:fs'

export class CertificateService {
  private caCert: forge.pki.Certificate
  private caKey: forge.pki.rsa.PrivateKey

  constructor() {
    const caCertPemPath = env.get('PATH_CA_CERT')
    const caKeyPemPath = env.get('PATH_CA_KEY')

    if (!caCertPemPath || !caKeyPemPath) {
      throw new Error('CA certificate and/or private key not loaded')
    }

    const caCertPemExists = fs.existsSync(caCertPemPath)
    const caKeyPemExists = fs.existsSync(caKeyPemPath)

    if (!caCertPemExists || !caKeyPemExists) {
      throw new Error('CA certificate and/or private key not loaded')
    }

    const caCertPem = fs.readFileSync(caCertPemPath, 'utf-8')
    const caKeyPem = fs.readFileSync(caKeyPemPath, 'utf-8')

    this.caCert = forge.pki.certificateFromPem(caCertPem)
    this.caKey = forge.pki.privateKeyFromPem(caKeyPem)
  }

  getDatetimeYearsFromNow(years: number) {
    const now = new Date()

    const then = new Date(
      now.getFullYear() + years,
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    )

    return { now, then }
  }

  generateClientCertificate(options: { commonName: string; validFrom: Date; validTo: Date }) {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    })

    const forgePrivate = forge.pki.privateKeyFromPem(
      privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    )

    const forgePublic = forge.pki.publicKeyFromPem(
      publicKey.export({ type: 'spki', format: 'pem' }).toString()
    )

    const cert = forge.pki.createCertificate()
    cert.publicKey = forgePublic
    cert.serialNumber = CertificateService.generateSerialNumber()

    cert.validity.notBefore = options.validFrom
    cert.validity.notAfter = options.validTo

    cert.setSubject([
      { name: 'commonName', value: options.commonName },
      { name: 'organizationName', value: 'Vogon' },
      { name: 'countryName', value: 'SK' },
    ])

    cert.setIssuer(this.caCert.subject.attributes)
    cert.sign(this.caKey, forge.md.sha256.create())

    const certificatePem = forge.pki.certificateToPem(cert)
    const privateKeyPem = forge.pki.privateKeyToPem(forgePrivate)

    return {
      certificate: certificatePem,
      privateKey: privateKeyPem,
    }
  }

  generateServerCertificate(options: {
    commonName: string
    sanDns?: string
    sanIp?: string
    validFrom: Date
    validTo: Date
  }) {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    })

    const forgePrivate = forge.pki.privateKeyFromPem(
      privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    )
    const forgePublic = forge.pki.publicKeyFromPem(
      publicKey.export({ type: 'spki', format: 'pem' }).toString()
    )

    const cert = forge.pki.createCertificate()
    cert.publicKey = forgePublic
    cert.serialNumber = CertificateService.generateSerialNumber()

    cert.validity.notBefore = options.validFrom
    cert.validity.notAfter = options.validTo

    cert.setSubject([
      { name: 'commonName', value: options.commonName },
      { name: 'organizationName', value: 'Vogon' },
      { name: 'countryName', value: 'SK' },
    ])

    cert.setIssuer(this.caCert.subject.attributes)

    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: false,
      },
      {
        name: 'keyUsage',
        digitalSignature: true,
        keyEncipherment: true,
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
      },
      {
        name: 'subjectAltName',
        altNames: [
          ...(options.sanDns ? [{ type: 2, value: options.sanDns }] : []),
          ...(options.sanIp ? [{ type: 7, ip: options.sanIp }] : []),
        ],
      },
    ])

    cert.sign(this.caKey, forge.md.sha256.create())

    const certificatePem = forge.pki.certificateToPem(cert)
    const privateKeyPem = forge.pki.privateKeyToPem(forgePrivate)

    return {
      certificate: certificatePem,
      privateKey: privateKeyPem,
    }
  }

  static generateCertificateAuthority(options: { validFrom: Date; validTo: Date }) {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    })

    const forgePrivateKey = forge.pki.privateKeyFromPem(
      privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    )

    const forgePublicKey = forge.pki.publicKeyFromPem(
      publicKey.export({ type: 'spki', format: 'pem' }).toString()
    )

    const cert = forge.pki.createCertificate()
    cert.publicKey = forgePublicKey
    cert.serialNumber = CertificateService.generateSerialNumber()

    cert.validity.notBefore = options.validFrom
    cert.validity.notAfter = options.validTo

    const attrs = [
      { name: 'commonName', value: 'VogonRoot' },
      { name: 'organizationName', value: 'Vogon' },
      { name: 'countryName', value: 'SK' },
    ]

    cert.setSubject(attrs)
    cert.setIssuer(attrs)

    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: true,
        pathLenConstraint: 1,
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        cRLSign: true,
      },
      {
        name: 'subjectKeyIdentifier',
      },
    ])

    cert.sign(forgePrivateKey, forge.md.sha256.create())

    const certificatePem = forge.pki.certificateToPem(cert)
    const privateKeyPem = forge.pki.privateKeyToPem(forgePrivateKey)

    return {
      certificate: certificatePem,
      privateKey: privateKeyPem,
    }
  }

  private static generateSerialNumber() {
    // Generate 16 random bytes (128 bits)
    let serial = randomBytes(16)

    // Ensure the most significant bit is 0 (positive number)
    serial[0] = serial[0] & 0x7f

    // Convert to BigInteger for Forge compatibility
    const serialHex = serial.toString('hex')
    return new forge.jsbn.BigInteger(serialHex, 16).toString()
  }
}
