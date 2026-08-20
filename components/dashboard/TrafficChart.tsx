'use client'

import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useRef, useState } from 'react'

/**
 * Graphique de trafic, echelles et indicateur de variation.
 *
 * Extraits de la page du dashboard pour etre reutilisables par l apercu d un
 * lien. Les dupliquer aurait laisse les deux versions diverger.
 */

export type Period = 'today' | '7d' | '30d'
export const periodLabels: Record<Period, string> = {
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
}

export const hourName = (hour: number) => {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

// Le "T00:00:00" est necessaire : sans lui la date est lue en UTC et bascule
// d'un jour dans les fuseaux negatifs.
export const dayName = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export function Trend({ value, negativeIsGood = false }: { value: number; negativeIsGood?: boolean }) {
  if (value === 0) return <span className="text-xs font-bold text-dash-text6">0%</span>

  const rising = value >= 0
  const positive = negativeIsGood ? !rising : rising
  const Icon = rising ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 1 })}%
    </span>
  )
}

export type ChartPoint = { value: number; label: string }

export function TrafficChart({ data, period }: { data: ChartPoint[]; period: Period }) {
  const values = data.map(item => item.value)
  const max = Math.max(1, ...values)
  const total = values.reduce((sum, value) => sum + value, 0)
  const width = 800
  const height = 200
  const chartTop = 10
  const chartBottom = 190
  const usableHeight = chartBottom - chartTop
  const lastIndex = Math.max(1, data.length - 1)

  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const plotRef = useRef<HTMLDivElement>(null)

  // Les lignes de repere et leurs etiquettes sont calculees a partir des memes
  // constantes, pour qu'elles ne puissent pas se desaligner.
  const gridRows = [0, 1, 2, 3].map(row => {
    const y = chartTop + (usableHeight / 3) * row
    return { y, pct: (y / height) * 100, value: Math.round((max * (3 - row)) / 3) }
  })

  // Jusqu'a 5 reperes repartis sur la periode, etiquetes avec les vraies dates
  // ou heures. Les deux intermediaires disparaissent sur petit ecran, ou ils
  // se chevaucheraient.
  const xLabels = data.length
    ? [0, 0.25, 0.5, 0.75, 1]
        .map(ratio => Math.round(ratio * (data.length - 1)))
        .filter((index, position, list) => list.indexOf(index) === position)
        .map((index, position, list) => ({
          index,
          pct: (index / lastIndex) * 100,
          label: period === 'today' && position === list.length - 1 ? 'Now' : data[index].label,
          secondary: position % 2 === 1,
        }))
    : []

  const points = data.map((item, index) => ({
    x: data.length <= 1 ? width / 2 : (index / (data.length - 1)) * width,
    y: chartBottom - (item.value / max) * usableHeight,
    value: item.value,
    label: item.label,
  }))

  // Un seul capteur pour toute la zone : on cherche le point le plus proche du
  // curseur ou du doigt, au lieu de viser un cercle de 9 pixels.
  const pickNearest = (clientX: number) => {
    const element = plotRef.current
    if (!element || !data.length) return
    const bounds = element.getBoundingClientRect()
    if (bounds.width === 0) return
    const ratio = (clientX - bounds.left) / bounds.width
    const index = Math.round(ratio * lastIndex)
    setActiveIndex(Math.min(data.length - 1, Math.max(0, index)))
  }

  const active = activeIndex === null ? null : points[activeIndex]
  const linePath = points.length
    ? `M ${points.map(point => `${point.x} ${point.y}`).join(' L ')}`
    : `M 0 ${chartBottom} L ${width} ${chartBottom}`
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${chartBottom} L ${points[0].x} ${chartBottom} Z`
    : `M 0 ${chartBottom} L ${width} ${chartBottom} Z`

  return (
    <div className="mt-5 flex gap-2.5" aria-label={`${total} real clicks in ${periodLabels[period].toLowerCase()}`}>
      {/* Echelle verticale : sans elle, les lignes en pointilles ne voulaient rien dire. */}
      <div className="relative h-[200px] w-10 shrink-0">
        {gridRows.map(row => (
          <span
            key={row.y}
            className="absolute right-0 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium tabular-nums text-dash-text6"
            style={{ top: `${row.pct}%` }}
          >
            {row.value.toLocaleString('en-US')}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
      <div className="relative h-[200px] rounded-2xl border border-white/[0.045] bg-gradient-to-b from-white/[0.025] to-transparent">
        <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img">
          <defs>
            <linearGradient id="trafficArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#9b7cff" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trafficLine" x1="0" x2="1">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="45%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f0abfc" />
            </linearGradient>
            <filter id="trafficGlow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {gridRows.map(row => (
            <line key={row.y} x1="0" x2={width} y1={row.y} y2={row.y} stroke="white" strokeOpacity="0.055" strokeDasharray="5 8" />
          ))}
          <motion.path key={`area-${period}-${values.join('-')}`} d={areaPath} fill="url(#trafficArea)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} />
          <motion.path
            key={`line-${period}-${values.join('-')}`}
            d={linePath}
            fill="none"
            stroke="url(#trafficLine)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#trafficGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </svg>

        {/* Repere vertical sous le point survole. */}
        {active && (
          <span
            className="pointer-events-none absolute top-0 h-full w-px bg-white/15"
            style={{ left: `${(active.x / width) * 100}%` }}
          />
        )}

        {/* Les points sont poses en HTML et non en SVG : le graphique est etire
            horizontalement (preserveAspectRatio="none"), ce qui transformait les
            cercles SVG en ovales. Le reperage est le meme, donc ils restent alignes. */}
        {points.map((point, index) => (point.value > 0 || index === activeIndex) && (
          <span
            key={index}
            className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-[3px] ring-dash-overlay transition-[height,width] ${
              // bg-dash-text et non bg-white : le filet de securite mode sombre de
              // globals.css reecrit bg-white en couleur de carte, le point serait invisible.
              index === activeIndex ? 'h-[13px] w-[13px] bg-dash-text' : 'h-[9px] w-[9px] bg-violet-300'
            }`}
            style={{ left: `${(point.x / width) * 100}%`, top: `${(point.y / height) * 100}%` }}
          />
        ))}

        {/* Infobulle. Bridee entre 15% et 85% pour ne pas depasser des bords, et
            basculee sous le point quand celui-ci est trop haut. */}
        {active && (
          <div
            className={`pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border border-dash-line3 bg-dash-overlay px-3 py-2 text-center shadow-xl ${
              (active.y / height) * 100 < 38 ? '' : '-translate-y-full'
            }`}
            style={{
              left: `${Math.min(85, Math.max(15, (active.x / width) * 100))}%`,
              top: `calc(${(active.y / height) * 100}% ${(active.y / height) * 100 < 38 ? '+' : '-'} 14px)`,
            }}
          >
            <p className="whitespace-nowrap text-sm font-bold tabular-nums text-dash-text">
              {active.value.toLocaleString('en-US')} click{active.value === 1 ? '' : 's'}
            </p>
            <p className="mt-0.5 whitespace-nowrap text-[11px] text-dash-text5">{active.label}</p>
          </div>
        )}

        {/* Zone de captation unique : viser un cercle de 9 px etait impossible au
            doigt. touch-pan-y laisse le defilement vertical de la page intact. */}
        <div
          ref={plotRef}
          className="absolute inset-0 touch-pan-y"
          onPointerMove={event => pickNearest(event.clientX)}
          onPointerDown={event => pickNearest(event.clientX)}
          // Au doigt, pointerleave se declenche des qu'on souleve : sans ce test
          // l'infobulle disparaitrait aussitot apres le tap sur iPhone.
          onPointerLeave={event => { if (event.pointerType === 'mouse') setActiveIndex(null) }}
          onPointerCancel={() => setActiveIndex(null)}
        />
      </div>

      {/* Echelle horizontale : il n'y avait que deux reperes pour 24 points. */}
      <div className="relative mt-2.5 h-4 text-[11px] font-medium text-dash-text6">
        {xLabels.map(item => (
          <span
            key={item.index}
            className={`absolute whitespace-nowrap ${item.secondary ? 'hidden sm:inline' : ''}`}
            style={
              item.pct === 0 ? { left: 0 }
              : item.pct === 100 ? { right: 0 }
              : { left: `${item.pct}%`, transform: 'translateX(-50%)' }
            }
          >
            {item.label}
          </span>
        ))}
      </div>
      </div>
    </div>
  )
}
