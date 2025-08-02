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
  
  // Calculer l'échelle de couleurs avec les nouvelles plages
  const colorScale = scaleLinear<string>()
    .domain([0, 1, 10, 50, 100, 500])
    .range(['#f3f4f6', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#6366f1', '#4338ca'])

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
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 150,
          center: [10, 30]
        }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          minZoom={0.75}
          maxZoom={10}
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

      {/* Légende améliorée */}
      <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-xl p-5 shadow-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Distribution des clics
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-100 rounded border border-gray-300" />
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Aucun clic</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-indigo-200 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">1-10 clics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-indigo-300 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">11-50 clics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-indigo-400 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">51-100 clics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-indigo-500 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">101-500 clics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-indigo-700 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">500+ clics</span>
          </div>
        </div>
      </div>

      {/* Contrôles de zoom */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setPosition({ ...position, zoom: Math.min(position.zoom * 1.5, 10) })}
          className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Zoomer"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={() => setPosition({ ...position, zoom: Math.max(position.zoom / 1.5, 0.75) })}
          className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Dézoomer"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={() => setPosition({ coordinates: [10, 30], zoom: 1 })}
          className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Réinitialiser la vue"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg px-4 py-3 text-sm text-gray-700 dark:text-gray-300 shadow-lg">
        <p className="font-medium mb-1">Navigation</p>
        <p className="flex items-center gap-2">
          <span className="text-gray-500">🖱️</span>
          Molette pour zoomer
        </p>
        <p className="flex items-center gap-2">
          <span className="text-gray-500">✋</span>
          Glisser pour déplacer
        </p>
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