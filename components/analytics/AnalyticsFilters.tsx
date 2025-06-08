'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Filter, Calendar, Globe, Smartphone, Chrome, 
  Clock, TrendingUp, Users, X, Check
} from 'lucide-react'

interface AnalyticsFiltersProps {
  onFiltersChange: (filters: any) => void
  initialFilters?: any
}

export default function AnalyticsFilters({ onFiltersChange, initialFilters = {} }: AnalyticsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    dateRange: initialFilters.dateRange || '30',
    country: initialFilters.country || 'all',
    device: initialFilters.device || 'all',
    browser: initialFilters.browser || 'all',
    timeOfDay: initialFilters.timeOfDay || 'all',
    minClicks: initialFilters.minClicks || '',
    ...initialFilters
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const dateRangeOptions = [
    { value: '7', label: '7 derniers jours' },
    { value: '30', label: '30 derniers jours' },
    { value: '90', label: '3 derniers mois' },
    { value: '365', label: '12 derniers mois' },
    { value: 'custom', label: 'Période personnalisée' }
  ]

  const countryOptions = [
    { value: 'all', label: 'Tous les pays' },
    { value: 'FR', label: 'France' },
    { value: 'CA', label: 'Canada' },
    { value: 'BE', label: 'Belgique' },
    { value: 'CH', label: 'Suisse' },
    { value: 'US', label: 'États-Unis' }
  ]

  const deviceOptions = [
    { value: 'all', label: 'Tous les appareils' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'tablet', label: 'Tablette' }
  ]

  const browserOptions = [
    { value: 'all', label: 'Tous les navigateurs' },
    { value: 'chrome', label: 'Chrome' },
    { value: 'safari', label: 'Safari' },
    { value: 'firefox', label: 'Firefox' },
    { value: 'edge', label: 'Edge' }
  ]

  const timeOfDayOptions = [
    { value: 'all', label: 'Toute la journée' },
    { value: 'morning', label: 'Matin (6h-12h)' },
    { value: 'afternoon', label: 'Après-midi (12h-18h)' },
    { value: 'evening', label: 'Soirée (18h-24h)' },
    { value: 'night', label: 'Nuit (0h-6h)' }
  ]

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Compter les filtres actifs
    const active = Object.entries(newFilters).filter(([k, v]) => 
      v !== 'all' && v !== '' && v !== '30'
    ).length
    setActiveFiltersCount(active)
    
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const resetFilters = {
      dateRange: '30',
      country: 'all',
      device: 'all',
      browser: 'all',
      timeOfDay: 'all',
      minClicks: ''
    }
    setFilters(resetFilters)
    setActiveFiltersCount(0)
    onFiltersChange(resetFilters)
  }

  return (
    <div className="relative">
      {/* Bouton d'ouverture des filtres */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="text-gray-700 font-medium">Filtres</span>
        {activeFiltersCount > 0 && (
          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </motion.button>

      {/* Panel des filtres */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Filtres avancés</h3>
                  <p className="text-sm text-gray-600 mt-1">Personnalisez vos analyses</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Contenu des filtres */}
              <div className="p-6 space-y-6">
                {/* Période */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>Période</span>
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => updateFilter('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {dateRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pays */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Globe className="w-4 h-4" />
                    <span>Pays</span>
                  </label>
                  <select
                    value={filters.country}
                    onChange={(e) => updateFilter('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {countryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Appareil */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Smartphone className="w-4 h-4" />
                    <span>Appareil</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {deviceOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => updateFilter('device', option.value)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                          filters.device === option.value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigateur */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Chrome className="w-4 h-4" />
                    <span>Navigateur</span>
                  </label>
                  <select
                    value={filters.browser}
                    onChange={(e) => updateFilter('browser', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {browserOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Heure de la journée */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>Moment de la journée</span>
                  </label>
                  <select
                    value={filters.timeOfDay}
                    onChange={(e) => updateFilter('timeOfDay', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {timeOfDayOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clics minimum */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <TrendingUp className="w-4 h-4" />
                    <span>Clics minimum</span>
                  </label>
                  <input
                    type="number"
                    value={filters.minClicks}
                    onChange={(e) => updateFilter('minClicks', e.target.value)}
                    placeholder="Ex: 10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex space-x-3">
                  <button
                    onClick={resetFilters}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
                
                {activeFiltersCount > 0 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {activeFiltersCount} filtre(s) actif(s)
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}