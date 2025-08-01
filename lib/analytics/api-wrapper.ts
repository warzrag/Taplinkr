// Wrapper pour les appels API avec gestion d'erreur
export async function fetchAnalyticsData(endpoint: string) {
  try {
    const response = await fetch(endpoint)
    
    if (!response.ok) {
      console.error(`API Error ${endpoint}:`, response.status, response.statusText)
      
      // Retourner des données par défaut en cas d'erreur
      return getDefaultAnalyticsData()
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Fetch error ${endpoint}:`, error)
    return getDefaultAnalyticsData()
  }
}

function getDefaultAnalyticsData() {
  const today = new Date()
  const summary = []
  
  // Générer 30 jours de données vides
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    summary.push({
      date: date.toISOString().split('T')[0],
      clicks: 0,
      views: 0
    })
  }
  
  return {
    summary,
    stats: {
      hourlyDistribution: Object.fromEntries(
        Array.from({ length: 24 }, (_, i) => [i, 0])
      ),
      topCountries: [],
      topDevices: [],
      topBrowsers: [],
      topSources: []
    },
    totals: {
      clicks: 0,
      views: 0,
      uniqueVisitors: 0,
      growthRate: 0
    }
  }
}