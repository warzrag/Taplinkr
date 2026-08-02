'use client'

import { motion, useReducedMotion } from 'framer-motion'

export default function DashboardAtmosphere() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -left-40 -top-48 h-[520px] w-[520px] rounded-full bg-violet-600/[0.09] blur-[120px]"
        animate={reduceMotion ? undefined : { x: [0, 70, 0], y: [0, 35, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-40 top-40 h-[480px] w-[480px] rounded-full bg-cyan-500/[0.055] blur-[130px]"
        animate={reduceMotion ? undefined : { x: [0, -55, 0], y: [0, 65, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_65%)]" />
    </div>
  )
}
