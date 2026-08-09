/**
 * Palette du dashboard, en valeurs brutes.
 *
 * A n'utiliser QUE la ou une classe Tailwind est impossible : props SVG,
 * options de Recharts, canvas. Partout ailleurs, utiliser les classes
 * `dash-*` definies dans tailwind.config.js (bg-dash-raised, text-dash-text5...).
 *
 * Ces valeurs doivent rester identiques a celles de tailwind.config.js.
 */
export const dashColors = {
  bg: '#09090f',
  surface: '#0c0c14',
  raised: '#11111a',
  overlay: '#151520',
  input: '#242431',
  line: '#22222d',
  line2: '#2a2a38',
  line3: '#343444',
  off: '#505060',
  text: '#f7f7fb',
  text2: '#d6d6e0',
  text3: '#b6b6c6',
  text4: '#9292a5',
  text5: '#858598',
  text6: '#77778a',
} as const

/** Couleurs des graphiques : grille, axes, et accent actif. */
export const chartColors = {
  grid: dashColors.input,
  axis: dashColors.text6,
  axisLabel: dashColors.text5,
  accent: '#a78bfa',
  accentSoft: '#c4b5fd',
} as const
