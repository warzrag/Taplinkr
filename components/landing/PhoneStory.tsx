'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { AnimatePresence, motion, useAnimate, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import {
  BatteryFull,
  CalendarDays,
  Camera,
  ChevronLeft,
  Crown,
  GripVertical,
  Heart,
  Link2,
  Mail,
  MessageCircle,
  Mic,
  Music2,
  Play,
  Plus,
  SendHorizontal,
  ShoppingBag,
  Signal,
  Wifi,
} from 'lucide-react'

/**
 * Le telephone de la page d'accueil et ses cinq ecrans.
 *
 * Tout ce qu'il affiche est fictif et le dit ("Example"), sauf ce qui vient
 * du visiteur : le nom qu'il tape. Florent refuse d'afficher de vrais chiffres.
 * Les noms d'exemple (mia, leo.music, chef.sam, nora.art, mia-chat...) ne
 * correspondaient a aucun compte ni lien en base le 29 septembre 2026.
 *
 * Aucune balise h1-h6 ni p a l'interieur : globals.css leur impose la couleur
 * du theme, ce qui mettait du texte clair sur l'ecran blanc du telephone (le
 * "Lea Martin" illisible de l'ancienne page). Chaque texte porte ici sa propre
 * couleur, en valeur fixe : les classes nommees (bg-white, text-gray-900...)
 * sont repeintes par le filet de securite du mode sombre.
 *
 * Animations reduites (reglage du visiteur) : les demonstrations continuent en
 * fondus, sans deplacement (MotionConfig dans app/page.tsx) ; le doigt, le
 * flottement et l'inclinaison disparaissent.
 */

export type PhoneScreen = 'page' | 'edit' | 'stats' | 'direct' | 'team'

const INK = '#0b0b12'
const MUTED = '#5f5f6e'
const EASE = [0.16, 1, 0.3, 1] as const

/** Le compte d'exemple montre tant que le visiteur n'a rien tape. */
export const DEMO_OWNER = 'mia'

/**
 * Vrai quand le visiteur a demande moins d'animations dans son systeme.
 *
 * Toujours faux au premier rendu : le serveur ne connait pas ce reglage, et un
 * premier rendu different du sien faisait echouer l'hydratation ("Hydration
 * failed"), ce qui reconstruisait toute la page chez ces visiteurs.
 */
export function useCalm() {
  const reduce = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted && reduce === true
}

// Des noms qui s'ecrivent tout seuls tant que le visiteur n'a rien tape, chacun
// avec sa couleur : on voit la page se construire ET se personnaliser.
const DEMOS = [
  { name: DEMO_OWNER, accent: '#7c3aed' },
  { name: 'leo.music', accent: '#2563eb' },
  { name: 'chef.sam', accent: '#db2777' },
  { name: 'nora.art', accent: '#059669' },
]

/**
 * Le nom qui s'ecrit tout seul. Il tourne aussi en animations reduites : ce
 * n'est que du texte qui change. `running` doit etre faux quand le haut de page
 * n'est plus a l'ecran : chaque lettre refait le rendu de toute la page.
 */
export function useDemoName(running: boolean) {
  const [state, setState] = useState({ index: 0, length: 0 })

  useEffect(() => {
    if (!running) return
    let index = 0
    let length = 0
    let deleting = false
    let timer = 0

    const tick = () => {
      const target = DEMOS[index].name
      if (!deleting) {
        length += 1
        if (length >= target.length) {
          setState({ index, length: target.length })
          deleting = true
          timer = window.setTimeout(tick, 1900)
          return
        }
      } else {
        length -= 1
        if (length <= 0) {
          deleting = false
          index = (index + 1) % DEMOS.length
          setState({ index, length: 0 })
          timer = window.setTimeout(tick, 380)
          return
        }
      }
      setState({ index, length })
      timer = window.setTimeout(tick, deleting ? 42 : 95)
    }

    timer = window.setTimeout(tick, 700)
    return () => window.clearTimeout(timer)
  }, [running])

  const demo = DEMOS[state.index]
  return { name: demo.name.slice(0, state.length), accent: demo.accent }
}

function displayName(handle: string) {
  const words = handle.split(/[._-]+/).filter(Boolean)
  if (!words.length) return ''
  return words.map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
}

function initials(handle: string) {
  const words = handle.split(/[._-]+/).filter(Boolean)
  return words.slice(0, 2).map(word => word[0].toUpperCase()).join('')
}

// Le reflet de la vitre, fourni par LivePhone (ordinateur seulement).
const GlareContext = createContext<MotionValue<string> | null>(null)

export function PhoneFrame({ children, glow = '#7c3aed' }: { children: ReactNode; glow?: string }) {
  const glare = useContext(GlareContext)
  return (
    <div
      className="relative h-[640px] w-[312px] overflow-hidden rounded-[52px] bg-[#1b1b24] p-[10px] ring-1 ring-[#ffffff]/10 transition-[box-shadow] duration-700 motion-reduce:transition-none"
      // Le halo prend la couleur de la page affichee et change avec elle.
      style={{ boxShadow: `0 60px 90px -40px ${glow}8c, 0 30px 50px -25px rgba(0,0,0,0.85)` }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[43px] bg-[#ffffff]">
        <div className="absolute left-1/2 top-[10px] z-30 h-[26px] w-[90px] -translate-x-1/2 rounded-full bg-[#0b0b12]" />
        {children}
      </div>
      {glare && (
        // Une bande de lumiere en travers de la vitre : invisible sur le blanc,
        // elle eclaire le cadre et les aplats de couleur en glissant.
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 z-40 w-[200%]"
          style={{
            x: glare,
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.13) 48%, rgba(255,255,255,0.04) 53%, transparent 58%)',
          }}
        />
      )}
    </div>
  )
}

/**
 * Le telephone vivant de l'ordinateur : il s'incline vers la souris, et le
 * reflet glisse sur sa vitre. Rien sur ecran tactile ni en animations reduites.
 */
export function LivePhone({ children }: { children: ReactNode }) {
  const calm = useCalm()
  const rotateX = useSpring(0, { stiffness: 110, damping: 18, mass: 0.8 })
  const rotateY = useSpring(0, { stiffness: 110, damping: 18, mass: 0.8 })
  // La lumiere reste fixe, le telephone tourne : le reflet part a l'oppose.
  const glare = useTransform(rotateY, [-9, 9], ['24%', '-24%'])
  const [tilting, setTilting] = useState(false)

  useEffect(() => {
    if (calm || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    setTilting(true)
    const follow = (event: PointerEvent) => {
      rotateY.set((event.clientX / window.innerWidth - 0.5) * 18)
      rotateX.set((0.5 - event.clientY / window.innerHeight) * 10)
    }
    const rest = () => {
      rotateX.set(0)
      rotateY.set(0)
    }
    window.addEventListener('pointermove', follow, { passive: true })
    document.documentElement.addEventListener('pointerleave', rest)
    window.addEventListener('blur', rest)
    return () => {
      window.removeEventListener('pointermove', follow)
      document.documentElement.removeEventListener('pointerleave', rest)
      window.removeEventListener('blur', rest)
      rest()
      setTilting(false)
    }
  }, [calm, rotateX, rotateY])

  return (
    <GlareContext.Provider value={tilting ? glare : null}>
      <motion.div style={{ rotateX, rotateY, transformPerspective: 1400 }}>{children}</motion.div>
    </GlareContext.Provider>
  )
}

function StatusBar({ light = false }: { light?: boolean }) {
  const color = light ? '#ffffff' : INK
  return (
    <div className="relative z-20 flex h-[46px] shrink-0 items-center justify-between px-7 pt-1 text-[12px] font-semibold" style={{ color }}>
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <Signal className="h-3.5 w-3.5" />
        <Wifi className="h-3.5 w-3.5" />
        <BatteryFull className="h-4 w-4" />
      </span>
    </div>
  )
}

function ExampleTag({ label = 'Example' }: { label?: string }) {
  return <div className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a1a1ae]">{label}</div>
}

// Clignotement en CSS (globals.css, phone-caret) et non framer-motion : sous un
// AnimatePresence initial={false}, framer bloque l'animation de depart des
// elements deja presents, et ce curseur restait allume sans jamais clignoter.
function Caret({ color, height }: { color: string; height: number }) {
  return (
    <span
      className="ml-0.5 inline-block w-[2px] shrink-0 rounded-full motion-safe:animate-[phone-caret_1s_step-end_infinite]"
      style={{ backgroundColor: color, height }}
    />
  )
}

// ---------------------------------------------------------------------------
// Le doigt de la demonstration : un rond qui se deplace et touche, comme dans
// une video de produit. Absent en animations reduites.

const FINGER = 36

type Spot = { x: number; y: number }

/**
 * Le centre d'un element dans l'ecran du telephone, en pixels de mise en page.
 * offsetLeft/offsetTop ignorent les transformations (telephone reduit sur
 * mobile, incline sur ordinateur) : le doigt tombe juste dans tous les cas.
 */
function spot(root: HTMLElement | null, element: HTMLElement | null, dx = 0.5, dy = 0.5): Spot {
  if (!root || !element) return { x: 0, y: 0 }
  let x = element.offsetWidth * dx
  let y = element.offsetHeight * dy
  let node: HTMLElement | null = element
  while (node && node !== root) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return { x, y }
}

function Finger({ fingerRef, rippleRef }: { fingerRef: RefObject<HTMLDivElement>; rippleRef: RefObject<HTMLDivElement> }) {
  return (
    <>
      <div
        ref={rippleRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-30 h-9 w-9 rounded-full border-2 border-[#7c3aed] bg-[#7c3aed]/15"
        style={{ opacity: 0 }}
      />
      <div
        ref={fingerRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-30 h-9 w-9 rounded-full border-2 border-[#ffffff] bg-[#0b0b12]/25 shadow-[0_8px_18px_-6px_rgba(11,11,18,0.55)]"
        style={{ opacity: 0 }}
      />
    </>
  )
}

/** Les gestes du doigt, a enchainer avec await dans une sequence. */
function useFinger() {
  const [scope, animate] = useAnimate()
  const fingerRef = useRef<HTMLDivElement>(null)
  const rippleRef = useRef<HTMLDivElement>(null)

  const hand = useMemo(() => {
    const at = (point: Spot) => ({ x: point.x - FINGER / 2, y: point.y - FINGER / 2 })
    const finger = () => fingerRef.current as HTMLDivElement
    return {
      place: (point: Spot) => animate(finger(), { ...at(point), opacity: 0, scale: 1 }, { duration: 0 }),
      show: () => animate(finger(), { opacity: 1 }, { duration: 0.25 }),
      hide: () => animate(finger(), { opacity: 0 }, { duration: 0.25 }),
      move: (point: Spot, duration = 0.55) => animate(finger(), at(point), { duration, ease: EASE }),
      press: () => animate(finger(), { scale: 0.82 }, { duration: 0.12 }),
      release: () => animate(finger(), { scale: 1 }, { duration: 0.18 }),
      tap: async (point: Spot) => {
        const ripple = rippleRef.current as HTMLDivElement
        animate(ripple, { ...at(point), scale: 0.6, opacity: 0.7 }, { duration: 0 })
        animate(ripple, { scale: 1.9, opacity: 0 }, { duration: 0.55, ease: 'easeOut' })
        await animate(finger(), { scale: [1, 0.8, 1] }, { duration: 0.3 })
      },
    }
  }, [animate])

  return { scope, fingerRef, rippleRef, hand }
}

/** Des pauses annulables : quand l'ecran sort de la vue, la sequence s'arrete. */
function useSequence(run: (sleep: (ms: number) => Promise<void>, stopped: () => boolean) => Promise<void>, active: boolean, deps: unknown[]) {
  useEffect(() => {
    if (!active) return
    let stop = false
    const timers: number[] = []
    const sleep = (ms: number) => new Promise<void>(resolve => { timers.push(window.setTimeout(resolve, ms)) })
    run(sleep, () => stop)
    return () => {
      stop = true
      timers.forEach(timer => window.clearTimeout(timer))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ...deps])
}

const PAGE_LINKS = [
  { label: 'Watch my latest video', icon: Play },
  { label: 'Shop my favorites', icon: ShoppingBag },
  { label: 'Join my newsletter', icon: Mail },
  { label: 'Book a collab', icon: CalendarDays },
]

// initial={false} sur tout ce qui prend la couleur de la page : sans lui,
// framer n'ecrit la couleur qu'apres le chargement du JavaScript, et l'avatar
// et le premier lien restaient blancs pendant une ou deux secondes.

/** La page de liens, construite avec le nom tape (ou celui qui s'ecrit seul). */
export function PageScreen({ handle, accent, typing, example }: { handle: string; accent: string; typing: boolean; example: boolean }) {
  const calm = useCalm()
  const name = displayName(handle)
  return (
    <div className="absolute inset-0 flex flex-col">
      <motion.div
        className="absolute inset-x-0 top-0 h-[168px]"
        initial={false}
        animate={{ backgroundColor: accent }}
        transition={{ duration: calm ? 0 : 0.5, ease: EASE }}
      />
      <StatusBar light />
      <div className="relative z-10 mt-[42px] flex flex-col items-center px-6">
        <motion.div
          className="grid h-[92px] w-[92px] place-items-center rounded-full border-[5px] border-[#ffffff] text-[30px] font-bold text-[#ffffff] shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45)]"
          initial={false}
          animate={{ backgroundColor: accent }}
          transition={{ duration: calm ? 0 : 0.5 }}
        >
          {initials(handle)}
        </motion.div>
        <div className="mt-3 flex h-[28px] items-center text-[21px] font-bold tracking-[-0.02em]" style={{ color: INK }}>
          {name || ' '}
          {typing && !calm && <Caret color={accent} height={20} />}
        </div>
        <div className="text-[13px]" style={{ color: MUTED }}>@{handle || 'yourname'}</div>
        <div className="mt-2 text-center text-[13px] leading-snug" style={{ color: '#3f3f4b' }}>Creator · new drops every week</div>
        <div className="mt-3 flex gap-2">
          {[Camera, Music2, Play].map((Icon, index) => (
            <span key={index} className="grid h-8 w-8 place-items-center rounded-full bg-[#f1f1f5]" style={{ color: INK }}>
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-2.5 px-5">
        {PAGE_LINKS.map((link, index) => (
          <motion.div
            key={link.label}
            initial={false}
            animate={{ backgroundColor: index === 0 ? accent : '#f3f3f7' }}
            transition={{ duration: calm ? 0 : 0.45, ease: EASE }}
            className="flex h-[48px] items-center gap-3 rounded-2xl px-4 text-[14px] font-semibold"
            style={{ color: index === 0 ? '#ffffff' : INK }}
          >
            <link.icon className="h-4 w-4 shrink-0" />
            {link.label}
          </motion.div>
        ))}
      </div>
      <div className="mt-auto pb-5 text-center">
        {example && <ExampleTag />}
        <div className={`${example ? 'mt-1' : ''} text-[11px] font-medium text-[#9a9aa8]`}>taplinkr.com/{handle || 'yourname'}</div>
      </div>
    </div>
  )
}

const MINI_LINKS = [
  { label: 'Video', icon: Play },
  { label: 'Shop', icon: ShoppingBag },
  { label: 'Newsletter', icon: Mail },
]

/**
 * Le haut de la page, en petit, colle au champ sur mobile : le grand
 * telephone y est sous le pli et le clavier le cache. Le visiteur voit donc
 * sa page naitre pendant qu'il tape.
 */
export function MiniPreview({ handle, accent, typing, example }: { handle: string; accent: string; typing: boolean; example: boolean }) {
  const calm = useCalm()
  const name = displayName(handle)
  return (
    <div
      className="rounded-[24px] bg-[#ffffff] p-3.5 transition-[box-shadow] duration-700 motion-reduce:transition-none"
      style={{ boxShadow: `0 22px 44px -26px ${accent}b3` }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[17px] font-bold text-[#ffffff]"
          initial={false}
          animate={{ backgroundColor: accent }}
          transition={{ duration: calm ? 0 : 0.5 }}
        >
          {initials(handle)}
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex h-[22px] items-center text-[16px] font-bold tracking-[-0.01em]" style={{ color: INK }}>
            <span className="truncate">{name || <span style={{ color: '#a1a1ae' }}>Your name</span>}</span>
            {typing && !calm && <Caret color={accent} height={16} />}
          </div>
          <div className="truncate text-[13px]" style={{ color: MUTED }}>taplinkr.com/{handle || 'yourname'}</div>
        </div>
        <div className="shrink-0 self-start pt-1">
          <ExampleTag label={example ? 'Example' : 'Preview'} />
        </div>
      </div>
      {/* flex-wrap : sur un ecran de 320 px, la troisieme pastille passe a la ligne au lieu de deborder. */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {MINI_LINKS.map((link, index) => (
          <motion.span
            key={link.label}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold"
            initial={false}
            animate={{ backgroundColor: index === 0 ? accent : '#f3f3f7' }}
            transition={{ duration: calm ? 0 : 0.5 }}
            style={{ color: index === 0 ? '#ffffff' : INK }}
          >
            <link.icon className="h-3.5 w-3.5" />
            {link.label}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

const EDIT_LINKS = {
  video: { label: 'Watch my latest video', icon: Play },
  podcast: { label: 'Listen to my podcast', icon: Mic },
  shop: { label: 'Shop my favorites', icon: ShoppingBag },
  newsletter: { label: 'Join my newsletter', icon: Mail },
}
type EditLinkId = keyof typeof EDIT_LINKS

const SWATCHES = ['#7c3aed', '#2563eb', '#db2777', '#059669', '#ea580c']
const ROW = 48 // hauteur d'une ligne de lien (40) + ecart (8)

// Les etats du montage d'une page : un lien arrive, prend sa place, puis la
// couleur change trois fois.
const EDIT_STEPS: { links: EditLinkId[]; swatch: number; fresh: boolean }[] = [
  { links: ['video', 'shop', 'newsletter'], swatch: 0, fresh: false },
  { links: ['podcast', 'video', 'shop', 'newsletter'], swatch: 0, fresh: true },
  { links: ['video', 'podcast', 'shop', 'newsletter'], swatch: 0, fresh: true },
  { links: ['video', 'podcast', 'shop', 'newsletter'], swatch: 1, fresh: false },
  { links: ['video', 'podcast', 'shop', 'newsletter'], swatch: 2, fresh: false },
  { links: ['video', 'podcast', 'shop', 'newsletter'], swatch: 3, fresh: false },
]

/**
 * Chapitre 1 : la page se monte sous les yeux. Le doigt touche "Add link", le
 * nouveau lien arrive, le doigt le fait glisser a la deuxieme place, puis
 * touche trois couleurs.
 */
export function EditScreen({ handle, active, example }: { handle: string; active: boolean; example: boolean }) {
  const calm = useCalm()
  const [step, setStep] = useState(0)
  const { scope, fingerRef, rippleRef, hand } = useFinger()
  const addRef = useRef<HTMLSpanElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const swatchRefs = useRef<(HTMLSpanElement | null)[]>([])

  useSequence(async (sleep, stopped) => {
    const root = scope.current as HTMLElement | null
    // La ligne d'un lien, saisie par sa poignee a gauche.
    const row = (position: number) => {
      const corner = spot(root, listRef.current, 0, 0)
      return { x: corner.x + 18, y: corner.y + position * ROW + 20 }
    }

    setStep(0)
    await sleep(700)
    while (!stopped()) {
      if (!calm) {
        const add = spot(root, addRef.current)
        await hand.place({ x: add.x + 30, y: add.y + 110 })
        hand.show()
        await hand.move(add, 0.65)
        if (stopped()) return
        await hand.tap(add)
      }
      if (stopped()) return
      setStep(1)
      await sleep(900)
      if (stopped()) return

      if (!calm) {
        await hand.move(row(0), 0.5)
        if (stopped()) return
        await hand.press()
        setStep(2)
        await hand.move(row(1), 0.5)
        await hand.release()
      } else {
        setStep(2)
      }
      await sleep(650)

      for (const swatch of [1, 2, 3]) {
        if (stopped()) return
        if (!calm) {
          const target = spot(root, swatchRefs.current[swatch])
          await hand.move(target, 0.45)
          if (stopped()) return
          await hand.tap(target)
        }
        setStep(2 + swatch)
        await sleep(850)
      }
      if (stopped()) return
      if (!calm) await hand.hide()
      await sleep(600)
      if (stopped()) return
      setStep(0)
      await sleep(1000)
    }
  }, active, [calm, hand])

  const current = EDIT_STEPS[step]
  const accent = SWATCHES[current.swatch]
  const tint = { duration: calm ? 0 : 0.5, ease: EASE }

  return (
    <div ref={scope} className="absolute inset-0 flex flex-col bg-[#ffffff]">
      <StatusBar />
      <div className="flex h-10 shrink-0 items-center justify-between px-5">
        <span className="flex items-center gap-1 text-[15px] font-bold" style={{ color: INK }}>
          <ChevronLeft className="h-4 w-4" />
          Edit page
        </span>
        <span className="rounded-full bg-[#f1f1f5] px-3 py-1 text-[12px] font-semibold" style={{ color: INK }}>Preview</span>
      </div>

      <div className="mx-5 mt-2 overflow-hidden rounded-2xl border border-[#ececf1]">
        <motion.div className="h-[52px]" initial={false} animate={{ backgroundColor: accent }} transition={tint} />
        <div className="-mt-6 flex flex-col items-center pb-3">
          <motion.div
            className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-[#ffffff] text-[16px] font-bold text-[#ffffff]"
            initial={false}
            animate={{ backgroundColor: accent }}
            transition={tint}
          >
            {initials(handle)}
          </motion.div>
          <div className="mt-1.5 text-[15px] font-bold" style={{ color: INK }}>{displayName(handle)}</div>
          <div className="text-[12px]" style={{ color: MUTED }}>taplinkr.com/{handle}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-6">
        <span className="text-[12px] font-semibold" style={{ color: MUTED }}>Links</span>
        <motion.span ref={addRef} className="flex items-center gap-1 text-[12px] font-bold" initial={false} animate={{ color: accent }} transition={tint}>
          <Plus className="h-3.5 w-3.5" />
          Add link
        </motion.span>
      </div>
      {/* Positions calculees plutot que "layout" : le telephone est reduit par
          une transformation CSS sur mobile, que les animations de mise en page
          ne savent pas compenser. */}
      <div ref={listRef} className="relative mx-5 mt-2 h-[184px]">
        <AnimatePresence initial={false}>
          {current.links.map((id, position) => {
            const link = EDIT_LINKS[id]
            const fresh = current.fresh && id === 'podcast'
            return (
              <motion.div
                key={id}
                className="absolute inset-x-0 top-0 flex h-10 items-center gap-2 rounded-xl bg-[#f5f5f8] pl-2 pr-2.5 text-[13px] font-semibold"
                style={{ color: INK, boxShadow: fresh ? `0 0 0 2px ${accent}` : '0 0 0 0 transparent' }}
                initial={{ opacity: 0, x: 28, y: position * ROW }}
                animate={{ opacity: 1, x: 0, y: position * ROW }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <GripVertical className="h-4 w-4 shrink-0 text-[#b4b4c0]" />
                <link.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{link.label}</span>
                {fresh && (
                  <span className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-[#ffffff]" style={{ backgroundColor: accent }}>
                    New
                  </span>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="mt-4 px-6">
        <div className="text-[12px] font-semibold" style={{ color: MUTED }}>Color</div>
        <div className="relative mt-2.5 flex gap-3">
          <motion.span
            className="absolute -left-1 -top-1 h-9 w-9 rounded-full border-2"
            initial={false}
            animate={{ x: current.swatch * 40, borderColor: accent }}
            transition={{ duration: calm ? 0 : 0.45, ease: EASE }}
          />
          {SWATCHES.map((color, index) => (
            <span
              key={color}
              ref={element => { swatchRefs.current[index] = element }}
              className="h-7 w-7 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto pb-5">{example && <ExampleTag />}</div>
      {!calm && <Finger fingerRef={fingerRef} rippleRef={rippleRef} />}
    </div>
  )
}

// Ce que filtre vraiment Taplinkr avant de compter un clic (lib/click-quality.ts) :
// robots, apercus de liens, doubles touchers, rafales.
const STREAM = [
  { source: 'Instagram', what: 'tap', verdict: 'counted' as const },
  { source: 'WhatsApp', what: 'link preview', verdict: 'ignored' as const },
  { source: 'TikTok', what: 'tap', verdict: 'counted' as const },
  { source: 'Crawler', what: 'bot', verdict: 'ignored' as const },
  { source: 'Instagram', what: 'tap ×2', verdict: 'once' as const },
  { source: 'YouTube', what: 'tap', verdict: 'counted' as const },
  { source: 'Messenger', what: 'link preview', verdict: 'ignored' as const },
  { source: 'X', what: 'tap', verdict: 'counted' as const },
]

const BARS = [36, 48, 41, 60, 55, 68]

/** Les vrais clics : le compteur monte, les robots et apercus sont ecartes. */
export function StatsScreen({ active }: { active: boolean }) {
  const calm = useCalm()
  const [step, setStep] = useState(4)

  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => setStep(value => value + 1), 1500)
    return () => window.clearInterval(timer)
  }, [active])

  const events = Array.from({ length: 4 }, (_, offset) => {
    const index = step - offset
    return { id: index, ...STREAM[((index % STREAM.length) + STREAM.length) % STREAM.length] }
  })
  const counted = Array.from({ length: step }, (_, index) => STREAM[index % STREAM.length]).filter(event => event.verdict !== 'ignored').length
  const total = 1180 + counted
  const lastBar = Math.min(92, 72 + (step % 12) * 1.7)

  return (
    <div className="absolute inset-0 flex flex-col bg-[#ffffff]">
      <StatusBar />
      <div className="px-6 pt-2">
        <div className="text-[13px] font-semibold" style={{ color: MUTED }}>Real clicks this week</div>
        {/* tabular-nums : des chiffres de meme largeur, le nombre ne tremble pas en montant. */}
        <div className="mt-1 flex h-[52px] items-end overflow-hidden text-[46px] font-bold leading-none tracking-[-0.04em] tabular-nums" style={{ color: INK }}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={total}
              initial={{ y: 26, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -26, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {total.toLocaleString('en-US')}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="mt-4 flex h-[84px] items-end gap-2">
          {[...BARS, lastBar].map((height, index) => (
            <motion.div
              key={index}
              className="flex-1 rounded-md"
              style={{ backgroundColor: index === BARS.length ? '#7c3aed' : '#e7e3fb' }}
              // Presentes des l'arrivee de l'ecran : seule la derniere barre bouge
              // ensuite, au rythme des vrais clics.
              initial={false}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          ))}
        </div>
      </div>
      <div className="mt-5 px-5">
        <div className="mb-2 px-1 text-[12px] font-semibold" style={{ color: MUTED }}>Incoming</div>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {events.map(event => (
              <motion.div
                key={event.id}
                layout={!calm}
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex h-[46px] items-center justify-between rounded-2xl bg-[#f5f5f8] px-3.5"
              >
                <span className={`truncate whitespace-nowrap text-[13px] font-semibold ${event.verdict === 'ignored' ? 'line-through decoration-[#b4b4c0]' : ''}`} style={{ color: event.verdict === 'ignored' ? '#9a9aa8' : INK }}>
                  {event.source} · {event.what}
                </span>
                <span
                  className="ml-2 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={
                    event.verdict === 'counted'
                      ? { backgroundColor: '#dcfce7', color: '#166534' }
                      : event.verdict === 'once'
                        ? { backgroundColor: '#ede9fe', color: '#5b21b6' }
                        : { backgroundColor: '#ececf1', color: '#6b6b7b' }
                  }
                >
                  {event.verdict === 'counted' ? '+1' : event.verdict === 'once' ? 'Counted once' : 'Ignored'}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-auto pb-5"><ExampleTag /></div>
    </div>
  )
}

// Le profil d'ou part le lien : des publications en texte, rien qui attende
// une photo. Pas de compteurs : Florent ne veut aucun chiffre qui fasse vrai.
const POSTS = [
  { text: "Friday's drop is almost ready.", when: '2h' },
  { text: 'Behind the scenes tomorrow.', when: '1d' },
  { text: 'Thank you for the love this week.', when: '3d' },
]

const CHAT = ['Hey, you made it!', "Ask me anything about Friday's drop."]

/** Le lien direct : le doigt touche le lien de la bio, la conversation s'ouvre. */
export function DirectScreen({ active }: { active: boolean }) {
  const calm = useCalm()
  const [phase, setPhase] = useState<0 | 1 | 2>(0)
  const { scope, fingerRef, rippleRef, hand } = useFinger()
  const pillRef = useRef<HTMLDivElement>(null)

  useSequence(async (sleep, stopped) => {
    const root = scope.current as HTMLElement | null
    while (!stopped()) {
      setPhase(0)
      await sleep(450)
      if (stopped()) return
      if (!calm) {
        const target = spot(root, pillRef.current)
        await hand.place({ x: target.x + 70, y: target.y + 260 })
        hand.show()
        await hand.move(target, 0.75)
        if (stopped()) return
        await sleep(120)
        setPhase(1)
        await hand.tap(target)
      } else {
        await sleep(1200)
        if (stopped()) return
        setPhase(1)
      }
      await sleep(250)
      if (stopped()) return
      if (!calm) hand.hide()
      setPhase(2)
      await sleep(3800)
    }
  }, active, [calm, hand])

  const later = (seconds: number) => ({ delay: seconds, duration: 0.35, ease: EASE })

  return (
    <div ref={scope} className="absolute inset-0 flex flex-col bg-[#ffffff]">
      <StatusBar />
      {/* Pas de initial={false} ici : framer le transmet a tout le profil de
          depart, et ce qui y apparait plus tard ne s'animait jamais. */}
      <AnimatePresence>
        {phase === 2 ? (
          // Ecran clair, comme tout le telephone : un ecran sombre laissait un
          // lisere blanc au bord arrondi, une fois le telephone reduit.
          <motion.div
            key="chat"
            className="absolute inset-0 z-10 flex flex-col bg-[#ffffff] shadow-[-16px_0_28px_-18px_rgba(11,11,18,0.35)]"
            // Animations reduites : le glissement devient instantane, le fondu reste.
            initial={{ x: '100%', opacity: calm ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="mt-[46px] flex items-center gap-2.5 border-b border-[#ececf1] px-4 pb-3">
              <ChevronLeft className="h-5 w-5 shrink-0" style={{ color: MUTED }} />
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#7c3aed] text-[14px] font-bold text-[#ffffff]">M</span>
              <div className="min-w-0">
                <div className="text-[14px] font-bold" style={{ color: INK }}>Mia</div>
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: MUTED }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                  Online
                </div>
              </div>
            </div>
            <motion.div
              className="mx-auto mt-3 rounded-full bg-[#f1ecff] px-3 py-1 text-[11px] font-semibold text-[#6d28d9]"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={later(0.35)}
            >
              Opened in one tap, no page in between
            </motion.div>
            <div className="mt-4 space-y-2 px-4">
              {CHAT.map((message, index) => (
                <motion.div
                  key={message}
                  className="w-fit max-w-[82%] rounded-2xl rounded-bl-md bg-[#f1f1f5] px-3.5 py-2.5 text-[13px] leading-snug"
                  style={{ color: INK }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={later(0.75 + index * 0.6)}
                >
                  {message}
                </motion.div>
              ))}
              <motion.div className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-[#f1f1f5] px-3.5 py-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={later(2.1)}>
                {[0, 1, 2].map(dot => (
                  <motion.span
                    key={dot}
                    className="h-1.5 w-1.5 rounded-full bg-[#9a9aa8]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: dot * 0.15 }}
                  />
                ))}
              </motion.div>
            </div>
            <div className="mx-4 mb-[52px] mt-auto flex h-11 items-center rounded-full bg-[#f5f5f8] pl-4 pr-1.5 text-[13px] text-[#9a9aa8]">
              Message…
              <span className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-[#7c3aed] text-[#ffffff]">
                <SendHorizontal className="h-4 w-4" />
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="profile" className="flex flex-1 flex-col px-5" exit={{ opacity: 0 }}>
            <div className="pt-1 text-[15px] font-bold" style={{ color: INK }}>mia</div>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#7c3aed] text-[18px] font-bold text-[#ffffff]">M</span>
              <div className="min-w-0">
                <div className="text-[15px] font-bold" style={{ color: INK }}>Mia</div>
                <div className="text-[12px] leading-snug" style={{ color: MUTED }}>Creator · new drops every week</div>
              </div>
            </div>
            <div className="mt-3 text-[13px] leading-snug" style={{ color: '#3f3f4b' }}>Questions about the drop? My chat is one tap away.</div>
            <div className="relative mt-2.5 self-start">
              <motion.div
                ref={pillRef}
                className="flex items-center gap-1.5 rounded-full bg-[#f1ecff] px-3.5 py-2 text-[13px] font-semibold text-[#6d28d9]"
                animate={{ scale: phase === 1 ? 0.95 : 1 }}
                transition={{ duration: 0.18 }}
              >
                <Link2 className="h-3.5 w-3.5" />
                taplinkr.com/mia-chat
              </motion.div>
            </div>
            <div className="mt-5 flex gap-5 border-b border-[#ececf1] text-[12px] font-semibold">
              <span className="-mb-px border-b-2 border-[#0b0b12] pb-2" style={{ color: INK }}>Posts</span>
              <span className="pb-2" style={{ color: '#9a9aa8' }}>Replies</span>
            </div>
            <div className="divide-y divide-[#f0f0f4]">
              {POSTS.map(post => (
                <div key={post.text} className="py-3">
                  <div className="truncate text-[13px] leading-snug" style={{ color: INK }}>{post.text}</div>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px]" style={{ color: '#9a9aa8' }}>
                    <span>{post.when}</span>
                    <Heart className="h-3 w-3" />
                    <MessageCircle className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-20 mt-auto pb-5"><ExampleTag /></div>
      {!calm && <Finger fingerRef={fingerRef} rippleRef={rippleRef} />}
    </div>
  )
}

const TEAM = [
  { name: 'Ana', link: 'ana-summer', clicks: 1284 },
  { name: 'Jules', link: 'jules-drop', clicks: 962 },
  { name: 'Kim', link: 'kim-promo', clicks: 701 },
]

/** L'equipe : chaque assistante a ses liens, classees par vrais clics. */
export function TeamScreen({ active }: { active: boolean }) {
  const max = TEAM[0].clicks
  return (
    <div className="absolute inset-0 flex flex-col bg-[#ffffff]">
      <StatusBar />
      <div className="px-6 pt-2">
        <div className="text-[13px] font-semibold" style={{ color: MUTED }}>Team · this week</div>
        <div className="mt-1 text-[24px] font-bold tracking-[-0.03em]" style={{ color: INK }}>Who brings real clicks</div>
      </div>
      <div className="mt-5 space-y-3 px-5">
        {TEAM.map((member, index) => (
          <div key={member.name} className="rounded-2xl bg-[#f5f5f8] p-3.5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full text-[13px] font-bold text-[#ffffff]" style={{ backgroundColor: ['#7c3aed', '#2563eb', '#db2777'][index] }}>
                {member.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[14px] font-bold" style={{ color: INK }}>
                  {member.name}
                  {index === 0 && <Crown className="h-3.5 w-3.5 text-[#d97706]" />}
                </div>
                <div className="truncate text-[12px]" style={{ color: MUTED }}>taplinkr.com/{member.link}</div>
              </div>
              <div className="text-[15px] font-bold tabular-nums" style={{ color: INK }}>{member.clicks.toLocaleString('en-US')}</div>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#e7e3fb]">
              <motion.div
                className="h-full rounded-full bg-[#7c3aed]"
                initial={{ width: '0%' }}
                animate={{ width: active ? `${(member.clicks / max) * 100}%` : '0%' }}
                transition={{ duration: 0.9, delay: 0.12 * index, ease: EASE }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mx-5 mt-4 rounded-2xl border border-[#e7e3fb] px-3.5 py-3 text-[12px] leading-snug" style={{ color: '#3f3f4b' }}>
        Each assistant sees only the links assigned to them.
      </div>
      <div className="mt-auto pb-5"><ExampleTag /></div>
    </div>
  )
}

const ORDER: PhoneScreen[] = ['page', 'edit', 'stats', 'direct', 'team']

// L'ecran suivant arrive par la droite, comme une page qu'on ouvre dans une
// appli ; en remontant la page, il revient par la gauche.
const PUSH = {
  enter: (direction: number) => ({ opacity: 0, x: 48 * direction }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: -48 * direction }),
}

/** Le telephone qui change d'ecran selon le chapitre. */
export function StoryPhone({
  screen,
  handle,
  owner,
  accent,
  typing,
  active,
  example,
}: {
  screen: PhoneScreen
  /** Le nom en train de s'ecrire (ecran "page"). */
  handle: string
  /** Le nom stable du proprietaire : celui tape, sinon le compte d'exemple. */
  owner: string
  accent: string
  typing: boolean
  active: boolean
  example: boolean
}) {
  // Le sens se decide au changement d'ecran et reste fixe jusqu'au suivant :
  // recalcule a chaque rendu, il s'inversait pendant la sortie de l'ancien.
  const [nav, setNav] = useState({ screen, direction: 1 })
  if (nav.screen !== screen) {
    setNav({ screen, direction: ORDER.indexOf(screen) > ORDER.indexOf(nav.screen) ? 1 : -1 })
  }

  return (
    <PhoneFrame glow={screen === 'page' ? accent : '#7c3aed'}>
      <AnimatePresence initial={false} mode="popLayout" custom={nav.direction}>
        <motion.div
          key={screen}
          className="absolute inset-0"
          custom={nav.direction}
          variants={PUSH}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: EASE }}
        >
          {screen === 'page' && <PageScreen handle={handle} accent={accent} typing={typing} example={example} />}
          {screen === 'edit' && <EditScreen handle={owner} active={active} example={example} />}
          {screen === 'stats' && <StatsScreen active={active} />}
          {screen === 'direct' && <DirectScreen active={active} />}
          {screen === 'team' && <TeamScreen active={active} />}
        </motion.div>
      </AnimatePresence>
    </PhoneFrame>
  )
}
