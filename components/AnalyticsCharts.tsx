'use client'

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ChartsProps {
  data: {
    clicksByDay: Record<string, number>
    topLinks: any[]
    browsers: Record<string, number>
    devices: Record<string, number>
    topReferrers: { url: string; count: number }[]
  }
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export function AnalyticsCharts({ data }: ChartsProps) {
  // Préparer les données pour le graphique de ligne
  const lineData = Object.entries(data.clicksByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, clicks]) => ({
      date: format(new Date(date), 'dd MMM', { locale: fr }),
      fullDate: date,
      clicks
    }))

  // Préparer les données pour le graphique en barres
  const barData = data.topLinks.slice(0, 5).map(link => ({
    title: link.title.length > 20 ? link.title.substring(0, 20) + '...' : link.title,
    clicks: link.clicks
  }))

  // Préparer les données pour les graphiques circulaires
  const browserData = Object.entries(data.browsers).map(([name, value]) => ({ name, value }))
  const deviceData = Object.entries(data.devices).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-8">
      {/* Graphique de ligne - Évolution des clics */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Évolution des clics</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                labelFormatter={(value, payload) => {
                  if (payload && payload[0]) {
                    return format(new Date(payload[0].payload.fullDate), 'dd MMMM yyyy', { locale: fr })
                  }
                  return value
                }}
              />
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 6 }}
                activeDot={{ r: 8 }}
                name="Clics"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top des liens */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 5 des liens</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="title"
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Bar 
                  dataKey="clicks" 
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                  name="Clics"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par navigateur */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Navigateurs</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={browserData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {browserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sources de trafic */}
      {data.topReferrers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sources de trafic</h3>
          <div className="space-y-4">
            {data.topReferrers.map((referrer, index) => {
              const percentage = (referrer.count / data.topReferrers.reduce((sum, r) => sum + r.count, 0)) * 100
              let displayUrl = referrer.url
              if (displayUrl !== 'Direct') {
                try {
                  displayUrl = new URL(referrer.url).hostname
                } catch {}
              }
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{displayUrl}</span>
                      <span className="text-sm text-gray-500">{referrer.count} visites</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}