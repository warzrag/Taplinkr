'use client'

import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'

interface CountryBarsChartProps {
  data: {
    topCountries?: [string, number][]
    stats?: {
      topCountries?: [string, number][]
    }
  }
}

// Noms complets des pays
const countryNames: Record<string, string> = {
  'FR': '🇫🇷 France',
  'US': '🇺🇸 États-Unis',
  'GB': '🇬🇧 Royaume-Uni',
  'DE': '🇩🇪 Allemagne',
  'ES': '🇪🇸 Espagne',
  'IT': '🇮🇹 Italie',
  'CA': '🇨🇦 Canada',
  'BR': '🇧🇷 Brésil',
  'JP': '🇯🇵 Japon',
  'CN': '🇨🇳 Chine',
  'IN': '🇮🇳 Inde',
  'AU': '🇦🇺 Australie',
  'MX': '🇲🇽 Mexique',
  'RU': '🇷🇺 Russie',
  'ZA': '🇿🇦 Afrique du Sud',
  'BE': '🇧🇪 Belgique',
  'NL': '🇳🇱 Pays-Bas',
  'CH': '🇨🇭 Suisse',
  'SE': '🇸🇪 Suède',
  'NO': '🇳🇴 Norvège',
  'Unknown': '🌍 Inconnu'
}

export default function CountryBarsChart({ data }: CountryBarsChartProps) {
  // Récupérer les données des pays
  const countryData = data?.topCountries || data?.stats?.topCountries || []
  
  // Prendre les 10 premiers pays
  const topCountries = countryData.slice(0, 10)
  
  // Calculer le maximum pour l'échelle
  const maxClicks = Math.max(...topCountries.map(([_, clicks]) => clicks), 1)
  
  if (topCountries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <Globe className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Aucune donnée géographique</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {topCountries.map(([countryCode, clicks], index) => {
        const percentage = (clicks / maxClicks) * 100
        const countryName = countryNames[countryCode] || `${countryCode}`
        
        return (
          <motion.div
            key={countryCode}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
          >
            {/* Nom du pays et nombre de clics */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {countryName}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {clicks.toLocaleString()}
              </span>
            </div>
            
            {/* Barre de progression */}
            <div className="relative h-6 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-lg"
                style={{
                  background: `linear-gradient(to right, ${
                    index === 0 ? '#f59e0b, #ef4444' :
                    index === 1 ? '#3b82f6, #6366f1' :
                    index === 2 ? '#10b981, #059669' :
                    '#6b7280, #4b5563'
                  })`
                }}
              >
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
              
              {/* Pourcentage */}
              {percentage > 20 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {percentage.toFixed(0)}%
                </span>
              )}
            </div>
          </motion.div>
        )
      })}
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}