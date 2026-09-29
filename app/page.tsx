'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bricolage_Grotesque } from 'next/font/google'
import { debounce } from 'lodash'
import { MotionConfig, motion, useInView } from 'framer-motion'
import { ArrowDown, ArrowRight, Check, Loader2, X } from 'lucide-react'

import { SiteFooter } from '@/components/marketing/SiteFooter'
import { SiteHeader } from '@/components/marketing/SiteHeader'
import { DEMO_OWNER, LivePhone, MiniPreview, PageScreen, PhoneFrame, StoryPhone, useDemoName } from '@/components/landing/PhoneStory'
import type { PhoneScreen } from '@/components/landing/PhoneStory'
import { Reveal, RevealGroup, RevealTitle, revealItem } from '@/components/landing/Reveal'

/**
 * Page d'accueil : "le telephone qui raconte".
 *
 * Le produit se montre lui-meme au lieu d'envoyer le visiteur sur une page de
 * demo (Florent : "quand on clique, ca emmene sur une page, on ne comprend
 * rien"). Le visiteur tape son nom, sa page se construit dans le telephone ;
 * en descendant, le meme telephone montre les vrais clics, le lien direct,
 * puis l'equipe.
 *
 * Le mouvement (Florent, 29 sept. : "le site manque de belle animation") :
 * le titre monte mot par mot et le telephone se pose (CSS, globals.css, avant
 * meme le JavaScript) ; sur ordinateur, le telephone suit la souris ; un doigt
 * fait la demo dans le telephone ; les chapitres, les offres et la fin
 * apparaissent en montant (components/landing/Reveal.tsx).
 *
 * La page reste sombre quel que soit le theme du visiteur (classe `dark` sur
 * l'enveloppe). Chaque titre et paragraphe porte sa propre couleur :
 * globals.css impose aux h1-h6 et aux p la couleur du theme.
 */

// Les variables CSS (--i, --d) des animations d'entree de globals.css.
const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties

const HERO_LINES = [['One', 'link', 'for'], ['everything', 'you', 'share.']]

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['600', '700', '800'], display: 'swap' })

const CHAPTERS: { screen: PhoneScreen; title: string; text: string; points: string[] }[] = [
  {
    screen: 'edit',
    title: 'Your page, in a minute.',
    text: 'Add your links, pick your colors, and your page is live at taplinkr.com/yourname. Change anything, anytime.',
    points: ['Any link, any order', 'Your colors, your photo', 'Made for phones'],
  },
  {
    screen: 'stats',
    title: 'Only real people count.',
    text: 'Bots, link previews and double taps are filtered out before they reach your numbers. What you see is how many people really tapped.',
    points: ['Bots ignored', 'Link previews ignored', 'Double taps counted once'],
  },
  {
    screen: 'direct',
    title: 'One tap, straight there.',
    text: 'Direct links skip the menu and open your destination right away: your chat, your shop, your latest video.',
    points: ['A short address to share', 'No page in between'],
  },
  {
    screen: 'team',
    title: 'Built for teams too.',
    text: 'Managers and agencies give each assistant their own links, and see who brings the most real clicks.',
    points: ['Links assigned per person', 'Ranked by real clicks'],
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '€0',
    period: '',
    line: 'For your first page.',
    points: ['1 page with up to 5 links', 'Real-click stats', 'Themes and animations'],
    cta: 'Start free',
    primary: false,
  },
  {
    name: 'Standard',
    price: '€9.99',
    period: '/month',
    line: 'For creators who grow.',
    points: ['Unlimited pages and links', 'One-tap direct links', 'Countries and devices', 'Teams of up to 10'],
    cta: 'Start with Standard',
    primary: true,
  },
  {
    name: 'Premium',
    price: '€24.99',
    period: '/month',
    line: 'For a page that stands out.',
    points: ['Everything in Standard', 'Premium fonts, colors and themes', 'Custom icons and tap animations'],
    cta: 'Go Premium',
    primary: false,
  },
]

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'error'

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const update = () => setDesktop(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return desktop
}

function ClaimForm({
  username,
  status,
  message,
  onChange,
  onFocusChange,
  onSubmit,
}: {
  username: string
  status: Availability
  message: string
  onChange: (value: string) => void
  onFocusChange: (focused: boolean) => void
  onSubmit: () => void
}) {
  const id = useId()
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit()
  }
  return (
    <form onSubmit={submit} noValidate className="w-full">
      <label htmlFor={id} className="sr-only">Choose your Taplinkr address</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-14 min-w-0 flex-1 items-center rounded-2xl border border-[#2a2a38] bg-[#11111a] pl-4 pr-3 transition-[border-color,box-shadow] duration-200 focus-within:border-[#8b5cf6] focus-within:ring-[3px] focus-within:ring-[#7c3aed]/25 hover:border-[#343444]">
          <span className="shrink-0 text-[15px] text-[#9292a5]">taplinkr.com/</span>
          {/* dark:bg-transparent : sans lui, globals.css repeint ce champ en mode sombre. */}
          <input
            id={id}
            value={username}
            onChange={event => onChange(event.target.value)}
            onFocus={() => onFocusChange(true)}
            onBlur={() => onFocusChange(false)}
            placeholder="yourname"
            maxLength={30}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-describedby={`${id}-status`}
            className="dash-field min-w-0 flex-1 bg-transparent py-3 text-[15px] font-semibold text-[#f7f7fb] caret-[#a78bfa] outline-none placeholder:text-[#5a5a6c] focus-visible:outline-none dark:bg-transparent"
          />
          <span className="grid h-6 w-6 shrink-0 place-items-center" aria-hidden>
            {status === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-[#9292a5]" />}
            {status === 'available' && <Check className="h-4 w-4 text-[#34d399]" />}
            {status === 'taken' && <X className="h-4 w-4 text-[#fb7185]" />}
          </span>
        </div>
        <button
          type="submit"
          className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#7c3aed] px-6 text-[15px] font-semibold text-[#ffffff] transition hover:bg-[#8b5cf6] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]"
        >
          Claim my page
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div id={`${id}-status`} aria-live="polite" className="mt-2.5 min-h-5 text-[13px]">
        {status === 'available' && <span className="text-[#34d399]">taplinkr.com/{username} is yours to claim.</span>}
        {(status === 'taken' || status === 'error') && <span className="text-[#fb7185]">{message}</span>}
      </div>
    </form>
  )
}

/**
 * Un telephone de chapitre, pour les ecrans ou il n'est pas epingle (mobile).
 * Il monte en arrivant, puis flotte ; chaque telephone flotte a son rythme.
 */
function ChapterPhone({ screen, handle, owner, accent, example, index }: { screen: PhoneScreen; handle: string; owner: string; accent: string; example: boolean; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.5 })
  return (
    <Reveal y={48}>
      <div ref={ref} className="mx-auto h-[558px] w-[272px]" aria-hidden>
        <div className="home-float" style={{ animationDelay: `${-1.6 * (index + 1)}s` }}>
          <div className="origin-top-left scale-[0.872]">
            <StoryPhone screen={screen} handle={handle} owner={owner} accent={accent} typing={false} active={inView} example={example} />
          </div>
        </div>
      </div>
    </Reveal>
  )
}

export default function Home() {
  const { status: sessionStatus } = useSession()
  const router = useRouter()
  const isDesktop = useIsDesktop()

  const [username, setUsername] = useState('')
  const [focused, setFocused] = useState(false)
  const [availability, setAvailability] = useState<Availability>('idle')
  const [message, setMessage] = useState('')
  const [chapter, setChapter] = useState(-1)
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([])
  const heroRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLElement>(null)
  // Rien ne tourne hors de l'ecran : le nom qui s'ecrit refait le rendu de
  // toute la page a chaque lettre, et les demonstrations du telephone bouclent.
  const heroInView = useInView(heroRef, { amount: 0.15 })
  const storyInView = useInView(storyRef, { amount: 0.05 })

  useEffect(() => {
    if (sessionStatus === 'authenticated') router.push('/dashboard')
  }, [sessionStatus, router])

  // La page reste sombre meme chez un visiteur en theme clair. C'est le body
  // qui defile (html et body a 100 % de haut) : sa barre de defilement et le
  // fond que devoile l'elastique du defilement suivent cette classe (globals.css).
  useEffect(() => {
    document.documentElement.classList.add('home-dark')
    return () => document.documentElement.classList.remove('home-dark')
  }, [])

  const userTyped = username.length > 0
  const demo = useDemoName(!userTyped && !focused && heroInView)
  const handle = userTyped ? username : demo.name
  const owner = userTyped ? username : DEMO_OWNER
  const accent = userTyped ? '#7c3aed' : demo.accent

  const checkUsername = useMemo(() => debounce(async (value: string) => {
    if (value.length < 3) {
      setAvailability('idle')
      return
    }
    setAvailability('checking')
    try {
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`)
      // Une panne du serveur n'est pas un nom pris : sans ce test, le visiteur
      // lisait "Server error" a cote d'une croix rouge, comme un refus.
      if (!response.ok) throw new Error('check failed')
      const data = await response.json()
      if (data.available) {
        setAvailability('available')
      } else {
        setAvailability('taken')
        setMessage(data.error || 'Already taken. Try another name.')
      }
    } catch {
      setAvailability('error')
      setMessage('We could not check this name right now.')
    }
  }, 400), [])

  useEffect(() => () => checkUsername.cancel(), [checkUsername])

  const onUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_.-]/g, '')
    setUsername(sanitized)
    setAvailability(sanitized.length >= 3 ? 'checking' : 'idle')
    if (sanitized) checkUsername(sanitized)
  }

  const claim = () => {
    router.push(availability === 'available' && username ? `/auth/signup?username=${encodeURIComponent(username)}` : '/auth/signup')
  }

  // Le chapitre dont le texte passe au milieu de l'ecran decide de ce que
  // montre le telephone epingle.
  useEffect(() => {
    if (!isDesktop) return
    const elements = [heroRef.current, ...chapterRefs.current].filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setChapter(Number((entry.target as HTMLElement).dataset.chapter))
      })
    }, { rootMargin: '-50% 0px -50% 0px' })
    elements.forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [isDesktop])

  if (sessionStatus === 'authenticated') return null

  const screen: PhoneScreen = chapter < 0 ? 'page' : CHAPTERS[chapter].screen
  const claimProps = {
    username,
    status: availability,
    message,
    onChange: onUsernameChange,
    onFocusChange: setFocused,
    onSubmit: claim,
  }

  return (
    // reducedMotion "user" : chez un visiteur qui a demande moins d'animations,
    // framer-motion renonce aux deplacements et ne garde que les fondus.
    <MotionConfig reducedMotion="user">
      <div className="dark min-h-screen overflow-x-clip bg-[#09090f] text-[#f7f7fb] selection:bg-[#7c3aed]/40">
        <SiteHeader />
        <main>
          {/* 1.3fr : le titre tient sur deux lignes a cote du telephone (mesure :
              "everything you share." fait 602 px en 60 px, la colonne 619 px). */}
          <section ref={storyRef} className="mx-auto grid max-w-[1200px] px-5 sm:px-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-10">
            <div>
              <div ref={heroRef} data-chapter={-1} className="flex min-h-[calc(100svh-4rem)] flex-col justify-center pb-16 pt-10 sm:py-16 lg:py-10">
                {/* Les mots montent un par un (home-word, globals.css). */}
                <h1 className={`${display.className} max-w-[560px] text-[46px] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#f7f7fb] sm:max-w-[700px] sm:text-[64px] lg:max-w-none lg:text-[50px] xl:text-[60px]`}>
                  {HERO_LINES[0].map((word, index) => (
                    <span key={word}>
                      <span className="home-word" style={cssVars({ '--i': index })}>{word}</span>{' '}
                    </span>
                  ))}
                  <br className="hidden lg:inline" />
                  {HERO_LINES[1].map((word, index) => (
                    <span key={word}>
                      <span className="home-word" style={cssVars({ '--i': index + 3 })}>{word}</span>
                      {index < HERO_LINES[1].length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </h1>
                <p className="home-rise mt-5 max-w-[480px] text-[18px] leading-relaxed text-[#b6b6c6] sm:mt-6" style={cssVars({ '--d': '420ms' })}>
                  Type your name and watch your page come to life. Share it in your bio, and see how many real people tap it.
                </p>
                {/* Sur mobile, le grand telephone est sous le pli et le clavier le
                    cache : cet apercu colle au champ montre la page qui nait. */}
                <div className="home-rise mt-7 max-w-[520px] lg:hidden" style={cssVars({ '--d': '520ms' })} aria-hidden>
                  <MiniPreview handle={handle} accent={accent} typing={!userTyped || focused} example={!userTyped} />
                </div>
                <div className="home-rise mt-3 max-w-[520px] lg:mt-9" style={cssVars({ '--d': '600ms' })}>
                  <ClaimForm {...claimProps} />
                </div>
                <div className="home-rise mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-[#9292a5]" style={cssVars({ '--d': '700ms' })}>
                  <span>Free to start. No credit card.</span>
                  <a href="#how" className="inline-flex items-center gap-1.5 rounded-md font-semibold text-[#d6d6e0] transition hover:text-[#ffffff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]">
                    See how it works
                    <ArrowDown className="h-4 w-4" />
                  </a>
                </div>

                <Reveal className="mt-12 lg:hidden" y={48}>
                  <div className="mx-auto h-[558px] w-[272px]" aria-hidden>
                    <div className="home-float">
                      <div className="origin-top-left scale-[0.872]">
                        <PhoneFrame glow={accent}>
                          <PageScreen handle={handle} accent={accent} typing={!userTyped || focused} example={!userTyped} />
                        </PhoneFrame>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* lg:pb : le telephone epingle reste en place tant que la colonne continue.
                  Sans cette marge, il remontait des le dernier chapitre et passait sous l'en-tete. */}
              <div id="how" className="scroll-mt-16 lg:pb-[18vh]">
                {CHAPTERS.map((item, index) => (
                  <div
                    key={item.title}
                    ref={element => { chapterRefs.current[index] = element }}
                    data-chapter={index}
                    className="flex min-h-[80vh] flex-col justify-center py-16 lg:py-0"
                  >
                    <div className={`max-w-[460px] transition-opacity duration-500 motion-reduce:transition-none ${isDesktop && chapter !== index ? 'opacity-35' : 'opacity-100'}`}>
                      <RevealTitle
                        text={item.title}
                        className={`${display.className} text-[36px] font-bold leading-[1.02] tracking-[-0.03em] text-[#f7f7fb] sm:text-[44px]`}
                      />
                      <Reveal delay={0.15} y={16}>
                        <p className="mt-4 text-[17px] leading-relaxed text-[#b6b6c6] sm:text-[18px]">{item.text}</p>
                      </Reveal>
                      <RevealGroup as="ul" className="mt-6 flex flex-wrap gap-2" delay={0.3}>
                        {item.points.map(point => (
                          <motion.li key={point} variants={revealItem} className="inline-flex items-center gap-1.5 rounded-full border border-[#2a2a38] px-3 py-1.5 text-[13px] font-medium text-[#d6d6e0]">
                            <Check className="h-3.5 w-3.5 text-[#a78bfa]" />
                            {point}
                          </motion.li>
                        ))}
                      </RevealGroup>
                    </div>
                    <div className="mt-12 lg:hidden">
                      <ChapterPhone screen={item.screen} handle={handle} owner={owner} accent={accent} example={!userTyped} index={index} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block" aria-hidden>
              <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center justify-center">
                {/* Trois couches, une par mouvement : l'arrivee (CSS, home-phone),
                    l'inclinaison vers la souris (LivePhone) et le flottement
                    (home-float). Sur une seule, les transformations s'ecraseraient. */}
                <div className="origin-center [perspective:1400px] [@media(max-height:760px)]:scale-[0.84] [@media(max-height:680px)]:scale-[0.74]">
                  <div className="home-phone" style={cssVars({ '--d': '380ms' })}>
                    <LivePhone>
                      <div className="home-float">
                        <StoryPhone
                          screen={screen}
                          handle={handle}
                          owner={owner}
                          accent={accent}
                          typing={screen === 'page' && (!userTyped || focused)}
                          active={isDesktop && storyInView}
                          example={!userTyped}
                        />
                      </div>
                    </LivePhone>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="pricing" className="scroll-mt-16 border-t border-[#1b1b24] py-24 sm:py-32">
            <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
              <RevealTitle
                text="Start free. Grow when you are ready."
                className={`${display.className} max-w-[640px] text-[36px] font-bold leading-[1.02] tracking-[-0.03em] text-[#f7f7fb] sm:text-[48px]`}
              />
              <Reveal delay={0.12} y={16}>
                <p className="mt-4 max-w-[520px] text-[17px] leading-relaxed text-[#b6b6c6]">No credit card to start. Change or cancel your plan anytime.</p>
              </Reveal>
              {/* Le bloc monte d'un seul tenant, puis le contenu des trois offres
                  arrive l'une apres l'autre : les cellules gardent leur fond, le
                  gris des separations n'apparait jamais seul. */}
              <RevealGroup className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-[#1b1b24] bg-[#1b1b24] md:grid-cols-3" lift={32} delay={0.2} stagger={0.12}>
                {PLANS.map(plan => (
                  <div key={plan.name} className="flex flex-col bg-[#0d0d14] p-7 sm:p-8">
                    <motion.div variants={revealItem} className="flex flex-1 flex-col">
                      <div className="text-[15px] font-semibold text-[#d6d6e0]">{plan.name}</div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className={`${display.className} text-[40px] font-bold tracking-[-0.03em] text-[#f7f7fb]`}>{plan.price}</span>
                        {plan.period && <span className="text-[15px] text-[#9292a5]">{plan.period}</span>}
                      </div>
                      <div className="mt-1 text-[15px] text-[#9292a5]">{plan.line}</div>
                      <ul className="mt-6 space-y-3">
                        {plan.points.map(point => (
                          <li key={point} className="flex items-start gap-2.5 text-[15px] text-[#d6d6e0]">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#a78bfa]" />
                            {point}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/auth/signup"
                        className={`mt-8 inline-flex h-12 items-center justify-center rounded-xl px-5 text-[15px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa] ${plan.primary ? 'bg-[#7c3aed] text-[#ffffff] hover:bg-[#8b5cf6]' : 'border border-[#2a2a38] text-[#f7f7fb] hover:border-[#343444] hover:bg-[#ffffff]/[0.04]'}`}
                      >
                        {plan.cta}
                      </Link>
                    </motion.div>
                  </div>
                ))}
              </RevealGroup>
              <Reveal delay={0.2} y={12}>
                <Link href="/pricing" className="mt-6 inline-flex items-center gap-1.5 rounded-md text-[15px] font-semibold text-[#a78bfa] transition hover:text-[#c4b5fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]">
                  Compare every feature
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>
            </div>
          </section>

          <section className="border-t border-[#1b1b24] py-24 sm:py-32">
            <div className="mx-auto max-w-[640px] px-5 text-center sm:px-8">
              <RevealTitle
                text="Your name is waiting."
                className={`${display.className} text-[44px] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#f7f7fb] sm:text-[60px]`}
              />
              <Reveal delay={0.15} y={16}>
                <p className="mx-auto mt-5 max-w-[440px] text-[18px] leading-relaxed text-[#b6b6c6]">
                  Claim taplinkr.com/{username || 'yourname'} and share your page today.
                </p>
              </Reveal>
              <Reveal delay={0.25} y={20} className="mx-auto mt-9 max-w-[560px] text-left">
                <ClaimForm {...claimProps} />
              </Reveal>
            </div>
          </section>
        </main>
        <SiteFooter tone="home" />
      </div>
    </MotionConfig>
  )
}
