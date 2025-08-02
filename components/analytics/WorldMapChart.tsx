'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface WorldMapChartProps {
  data: {
    topCountries?: [string, number][]
    stats?: {
      topCountries?: [string, number][]
    }
  }
}

// Mapping des codes pays pour la carte
const countryCoordinates: Record<string, { x: number; y: number; name: string }> = {
  'FR': { x: 260, y: 110, name: 'France' },
  'US': { x: 100, y: 130, name: 'États-Unis' },
  'GB': { x: 250, y: 95, name: 'Royaume-Uni' },
  'DE': { x: 270, y: 100, name: 'Allemagne' },
  'ES': { x: 245, y: 125, name: 'Espagne' },
  'IT': { x: 275, y: 120, name: 'Italie' },
  'CA': { x: 90, y: 85, name: 'Canada' },
  'BR': { x: 140, y: 210, name: 'Brésil' },
  'JP': { x: 440, y: 135, name: 'Japon' },
  'CN': { x: 400, y: 130, name: 'Chine' },
  'IN': { x: 360, y: 160, name: 'Inde' },
  'AU': { x: 430, y: 230, name: 'Australie' },
  'MX': { x: 85, y: 165, name: 'Mexique' },
  'RU': { x: 350, y: 80, name: 'Russie' },
  'ZA': { x: 290, y: 235, name: 'Afrique du Sud' },
  'BE': { x: 262, y: 102, name: 'Belgique' },
  'NL': { x: 265, y: 97, name: 'Pays-Bas' },
  'CH': { x: 268, y: 112, name: 'Suisse' },
  'SE': { x: 280, y: 75, name: 'Suède' },
  'NO': { x: 270, y: 70, name: 'Norvège' }
}

export default function WorldMapChart({ data }: WorldMapChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  // Récupérer les données des pays
  const countryData = data?.topCountries || data?.stats?.topCountries || []
  
  // Calculer l'intensité des couleurs
  const maxClicks = Math.max(...countryData.map(([_, clicks]) => clicks), 1)
  
  const getColor = (clicks: number) => {
    const intensity = clicks / maxClicks
    if (intensity > 0.8) return '#1e40af' // Bleu très foncé
    if (intensity > 0.6) return '#2563eb' // Bleu foncé
    if (intensity > 0.4) return '#3b82f6' // Bleu moyen
    if (intensity > 0.2) return '#60a5fa' // Bleu clair
    return '#93c5fd' // Bleu très clair
  }

  return (
    <div className="w-full h-full relative">
      <svg
        ref={svgRef}
        viewBox="0 0 500 300"
        className="w-full h-full"
        style={{ maxHeight: '100%', maxWidth: '100%' }}
      >
        {/* Carte du monde simplifiée */}
        <g className="opacity-10">
          {/* Continents */}
          <path d="M 80 100 Q 120 90 140 110 L 130 180 Q 100 190 80 170 Z" fill="#6b7280" /> {/* Amérique du Nord */}
          <path d="M 120 180 Q 140 170 150 190 L 140 240 Q 120 250 110 230 Z" fill="#6b7280" /> {/* Amérique du Sud */}
          <path d="M 240 90 Q 290 85 300 100 L 295 140 Q 250 145 240 130 Z" fill="#6b7280" /> {/* Europe */}
          <path d="M 250 140 Q 310 135 320 160 L 310 220 Q 260 225 250 200 Z" fill="#6b7280" /> {/* Afrique */}
          <path d="M 320 100 Q 420 95 430 120 L 425 180 Q 340 185 330 160 Z" fill="#6b7280" /> {/* Asie */}
          <path d="M 400 210 Q 440 205 450 220 L 445 250 Q 410 255 400 240 Z" fill="#6b7280" /> {/* Océanie */}
        </g>

        {/* Points pour chaque pays avec des clics */}
        {countryData.map(([countryCode, clicks], index) => {
          const country = countryCoordinates[countryCode]
          if (!country) return null
          
          const radius = Math.max(8, Math.min(20, (clicks / maxClicks) * 25))
          const color = getColor(clicks)
          
          return (
            <motion.g
              key={countryCode}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {/* Cercle de base */}
              <circle
                cx={country.x}
                cy={country.y}
                r={radius}
                fill={color}
                className="opacity-60"
              />
              
              {/* Cercle animé */}
              <motion.circle
                cx={country.x}
                cy={country.y}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="2"
                initial={{ r: radius, opacity: 1 }}
                animate={{ r: radius + 10, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
              
              {/* Tooltip au survol */}
              <g className="cursor-pointer">
                <circle
                  cx={country.x}
                  cy={country.y}
                  r={radius + 5}
                  fill="transparent"
                  className="hover:fill-white hover:fill-opacity-10"
                />
                <title>{country.name}: {clicks} clics</title>
              </g>
              
              {/* Afficher le nombre pour les top 5 */}
              {index < 5 && (
                <text
                  x={country.x}
                  y={country.y + radius + 15}
                  textAnchor="middle"
                  className="fill-gray-700 dark:fill-gray-300 text-xs font-semibold"
                >
                  {clicks}
                </text>
              )}
            </motion.g>
          )
        })}
      </svg>

      {/* Légende */}
      <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Intensité des clics</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-blue-200 rounded" />
            <div className="w-4 h-4 bg-blue-400 rounded" />
            <div className="w-4 h-4 bg-blue-600 rounded" />
            <div className="w-4 h-4 bg-blue-800 rounded" />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Min → Max</span>
        </div>
      </div>
    </div>
  )
}