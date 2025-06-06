'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Palette, Crown, Check, ArrowLeft, Filter } from 'lucide-react'

interface Template {
  id: string
  name: string
  description?: string
  category: string
  layout: string
  colors: string
  fonts: string
  spacing: string
  animations?: string
  isPremium: boolean
  isPublic: boolean
  usageCount: number
  author?: {
    id: string
    name?: string
    username: string
  }
  thumbnail?: {
    url: string
  }
}

export default function TemplatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null)

  const categories = [
    { value: 'all', label: 'Tous' },
    { value: 'business', label: 'Business' },
    { value: 'personal', label: 'Personnel' },
    { value: 'social', label: 'Social' },
    { value: 'creative', label: 'Créatif' }
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchTemplates()
    }
  }, [status, router])

  const fetchTemplates = async () => {
    try {
      const url = selectedCategory === 'all' 
        ? '/api/templates'
        : `/api/templates?category=${selectedCategory}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Erreur lors du chargement des templates')
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = async (templateId: string) => {
    setApplyingTemplate(templateId)
    try {
      const response = await fetch(`/api/templates/${templateId}/apply`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Template appliqué avec succès!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'application du template')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'application du template')
    } finally {
      setApplyingTemplate(null)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [selectedCategory])

  const getColorPreview = (colorsJson: string) => {
    try {
      const colors = JSON.parse(colorsJson)
      return [colors.primary, colors.secondary, colors.accent || colors.background]
    } catch {
      return ['#3b82f6', '#8b5cf6', '#10b981']
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement des templates...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
              <p className="text-gray-600">
                Choisissez un template pour personnaliser l'apparence de votre page
              </p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const colorPreview = getColorPreview(template.colors)
            
            return (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Template Preview */}
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {template.thumbnail ? (
                    <img
                      src={template.thumbnail.url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="flex justify-center space-x-2">
                          {colorPreview.map((color, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full border-2 border-white shadow"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 rounded mx-4"></div>
                          <div className="h-3 bg-gray-200 rounded mx-8"></div>
                          <div className="space-y-1">
                            <div className="h-8 bg-blue-200 rounded mx-6"></div>
                            <div className="h-8 bg-blue-100 rounded mx-6"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-yellow-500 text-white px-2 py-1 rounded-lg flex items-center space-x-1 text-xs font-medium">
                        <Crown className="w-3 h-3" />
                        <span>Premium</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                    
                    {/* Category & Usage */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded capitalize">
                        {template.category}
                      </span>
                      <span>{template.usageCount} utilisations</span>
                    </div>
                  </div>

                  {/* Author */}
                  {template.author && (
                    <div className="mb-4 text-xs text-gray-500">
                      Par {template.author.name || template.author.username}
                    </div>
                  )}

                  {/* Apply Button */}
                  <button
                    onClick={() => applyTemplate(template.id)}
                    disabled={applyingTemplate === template.id}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      template.isPremium
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {applyingTemplate === template.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Application...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Check className="w-4 h-4" />
                        <span>Appliquer</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {templates.length === 0 && !loading && (
          <div className="text-center py-12">
            <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun template trouvé
            </h3>
            <p className="text-gray-500">
              Essayez une autre catégorie ou créez votre propre template.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}