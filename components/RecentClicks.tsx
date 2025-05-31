import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Click {
  id: string
  timestamp: string
  linkTitle: string
  linkUrl: string
  userAgent?: string
  referer?: string
}

interface RecentClicksProps {
  clicks: Click[]
}

export function RecentClicks({ clicks }: RecentClicksProps) {
  if (clicks.length === 0) {
    return null
  }

  const getBrowserFromUA = (ua?: string) => {
    if (!ua) return 'Inconnu'
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    return 'Autre'
  }

  const getDeviceFromUA = (ua?: string) => {
    if (!ua) return 'Inconnu'
    if (ua.includes('Mobile')) return '📱'
    if (ua.includes('Tablet')) return '📱'
    return '💻'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Clics récents</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-100">
              <th className="pb-3 text-sm font-medium text-gray-600">Date & Heure</th>
              <th className="pb-3 text-sm font-medium text-gray-600">Lien</th>
              <th className="pb-3 text-sm font-medium text-gray-600">Appareil</th>
              <th className="pb-3 text-sm font-medium text-gray-600">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clicks.map((click) => {
              let source = 'Direct'
              if (click.referer && click.referer !== 'null') {
                try {
                  source = new URL(click.referer).hostname
                } catch {}
              }
              
              return (
                <tr key={click.id} className="hover:bg-gray-50">
                  <td className="py-3 text-sm text-gray-900">
                    {format(new Date(click.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </td>
                  <td className="py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{click.linkTitle}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{click.linkUrl}</div>
                    </div>
                  </td>
                  <td className="py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span>{getDeviceFromUA(click.userAgent)}</span>
                      <span className="text-gray-600">{getBrowserFromUA(click.userAgent)}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {source}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}