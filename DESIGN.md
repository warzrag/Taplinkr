---
name: TapLinkr
description: One link for everything a creator shares; the home page demonstrates the product in a phone that builds the visitor's page.
colors:
  violet-action: "#7c3aed"
  violet-hover: "#8b5cf6"
  violet-light: "#a78bfa"
  violet-pale: "#c4b5fd"
  logo-blue: "#60a5fa"
  night: "#09090f"
  night-panel: "#0d0d14"
  night-field: "#11111a"
  seam: "#1b1b24"
  edge: "#2a2a38"
  edge-hover: "#343444"
  text-bright: "#f7f7fb"
  text-soft: "#d6d6e0"
  text-body: "#b6b6c6"
  text-muted: "#9292a5"
  text-placeholder: "#5a5a6c"
  signal-green: "#34d399"
  signal-rose: "#fb7185"
  screen-white: "#ffffff"
  screen-ink: "#0b0b12"
  screen-ink-body: "#3f3f4b"
  screen-ink-muted: "#5f5f6e"
  screen-faint: "#9a9aa8"
  screen-fill: "#f5f5f8"
  screen-chip: "#f1f1f5"
  screen-hairline: "#ececf1"
  screen-violet-wash: "#f1ecff"
  screen-violet-bar: "#e7e3fb"
  screen-violet-deep: "#6d28d9"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "60px"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    letterSpacing: "-0.03em"
  body-lead:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
rounded:
  md: "6px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  screen: "43px"
  phone: "52px"
  full: "9999px"
spacing:
  gutter-mobile: "20px"
  gutter: "32px"
  section: "96px"
  section-wide: "128px"
  hero-container: "1200px"
  content-container: "1100px"
components:
  button-primary:
    backgroundColor: "{colors.violet-action}"
    textColor: "{colors.screen-white}"
    typography: "{typography.body}"
    rounded: "{rounded.2xl}"
    padding: "0 24px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.violet-hover}"
  button-compact:
    backgroundColor: "{colors.violet-action}"
    textColor: "{colors.screen-white}"
    rounded: "{rounded.xl}"
    padding: "0 20px"
    height: "48px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text-bright}"
    rounded: "{rounded.xl}"
    padding: "0 20px"
    height: "48px"
  field-claim:
    backgroundColor: "{colors.night-field}"
    textColor: "{colors.text-bright}"
    rounded: "{rounded.2xl}"
    padding: "0 12px 0 16px"
    height: "56px"
  chip-point:
    backgroundColor: "transparent"
    textColor: "{colors.text-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  plan-cell:
    backgroundColor: "{colors.night-panel}"
    textColor: "{colors.text-soft}"
    padding: "32px"
  phone-frame:
    backgroundColor: "{colors.seam}"
    rounded: "{rounded.phone}"
    padding: "10px"
    width: "312px"
    height: "640px"
  phone-screen:
    backgroundColor: "{colors.screen-white}"
    textColor: "{colors.screen-ink}"
    rounded: "{rounded.screen}"
---

# Design System: TapLinkr

## Overview

**Creative North Star: "The Lit Phone in a Dark Room"**

The marketing home page is a night-dark room (#09090f) with one bright object in it: a phone whose white screen builds the visitor's page while they type their name, then turns into the product's other screens as they scroll. Everything around the phone stays quiet, tonal and violet-accented, so the phone does the explaining. The page stays dark whatever the visitor's theme; `app/page.tsx` forces the `dark` class and adds `home-dark` to `<html>` for the visit so the scrollbar and overscroll background match.

Density is low on the dark side (large display type, short paragraphs, generous section padding) and realistic inside the phone (app-sized 12 to 15px type, 40 to 48px rows, status bar). The phone content is UI only: text profiles, link rows, counters, chat bubbles. No raster imagery ships on the page.

Scope: this world is established by the home page (`app/page.tsx`, `components/landing/PhoneStory.tsx`, and the `tone="home"` variant of `SiteFooter`, plus `SiteHeader`). The dashboard, auth pages and other marketing pages still use the older Tailwind theme tokens (indigo/violet `brand-*`, `--font-display` Space Grotesk) and have not been migrated. This file does not set rules for them.

**Key Characteristics:**
- A single light object (the phone) on a near-black ground; all other surfaces are dark tonal steps.
- Violet is the only action color; solid violet fills mark the one primary action in a group.
- Bricolage Grotesque, tight and heavy, for display only; the sans stack for everything else.
- Depth by hairline seams and tonal steps; the phone alone casts a real shadow, tinted by its accent.
- Every color is an explicit hex value, never a named theme class, because of global overrides in `globals.css`.
- Demo data is fictional and labeled "Example" until the visitor types.

## Colors

A cool near-black ground with a violet action voice and a white phone screen as the only bright surface.

### Primary
- **Action Violet** (violet-action): the fill of every primary button (Claim my page, Start for free, the Standard plan button), the default accent of the visitor's typed page, the live bar in the stats screen, and the selection tint (40%).
- **Hover Violet** (violet-hover): hover fill for primary buttons and the focused border of the claim field.
- **Light Violet** (violet-light): focus outlines (2px, 2px offset), check icons in chips and plan lists, the text caret in the claim field, and inline text links.
- **Pale Violet** (violet-pale): hover color of inline violet text links.

### Secondary
- **Logo Blue** (logo-blue): appears only as the end stop of the logo's violet-to-blue gradient. The direction called for blue as a second accent; the build did not use it elsewhere, and new surfaces should not promote it without a decision.

### Neutral
- **Night** (night): page ground, header (70% at rest, 90% once scrolled), footer, overscroll and scrollbar track.
- **Night Panel** (night-panel): pricing plan cells.
- **Night Field** (night-field): the claim field's fill.
- **Seam** (seam): 1px section dividers, the header's scrolled border, the pricing grid's gap lines, and the phone's bezel.
- **Edge** (edge): borders of fields, outline buttons and point chips; scrollbar thumb. **Edge Hover** (edge-hover) replaces it on hover.
- **Bright Text** (text-bright): headings and input text. **Soft Text** (text-soft): chip labels, plan names and lists, secondary links, footer column titles. **Body Text** (text-body): paragraphs under headings. **Muted Text** (text-muted): the `taplinkr.com/` prefix, reassurance lines, plan periods, footer links. **Placeholder** (text-placeholder): field placeholder only.
- **Signal Green / Signal Rose** (signal-green, signal-rose): availability check result, as icon and one line of text under the field. Never decoration.

### Phone screen palette
Inside the phone the world inverts: **Screen White** ground, **Screen Ink** for names, headings and counters, **Ink Body** for bios and notes, **Ink Muted** for handles and section labels, **Screen Faint** for timestamps, ignored events and the address line. Rows sit on **Screen Fill**, icon circles and chat bubbles on **Screen Chip**, dividers are **Screen Hairline**. Violet appears on the screen as **Violet Wash** with **Violet Deep** text (the direct-link pill and the "opened in one tap" note) and as **Violet Bar** (inactive chart bars, progress tracks).

The demo accents that cycle while nobody types (#7c3aed, #2563eb, #db2777, #059669, plus #ea580c in the edit swatches) are page-owner colors shown inside the phone, not system colors for the dark side.

### Named Rules
**The Explicit Hex Rule.** Every color on the home world is a literal hex on the element. `globals.css` gives h1-h6 and p the theme colors, and a dark-mode safety net repaints `bg-white`, `text-gray-900` and inputs; named classes silently change color here. Inputs carry `bg-transparent dark:bg-transparent` for the same reason.

**The One Light Object Rule.** The phone screen (and its mobile MiniPreview) is the only white surface in the world. The dark side never uses light cards.

**The One Violet Voice Rule.** Solid violet is reserved for the primary action and the phone's accent. Secondary actions are outlined with Edge; there is no second filled button color.

## Typography

**Display Font:** Bricolage Grotesque (next/font, weights 600/700/800, swap)
**Body Font:** the site sans stack (`--font-sans`: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif)

**Character:** a heavy, tightly tracked grotesque with some warmth for the few big statements, over a plain, neutral sans that keeps the explaining out of the way.

### Hierarchy
- **Display** (800, 60px at xl, 50px at lg, 64px at sm, 46px on mobile, line-height 0.98, -0.035em): the hero headline (two lines on desktop, three on mobile) and the closing "Your name is waiting." (44px mobile, 60px sm).
- **Headline** (700, 44px, 36px on mobile, 48px for the pricing heading at sm, line-height 1.02, -0.03em): chapter titles and section headings.
- **Title** (700, 40px, -0.03em): plan prices only.
- **Body Lead** (400, 18px, line-height 1.625, 17px on mobile chapters): the paragraph under each heading, capped around 440 to 520px wide.
- **Body** (400 or 600, 15px): field text, buttons, plan lists and lines.
- **Label** (500, 13px): point chips and the availability line; 14px for the reassurance row.

Inside the phone, type follows app scale in the sans stack: 21px bold names, 13 to 14px rows, 46px bold tabular counter, 11 to 12px meta.

### Named Rules
**The Display-Only Grotesque Rule.** Bricolage Grotesque sets headings and prices, nothing else. Buttons, fields, chips and all phone content stay in the sans.

**The Tabular Counter Rule.** Any number that counts up (click totals, team clicks) uses tabular figures so it does not jitter.

## Layout

The hero and chapters share one grid: a 1200px container with 20px gutters on mobile and 32px from sm, split at lg into `1.3fr / 1fr` with a 40px gap. The left column carries the hero (min height: viewport minus the 64px header) and four chapters of at least 80vh each; the right column holds the phone, sticky under the header and vertically centered, scaled to 0.84 below 760px of viewport height and 0.74 below 680px. The chapter whose text crosses the middle of the viewport decides the phone's screen; inactive chapters fade to 35% opacity on desktop.

Below lg the grid collapses to one column. A compact MiniPreview sits directly above the claim field (the keyboard hides the big phone), the full phone follows the hero at 0.872 scale in a 272 x 558 box, and each chapter carries its own phone underneath its text.

Pricing sits in an 1100px container, the closing call in a centered 640px column. Sections are separated by a Seam hairline and padded 96px (128px from sm). Text blocks cap at 460 to 560px.

## Elevation & Depth

The dark side is flat: depth comes from tonal steps (Night, Night Panel, Night Field) and 1px Seam or Edge lines, never from shadows on cards. Two things lift: the header gains a soft drop shadow once the page scrolls, and the phone floats on a long shadow whose upper layer takes the color of the page it shows, so the halo changes with the visitor's accent.

### Shadow Vocabulary
- **Phone halo** (`box-shadow: 0 60px 90px -40px <accent at 55%>, 0 30px 50px -25px rgba(0,0,0,0.85)`): the phone frame only; transitions over 700ms.
- **Preview halo** (`box-shadow: 0 22px 44px -26px <accent at 70%>`): the mobile MiniPreview.
- **Header lift** (`box-shadow: 0 10px 30px -12px rgba(0,0,0,0.6)`): the header once scrolled past 16px.
- **Avatar lift** (`box-shadow: 0 10px 24px -10px rgba(0,0,0,0.45)`): the avatar on the phone's page screen.

### Named Rules
**The Only the Phone Glows Rule.** Colored shadow belongs to the phone and its preview. Dark-side cards and buttons stay shadowless.

## Shapes

Soft, generous rounding throughout, scaled to object size: 52px on the phone body with a 10px bezel and 43px on its screen, 24px on the pricing grid and the MiniPreview, 16px on the claim field, primary button and phone rows, 12px on compact buttons, full pills for chips, avatars and the phone's notch. The pricing grid is one rounded block whose cells are separated by 1px gaps showing the Seam color beneath. Borders are always 1px.

## Components

### Buttons
Solid and quiet: one flat violet fill, no gradient, no shadow.
- **Shape:** 16px radius at 56px tall beside the claim field; 12px radius at 44 to 48px elsewhere.
- **Primary:** Action Violet fill, white 15px semibold text, 24px side padding, optional trailing arrow icon.
- **Hover / Focus:** fill shifts to Hover Violet; press scales to 0.99; focus is a 2px Light Violet outline offset 2px.
- **Outline:** transparent with an Edge border and Bright Text; on hover the border goes to Edge Hover over a 4% white wash.
- **Text link:** Light Violet semibold with a trailing arrow, Pale Violet on hover; Soft Text to white for in-hero links.

### Chips
- **Style:** full pill, Edge border, no fill, Soft Text at 13px medium with a Light Violet check icon. Used for the short point lists under each chapter.

### Cards / Containers
- **Corner Style:** 24px on the outer pricing block; cells are square inside it.
- **Background:** Night Panel cells over a Seam-colored gap.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Internal Padding:** 28px, 32px from sm.

### Inputs / Fields
- **Style:** the claim field is a 56px Night Field row with an Edge border and 16px radius, a Muted `taplinkr.com/` prefix, then the input in Bright Text semibold with a Light Violet caret.
- **Focus:** border turns Hover Violet with a 3px Action Violet ring at 25%; hover moves the border to Edge Hover.
- **Status:** a spinner, green check or rose cross sits at the right edge; one polite live line below reads the result in Signal Green or Signal Rose. A server failure is worded as a failure, never as "taken".

### Navigation
- **Header:** sticky, 64px, blurred Night at 70%, becoming 90% with a Seam border and header lift after 16px of scroll. Links 14px medium in white at 70%, full white on hover or when current. The single primary is a compact violet button ("Start for free").
- **Mobile:** a 40px round toggle with a 20% white border opens a Night panel below the header.
- **Footer (home tone):** Night ground, Seam top border, Muted links brightening to Bright Text, Soft Text column titles.

### The Story Phone (signature)
A 312 x 640 phone with a Seam bezel, white screen and a Screen Ink notch pill, showing five screens: the visitor's page (built from the typed name, accent-colored header, avatar with initials, four link rows), edit (links arriving and swatches changing), stats (a real-clicks counter with a stream of counted and ignored events), direct (a text profile whose link pill is tapped, then a chat), and team (members ranked by clicks with progress bars). Screens push in from the right (48px, fade) and return from the left when scrolling up.
- Every fictional screen carries the **Example label**: 10px semibold uppercase, 0.14em tracking, #a1a1ae, centered at the bottom. It switches to "Preview" in the MiniPreview once the visitor types. This is the only uppercase tracked text in the world.
- The caret blinks through the CSS `phone-caret` keyframe (1s, step-end), not through framer-motion.
- Motion eases on `cubic-bezier(0.16, 1, 0.3, 1)`, 0.35 to 0.6s; color tints take 0.5s.

**The Calm Hydration Rule.** Motion honors reduced-motion through `MotionConfig reducedMotion="user"` plus `useCalm`, which is false on the first render and only reads the preference after mount, so the client's first render always matches the server's. When calm, every screen settles on one complete still state (a written name, a fixed edit step, the open chat, full bars).

**The Honest Example Rule.** No real figures appear on the home page. Every name, count and chat in the phone is fictional and labeled Example until the visitor types their own name; only what the visitor typed is shown as theirs.

## Do's and Don'ts

### Do:
- **Do** write every color as an explicit hex on the element (The Explicit Hex Rule), and give inputs `bg-transparent dark:bg-transparent`.
- **Do** keep the phone the only white surface on the dark ground (The One Light Object Rule).
- **Do** reserve solid Action Violet for the single primary action per group; secondary actions are Edge-outlined.
- **Do** use a 2px Light Violet outline with 2px offset as the focus state on every interactive element.
- **Do** label fictional demo content "Example" and keep it fictional (The Honest Example Rule).
- **Do** gate motion with `MotionConfig reducedMotion="user"` and `useCalm`, and give each animated screen a complete still state.
- **Do** write site copy in English.

### Don't:
- **Don't** use named theme classes (`bg-white`, `text-gray-900`, `text-foreground`) on this world; the dark-mode safety net repaints them.
- **Don't** put h1-h6 or p tags inside the phone; globals.css paints them with theme colors and made white-on-white text before.
- **Don't** show real figures, testimonials or customer counts on the home page.
- **Don't** read the reduced-motion preference during the first render.
- **Don't** add shadows to dark-side cards or buttons (The Only the Phone Glows Rule).
- **Don't** use Bricolage Grotesque for buttons, fields, chips or phone content.
