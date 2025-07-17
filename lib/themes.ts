export interface Theme {
  id: string
  name: string
  description: string
  preview: string
  category: 'minimal' | 'gradient' | 'modern' | 'fun' | 'professional'
  styles: {
    backgroundType: 'gradient' | 'solid' | 'image'
    backgroundImage?: string
    backgroundColor?: string
    backgroundGradient?: string
    primaryColor: string
    secondaryColor: string
    textColor: string
    linkBackgroundColor: string
    linkTextColor: string
    linkBorderRadius: string
    fontFamily?: string
    headerStyle?: 'minimal' | 'glass' | 'rounded' | 'square'
  }
}

export const themes: Theme[] = [
  // Minimal Themes
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Clean and simple design with soft colors',
    preview: '🌤️',
    category: 'minimal',
    styles: {
      backgroundType: 'solid',
      backgroundColor: '#f8fafc',
      primaryColor: '#1e293b',
      secondaryColor: '#64748b',
      textColor: '#1e293b',
      linkBackgroundColor: 'rgba(255, 255, 255, 0.95)',
      linkTextColor: '#1e293b',
      linkBorderRadius: 'rounded-xl',
      headerStyle: 'minimal'
    }
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Elegant dark theme with subtle contrasts',
    preview: '🌙',
    category: 'minimal',
    styles: {
      backgroundType: 'solid',
      backgroundColor: '#0f172a',
      primaryColor: '#f1f5f9',
      secondaryColor: '#94a3b8',
      textColor: '#f1f5f9',
      linkBackgroundColor: 'rgba(30, 41, 59, 0.95)',
      linkTextColor: '#f1f5f9',
      linkBorderRadius: 'rounded-xl',
      headerStyle: 'minimal'
    }
  },

  // Gradient Themes
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    description: 'Warm gradient inspired by golden hour',
    preview: '🌅',
    category: 'gradient',
    styles: {
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
      primaryColor: '#ffffff',
      secondaryColor: '#fff5f5',
      textColor: '#ffffff',
      linkBackgroundColor: 'rgba(255, 255, 255, 0.9)',
      linkTextColor: '#d63031',
      linkBorderRadius: 'rounded-2xl',
      headerStyle: 'glass'
    }
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Cool blue gradients like the sea',
    preview: '🌊',
    category: 'gradient',
    styles: {
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B8DD6 100%)',
      primaryColor: '#ffffff',
      secondaryColor: '#e0e7ff',
      textColor: '#ffffff',
      linkBackgroundColor: 'rgba(255, 255, 255, 0.95)',
      linkTextColor: '#4c1d95',
      linkBorderRadius: 'rounded-3xl',
      headerStyle: 'glass'
    }
  },
  {
    id: 'aurora-nights',
    name: 'Aurora Nights',
    description: 'Northern lights inspired gradient',
    preview: '🌌',
    category: 'gradient',
    styles: {
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 25%, #7e22ce 50%, #ec4899 75%, #06b6d4 100%)',
      primaryColor: '#ffffff',
      secondaryColor: '#f3e8ff',
      textColor: '#ffffff',
      linkBackgroundColor: 'rgba(255, 255, 255, 0.85)',
      linkTextColor: '#1e1b4b',
      linkBorderRadius: 'rounded-2xl',
      headerStyle: 'glass'
    }
  },

  // Modern Themes
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Frosted glass effect with blur',
    preview: '🔮',
    category: 'modern',
    styles: {
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      primaryColor: '#1a202c',
      secondaryColor: '#4a5568',
      textColor: '#1a202c',
      linkBackgroundColor: 'rgba(255, 255, 255, 0.25)',
      linkTextColor: '#1a202c',
      linkBorderRadius: 'rounded-2xl',
      headerStyle: 'glass'
    }
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    description: 'Cyberpunk inspired with neon accents',
    preview: '💜',
    category: 'modern',
    styles: {
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      primaryColor: '#e879f9',
      secondaryColor: '#c084fc',
      textColor: '#e879f9',
      linkBackgroundColor: 'rgba(168, 85, 247, 0.1)',
      linkTextColor: '#e879f9',
      linkBorderRadius: 'rounded-xl',
      headerStyle: 'glass'
    }
  },

  // Fun Themes
  {
    id: 'candy-crush',
    name: 'Candy Crush',
    description: 'Sweet and playful candy colors',
    preview: '🍭',
    category: 'fun',
    styles: {
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 25%, #ff6ec7 50%, #c873f4 75%, #6ee7ff 100%)',
      primaryColor: '#ffffff',
      secondaryColor: '#fce4ec',
      textColor: '#ffffff',
      linkBackgroundColor: 'rgba(255, 255, 255, 0.9)',
      linkTextColor: '#e91e63',
      linkBorderRadius: 'rounded-full',
      headerStyle: 'rounded'
    }
  },
  {
    id: 'retro-wave',
    name: 'Retro Wave',
    description: '80s synthwave aesthetic',
    preview: '🌴',
    category: 'fun',
    styles: {
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(180deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
      primaryColor: '#ffb700',
      secondaryColor: '#ff006e',
      textColor: '#ffffff',
      linkBackgroundColor: 'rgba(0, 0, 0, 0.7)',
      linkTextColor: '#ffb700',
      linkBorderRadius: 'rounded-none',
      headerStyle: 'square'
    }
  },

  // Professional Themes
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional and trustworthy',
    preview: '💼',
    category: 'professional',
    styles: {
      backgroundType: 'solid',
      backgroundColor: '#1e3a8a',
      primaryColor: '#ffffff',
      secondaryColor: '#dbeafe',
      textColor: '#ffffff',
      linkBackgroundColor: 'rgba(255, 255, 255, 0.95)',
      linkTextColor: '#1e3a8a',
      linkBorderRadius: 'rounded-lg',
      headerStyle: 'minimal'
    }
  },
  {
    id: 'elegant-mono',
    name: 'Elegant Mono',
    description: 'Sophisticated black and white',
    preview: '⚫',
    category: 'professional',
    styles: {
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)',
      primaryColor: '#000000',
      secondaryColor: '#4b5563',
      textColor: '#000000',
      linkBackgroundColor: 'rgba(0, 0, 0, 0.95)',
      linkTextColor: '#ffffff',
      linkBorderRadius: 'rounded-xl',
      headerStyle: 'square'
    }
  }
]

export const getThemeById = (id: string): Theme | undefined => {
  return themes.find(theme => theme.id === id)
}

export const getThemesByCategory = (category: Theme['category']): Theme[] => {
  return themes.filter(theme => theme.category === category)
}