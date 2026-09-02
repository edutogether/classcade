/**
 * Per-screen art/flat switch.
 *
 * 'art'  - the tuned master-art composition (background image + positioned controls)
 * 'flat' - CSS-drawn controls on the shared background; cannot break when art is
 *          missing, and cannot drift out of position at an unexpected aspect ratio.
 *
 * Deliberately PER SCREEN, not one global flag: finished art arrives one page at a
 * time, and a single switch would force every page to art the moment the first one
 * is ready - flipping screens whose art does not exist yet into a broken state.
 *
 * There is exactly one runtime switch, kept deliberately small so there is nothing to
 * remember or mistype in front of a room:
 *
 *   ?art    every screen to art
 *   ?flat   back to the shipped defaults
 *
 * The choice is stored, so it survives both refreshes and the history.replaceState the
 * pairing flow performs (which would otherwise strip the parameter mid-run).
 *
 * Per-screen control still exists - it lives in DEFAULTS below, which is the right place
 * for it: art lands one page at a time, and each page is switched on for good once its
 * artwork is finished, not toggled ad hoc from a URL.
 */

export type VisualScreen = 'prep1' | 'prep2' | 'prep3' | 'prep4' | 'nickname'

export type VisualMode = 'flat' | 'art'

/** What ships. Flip a screen to 'art' once that screen's artwork is finished and checked. */
const DEFAULTS: Record<VisualScreen, VisualMode> = {
  prep1: 'flat',
  prep2: 'flat',
  prep3: 'flat',
  prep4: 'flat',
  nickname: 'flat',
}

const STORAGE_KEY = 'classcade.visual-mode.v1'
const SCREENS = Object.keys(DEFAULTS) as VisualScreen[]

const allScreens = (mode: VisualMode) =>
  Object.fromEntries(SCREENS.map((screen) => [screen, mode])) as Record<VisualScreen, VisualMode>

/** Read once per load: the mode must not change midway through a render pass. */
const overrides: Partial<Record<VisualScreen, VisualMode>> = (() => {
  if (typeof window === 'undefined') return {}
  try {
    // Bare flag, so `?art` works with or without a value (`?art=1` too).
    if (new URLSearchParams(window.location.search).has('art')) {
      // sessionStorage, not localStorage, on purpose: the preview must survive the
      // pairing flow's history.replaceState (which strips the query mid-run) and page
      // refreshes, but must NOT outlive the tab. A flag left over from last night must
      // never be able to serve unfinished art to a participant at the booth.
      sessionStorage.setItem(STORAGE_KEY, 'art')
      return allScreens('art')
    }
    return sessionStorage.getItem(STORAGE_KEY) ? allScreens('art') : {}
  } catch {
    // A malformed override must never take the app down - fall back to what ships.
    return {}
  }
})()

/** Screens whose art failed to load this session; they render flat for the rest of it. */
const degraded = new Set<VisualScreen>()

export function visualMode(screen: VisualScreen): VisualMode {
  if (degraded.has(screen)) return 'flat'
  return overrides[screen] ?? DEFAULTS[screen]
}

export function isArt(screen: VisualScreen) { return visualMode(screen) === 'art' }
export function isFlat(screen: VisualScreen) { return visualMode(screen) === 'flat' }

/**
 * Called when a screen's master art fails to load. Art mode positions controls against
 * that image, so without it the screen is unusable - dropping to flat keeps the booth
 * running instead of showing an empty frame.
 */
export function degradeToFlat(screen: VisualScreen) {
  if (degraded.has(screen)) return
  degraded.add(screen)
  console.warn(`[visualMode] ${screen}: 아트 이미지를 불러오지 못해 기본(flat) 화면으로 전환합니다.`)
  window.dispatchEvent(new CustomEvent('classcade:visual-degraded', { detail: { screen } }))
}

/** Current resolved state, for debugging in the field. */
export function visualModeSnapshot() {
  return Object.fromEntries(SCREENS.map((screen) => [screen, visualMode(screen)])) as Record<VisualScreen, VisualMode>
}
