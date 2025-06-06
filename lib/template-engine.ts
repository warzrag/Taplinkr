import { prisma } from './prisma'

export interface TemplateConfig {
  name: string
  description?: string
  category: 'business' | 'personal' | 'social' | 'creative'
  layout: 'list' | 'grid' | 'card' | 'minimal'
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    accent?: string
  }
  fonts: {
    heading: string
    body: string
    size: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
    }
  }
  spacing: {
    container: string
    section: string
    element: string
  }
  animations?: {
    entrance: string
    hover: string
    transition: string
  }
}

export class TemplateEngine {
  async createTemplate(authorId: string, config: TemplateConfig, isPremium = false) {
    return await prisma.template.create({
      data: {
        name: config.name,
        description: config.description,
        category: config.category,
        layout: config.layout,
        colors: JSON.stringify(config.colors),
        fonts: JSON.stringify(config.fonts),
        spacing: JSON.stringify(config.spacing),
        animations: config.animations ? JSON.stringify(config.animations) : null,
        isPremium,
        authorId
      }
    })
  }

  async getTemplates(category?: string, includeUserTemplates = true) {
    return await prisma.template.findMany({
      where: {
        AND: [
          { isPublic: true },
          category ? { category } : {},
          includeUserTemplates ? {} : { authorId: null }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        thumbnail: {
          select: {
            url: true
          }
        }
      },
      orderBy: [
        { isPremium: 'asc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })
  }

  async applyTemplate(userId: string, templateId: string) {
    const template = await prisma.template.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      throw new Error('Template not found')
    }

    // Update usage count
    await prisma.template.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } }
    })

    // Create or update user profile
    return await prisma.userProfile.upsert({
      where: { userId },
      update: { templateId },
      create: {
        userId,
        templateId
      }
    })
  }

  async customizeTemplate(userId: string, customizations: {
    customCSS?: string
    layout?: any
    seo?: {
      title?: string
      description?: string
      keywords?: string
    }
    analytics?: {
      googleAnalyticsId?: string
      facebookPixelId?: string
      hotjarId?: string
    }
  }) {
    return await prisma.userProfile.upsert({
      where: { userId },
      update: {
        customCSS: customizations.customCSS,
        layout: customizations.layout ? JSON.stringify(customizations.layout) : undefined,
        seo: customizations.seo ? JSON.stringify(customizations.seo) : undefined,
        analytics: customizations.analytics ? JSON.stringify(customizations.analytics) : undefined
      },
      create: {
        userId,
        customCSS: customizations.customCSS,
        layout: customizations.layout ? JSON.stringify(customizations.layout) : null,
        seo: customizations.seo ? JSON.stringify(customizations.seo) : null,
        analytics: customizations.analytics ? JSON.stringify(customizations.analytics) : null
      }
    })
  }

  async renderProfile(userId: string) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        template: true,
        user: {
          include: {
            links: {
              where: { isActive: true },
              include: {
                multiLinks: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!profile) {
      // Return user data with default template
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          links: {
            where: { isActive: true },
            include: {
              multiLinks: {
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      })

      return {
        user,
        template: this.getDefaultTemplate(),
        customCSS: null,
        layout: null,
        seo: null
      }
    }

    return {
      user: profile.user,
      template: profile.template || this.getDefaultTemplate(),
      customCSS: profile.customCSS,
      layout: profile.layout ? JSON.parse(profile.layout) : null,
      seo: profile.seo ? JSON.parse(profile.seo) : null,
      analytics: profile.analytics ? JSON.parse(profile.analytics) : null
    }
  }

  private getDefaultTemplate() {
    return {
      id: 'default',
      name: 'Default',
      layout: 'list',
      colors: JSON.stringify({
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        background: '#1f2937',
        text: '#ffffff',
        accent: '#10b981'
      }),
      fonts: JSON.stringify({
        heading: 'Inter',
        body: 'Inter',
        size: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem'
        }
      }),
      spacing: JSON.stringify({
        container: '1.5rem',
        section: '2rem',
        element: '1rem'
      }),
      animations: null
    }
  }

  async forkTemplate(templateId: string, userId: string, name: string) {
    const originalTemplate = await prisma.template.findUnique({
      where: { id: templateId }
    })

    if (!originalTemplate) {
      throw new Error('Template not found')
    }

    return await prisma.template.create({
      data: {
        name,
        description: `Forked from ${originalTemplate.name}`,
        category: originalTemplate.category,
        layout: originalTemplate.layout,
        colors: originalTemplate.colors,
        fonts: originalTemplate.fonts,
        spacing: originalTemplate.spacing,
        animations: originalTemplate.animations,
        cssCode: originalTemplate.cssCode,
        isPremium: false,
        isPublic: false,
        authorId: userId
      }
    })
  }

  async generateCSS(template: any, customizations?: any): Promise<string> {
    const colors = JSON.parse(template.colors)
    const fonts = JSON.parse(template.fonts)
    const spacing = JSON.parse(template.spacing)
    const animations = template.animations ? JSON.parse(template.animations) : null

    let css = `
      :root {
        --primary-color: ${colors.primary};
        --secondary-color: ${colors.secondary};
        --background-color: ${colors.background};
        --text-color: ${colors.text};
        --accent-color: ${colors.accent || colors.primary};
        
        --font-heading: ${fonts.heading}, -apple-system, BlinkMacSystemFont, sans-serif;
        --font-body: ${fonts.body}, -apple-system, BlinkMacSystemFont, sans-serif;
        
        --spacing-container: ${spacing.container};
        --spacing-section: ${spacing.section};
        --spacing-element: ${spacing.element};
      }
      
      .profile-container {
        font-family: var(--font-body);
        background-color: var(--background-color);
        color: var(--text-color);
        padding: var(--spacing-container);
      }
      
      .profile-header h1 {
        font-family: var(--font-heading);
        color: var(--text-color);
      }
      
      .link-button {
        background-color: var(--primary-color);
        color: white;
        border-radius: 0.75rem;
        padding: var(--spacing-element);
        margin-bottom: var(--spacing-element);
        transition: all 0.2s ease;
      }
      
      .link-button:hover {
        background-color: var(--secondary-color);
        transform: translateY(-2px);
      }
    `

    if (animations) {
      css += `
        .animate-entrance {
          animation: ${animations.entrance} 0.6s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `
    }

    // Add custom CSS if provided
    if (customizations?.customCSS) {
      css += `\n/* Custom CSS */\n${customizations.customCSS}`
    }

    return css
  }
}

export const templateEngine = new TemplateEngine()