'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'

interface DashboardChartProps {
  data: {
    summary: Array<{
      date: string
      clicks: number
    }>
    totalClicks?: number
  }
}

export default function DashboardChart({ data }: DashboardChartProps) {
  // Préparer les données pour les 7 derniers jours
  const prepareChartData = () => {
    if (!data?.summary || data.summary.length === 0) {
      // Générer des données vides pour les 7 derniers jours
      const emptyData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        emptyData.push({
          date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          fullDate: date.toLocaleDateString('fr-FR'),
          clicks: 0
        })
      }
      return emptyData
    }

    // Utiliser les données réelles
    return data.summary.slice(-7).map(item => ({
      date: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      fullDate: new Date(item.date).toLocaleDateString('fr-FR'),
      clicks: item.clicks || 0
    }))
  }

  const chartData = prepareChartData()

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.name}: 
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorClicks)"
            name="Clics"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}