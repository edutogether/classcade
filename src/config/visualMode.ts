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
 * Resolution order (first match wins):
 *   1. ?visual= URL parameter  - instant, no rebuild, per session. For checking a new
 *      page's art before committing to it.
 *   2. localStorage            - sticky on this device. For a booth laptop that should
 *      stay in one mode across refreshes.
 *   3. DEFAULTS below          - what ships.
 *
 * URL forms:
 *   ?visual=art                    every screen to art
 *   ?visual=flat                   every screen to flat
 *   ?visual=prep1:art              one screen only
 *   ?visual=prep1:art,prep2:art    several screens
 *   ?visual=reset                  clear the stored override
 */

export type VisualScreen =
  | 'prep1' | 'prep2' | 'prep3' | 'prep4' | 'nickname'
  | 'gameConditions' | 'gameCandidates' | 'gameComplete'

export type VisualMode = 'flat' | 'art'

/** What ships. Flip a screen to 'art' once that screen's artwork is finished and checked. */
const DEFAULTS: Record<VisualScreen, VisualMode> = {
  prep1: 'flat',
  prep2: 'flat',
  prep3: 'flat',
  prep4: 'flat',
  nickname: 'flat',
  gameConditions: 'flat',
  gameCandidates: 'flat',
  gameComplete: 'flat',
}

const STORAGE_KEY = 'classcade.visual-mode.v1'
const SCREENS = Object.keys(DEFAULTS) as VisualScreen[]

function isMode(value: string): value is VisualMode {
  return value === 'flat' || value === 'art'
}

function isScreen(value: string): value is VisualScreen {
  return (SCREENS as string[]).includes(value)
}

/** "art" | "flat" | "prep1:art,prep2:flat" -> partial override map. */
function parse(spec: string): Partial<Record<VisualScreen, VisualMode>> {
  const trimmed = spec.trim()
  if (!trimmed) return {}
  if (isMode(trimmed)) return Object.fromEntries(SCREENS.map((screen) => [screen, trimmed]))
  const overrides: Partial<Record<VisualScreen, VisualMode>> = {}
  for (const entry of trimmed.split(',')) {
    const [screen, mode] = entry.split(':').map((part) => part.trim())
    if (screen && mode && isScreen(screen) && isMode(mode)) overrides[screen] = mode
  }
  return overrides
}

/** Read once per load: the mode must not change midway through a render pass. */
const overrides: Partial<Record<VisualScreen, VisualMode>> = (() => {
  if (typeof window === 'undefined') return {}
  try {
    const spec = new URLSearchParams(window.location.search).get('visual')
    if (spec === 'reset') { localStorage.removeItem(STORAGE_KEY); return {} }
    if (spec) {
      const parsed = parse(spec)
      // A URL override sticks so it survives the refreshes a real run goes through.
      if (Object.keys(parsed).length) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      return parsed
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? parse(Object.entries(JSON.parse(stored) as Record<string, string>).map(([s, m]) => `${s}:${m}`).join(',')) : {}
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

/** Current resolved state, for the visual tuner and for debugging in the field. */
export function visualModeSnapshot() {
  return Object.fromEntries(SCREENS.map((screen) => [screen, visualMode(screen)])) as Record<VisualScreen, VisualMode>
}
