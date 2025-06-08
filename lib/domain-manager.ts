import { prisma } from './prisma'

export interface DomainConfig {
  domain: string
  subdomain?: string
}

export class DomainManager {
  async addDomain(userId: string, config: DomainConfig) {
    // Validate domain format
    if (!this.isValidDomain(config.domain)) {
      throw new Error('Format de domaine invalide')
    }

    // Check if domain already exists
    const existing = await prisma.customDomain.findUnique({
      where: { domain: config.domain }
    })

    if (existing) {
      throw new Error('Ce domaine est déjà utilisé')
    }

    // Generate DNS records
    const dnsRecords = this.generateDNSRecords(config.domain)

    return await prisma.customDomain.create({
      data: {
        userId,
        domain: config.domain,
        subdomain: config.subdomain,
        dnsRecords: JSON.stringify(dnsRecords),
        verified: false
      }
    })
  }

  async verifyDomain(domainId: string): Promise<boolean> {
    const domain = await prisma.customDomain.findUnique({
      where: { id: domainId }
    })

    if (!domain) {
      throw new Error('Domaine non trouvé')
    }

    // Check DNS configuration (simplified for demo)
    const isConfigured = await this.checkDNSConfiguration(domain.domain)
    
    if (isConfigured) {
      await prisma.customDomain.update({
        where: { id: domainId },
        data: { verified: true }
      })
      return true
    }

    return false
  }

  async setupSSL(domainId: string) {
    const domain = await prisma.customDomain.findUnique({
      where: { id: domainId }
    })

    if (!domain || !domain.verified) {
      throw new Error('Le domaine doit être vérifié avant la configuration SSL')
    }

    // In a real implementation, this would use Let's Encrypt or similar
    // For demo purposes, we'll just mark it as enabled
    const sslExpiry = new Date()
    sslExpiry.setDate(sslExpiry.getDate() + 90) // 90 days

    await prisma.customDomain.update({
      where: { id: domainId },
      data: {
        sslEnabled: true,
        sslExpiry
      }
    })

    return true
  }

  private async checkDNSConfiguration(domain: string): Promise<boolean> {
    // In a real implementation, this would use DNS lookup libraries
    // For demo purposes, we'll simulate verification
    console.log(`Checking DNS for ${domain}...`)
    
    // Simulate DNS check - in production, you'd use libraries like:
    // - dns.promises.resolve()
    // - dig commands
    // - Third-party DNS APIs
    
    return Math.random() > 0.3 // 70% chance of success for demo
  }

  private generateDNSRecords(domain: string) {
    const subdomain = domain.includes('.') ? domain.split('.')[0] : '@'
    
    return [
      {
        type: 'CNAME',
        name: subdomain,
        value: 'cname.linktracker.app',
        ttl: 300
      },
      {
        type: 'TXT',
        name: `_linktracker.${domain}`,
        value: `linktracker-verification=${this.generateVerificationToken()}`,
        ttl: 300
      }
    ]
  }

  private generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})$/
    return domainRegex.test(domain)
  }

  async getUserDomains(userId: string) {
    return await prisma.customDomain.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  }

  async deleteDomain(domainId: string, userId: string) {
    const domain = await prisma.customDomain.findUnique({
      where: { id: domainId }
    })

    if (!domain || domain.userId !== userId) {
      throw new Error('Domaine non trouvé ou non autorisé')
    }

    await prisma.customDomain.delete({
      where: { id: domainId }
    })

    return true
  }

  async getDomainByName(domain: string) {
    return await prisma.customDomain.findUnique({
      where: { domain },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })
  }
}

export const domainManager = new DomainManager()