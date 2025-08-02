'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps'
import { scaleLinear } from 'd3-scale'
import { Loader2 } from 'lucide-react'

interface InteractiveWorldMapProps {
  data: {
    topCountries?: [string, number][]
    stats?: {
      topCountries?: [string, number][]
    }
  }
}

// URL pour la topologie du monde
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Mapping des codes pays ISO-2 vers ISO-3 pour la carte
const countryCodeMapping: Record<string, string> = {
  'FR': 'FRA',
  'US': 'USA',
  'GB': 'GBR',
  'DE': 'DEU',
  'ES': 'ESP',
  'IT': 'ITA',
  'CA': 'CAN',
  'BR': 'BRA',
  'JP': 'JPN',
  'CN': 'CHN',
  'IN': 'IND',
  'AU': 'AUS',
  'MX': 'MEX',
  'RU': 'RUS',
  'ZA': 'ZAF',
  'BE': 'BEL',
  'NL': 'NLD',
  'CH': 'CHE',
  'SE': 'SWE',
  'NO': 'NOR',
  'PT': 'PRT',
  'AT': 'AUT',
  'DK': 'DNK',
  'FI': 'FIN',
  'GR': 'GRC',
  'PL': 'POL',
  'RO': 'ROU',
  'CZ': 'CZE',
  'HU': 'HUN',
  'SK': 'SVK',
  'BG': 'BGR',
  'HR': 'HRV',
  'SI': 'SVN',
  'LT': 'LTU',
  'LV': 'LVA',
  'EE': 'EST',
  'IE': 'IRL',
  'LU': 'LUX',
  'MT': 'MLT',
  'CY': 'CYP'
}

// Noms des pays en français
const countryNames: Record<string, string> = {
  'FR': 'France',
  'US': 'États-Unis',
  'GB': 'Royaume-Uni',
  'DE': 'Allemagne',
  'ES': 'Espagne',
  'IT': 'Italie',
  'CA': 'Canada',
  'BR': 'Brésil',
  'JP': 'Japon',
  'CN': 'Chine',
  'IN': 'Inde',
  'AU': 'Australie',
  'MX': 'Mexique',
  'RU': 'Russie',
  'ZA': 'Afrique du Sud',
  'BE': 'Belgique',
  'NL': 'Pays-Bas',
  'CH': 'Suisse',
  'SE': 'Suède',
  'NO': 'Norvège',
  'Unknown': 'Inconnu'
}

export default function InteractiveWorldMap({ data }: InteractiveWorldMapProps) {
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    country: string
    clicks: number
    percentage: number
  } | null>(null)
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })
  const [isLoading, setIsLoading] = useState(true)

  // Récupérer les données des pays
  const countryData = data?.topCountries || data?.stats?.topCountries || []
  
  // Créer un objet pour un accès rapide
  const clicksByCountry: Record<string, number> = {}
  let totalClicks = 0
  
  countryData.forEach(([code, clicks]) => {
    const iso3Code = countryCodeMapping[code]
    if (iso3Code) {
      clicksByCountry[iso3Code] = clicks
      totalClicks += clicks
    }
  })
  
  // Calculer l'échelle de couleurs
  const maxClicks = Math.max(...Object.values(clicksByCountry), 1)
  const colorScale = scaleLinear<string>()
    .domain([0, maxClicks * 0.2, maxClicks * 0.4, maxClicks * 0.6, maxClicks * 0.8, maxClicks])
    .range(['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5'])

  const handleMoveEnd = (position: any) => {
    setPosition(position)
  }

  const getCountryColor = (geo: any) => {
    const countryCode = geo.properties.ISO_A3
    const clicks = clicksByCountry[countryCode] || 0
    
    if (clicks === 0) return '#f3f4f6'
    return colorScale(clicks)
  }

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const countryCode = geo.properties.ISO_A3
    const iso2Code = Object.entries(countryCodeMapping).find(([_, v]) => v === countryCode)?.[0]
    const clicks = clicksByCountry[countryCode] || 0
    
    if (clicks > 0 && iso2Code) {
      const percentage = totalClicks > 0 ? (clicks / totalClicks) * 100 : 0
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        country: countryNames[iso2Code] || geo.properties.NAME || 'Inconnu',
        clicks: clicks,
        percentage: percentage
      })
    }
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  useEffect(() => {
    // Simuler le chargement de la carte
    setTimeout(() => setIsLoading(false), 500)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
          center: [0, 20]
        }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          minZoom={0.5}
          maxZoom={8}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = geo.properties.ISO_A3
                const hasClicks = clicksByCountry[countryCode] > 0
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(geo)}
                    stroke="#e5e7eb"
                    strokeWidth={0.5}
                    onMouseEnter={(event) => handleMouseEnter(geo, event)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        outline: 'none',
                        transition: 'fill 0.3s ease'
                      },
                      hover: {
                        fill: hasClicks ? '#4338ca' : '#f3f4f6',
                        outline: 'none',
                        cursor: hasClicks ? 'pointer' : 'default'
                      },
                      pressed: {
                        fill: hasClicks ? '#3730a3' : '#f3f4f6',
                        outline: 'none'
                      }
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
          Distribution des clics
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300" />
            <span className="text-xs text-gray-600 dark:text-gray-400">0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-200 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">1-2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-300 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">3-3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-400 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">4-5</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-500 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">6-6</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-600 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">7-8</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-700 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">9+</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-400 shadow-lg">
        <p>🖱️ Molette pour zoomer</p>
        <p>🤚 Glisser pour déplacer</p>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {tooltip.country}
          </p>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tooltip.clicks} clics
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {tooltip.percentage.toFixed(1)}%
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}