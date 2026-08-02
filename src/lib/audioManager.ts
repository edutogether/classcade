import { AUDIO_MANIFEST, BGM_MANIFEST, type AudioCue } from '../data/audioManifest'
import type { AudioSettings } from './audioController'

const cuePlayers = new Map<AudioCue, HTMLAudioElement>()
const MAIN_THEME_VOLUME = .28
const INITIAL_START_DELAY_MS = 450
const INITIAL_FADE_MS = 2200
const TOGGLE_ON_FADE_MS = 800
const TOGGLE_OFF_FADE_MS = 300
const RESULT_FADE_MS = 600

let mainThemePlayer: HTMLAudioElement | null = null
let mainThemeFadeFrame: number | null = null
let mainThemeStartTimer: number | null = null
let mainThemeState: 'idle' | 'starting' | 'playing' | 'stopping' = 'idle'
let hasAudioUserGesture = false
let hasStartedMainTheme = false

function playerForCue(cue: AudioCue) {
  const source = AUDIO_MANIFEST[cue]
  if (!source || typeof Audio === 'undefined') return null
  const existing = cuePlayers.get(cue)
  if (existing?.src === new URL(source, window.location.href).href) return existing
  try {
    const player = new Audio(source)
    player.preload = 'auto'
    player.volume = .45
    cuePlayers.set(cue, player)
    return player
  } catch {
    return null
  }
}

function playerForMainTheme() {
  if (typeof document === 'undefined') return null
  if (mainThemePlayer) return mainThemePlayer
  try {
    const player = document.createElement('audio')
    const sources = BGM_MANIFEST.mainTheme
    const ogg = document.createElement('source')
    const mp3 = document.createElement('source')
    ogg.src = sources.ogg
    ogg.type = 'audio/ogg'
    mp3.src = sources.mp3
    mp3.type = 'audio/mpeg'
    player.append(ogg, mp3)
    player.loop = true
    player.preload = 'auto'
    player.volume = 0
    mainThemePlayer = player
    return player
  } catch {
    return null
  }
}

function cancelMainThemeTransition() {
  if (mainThemeFadeFrame !== null) window.cancelAnimationFrame(mainThemeFadeFrame)
  if (mainThemeStartTimer !== null) window.clearTimeout(mainThemeStartTimer)
  mainThemeFadeFrame = null
  mainThemeStartTimer = null
}

function fadeMainThemeTo(player: HTMLAudioElement, target: number, duration: number, onComplete?: () => void) {
  if (mainThemeFadeFrame !== null) window.cancelAnimationFrame(mainThemeFadeFrame)
  const start = player.volume
  const startedAt = performance.now()
  const tick = (now: number) => {
    const progress = Math.max(0, Math.min(1, (now - startedAt) / duration))
    player.volume = start + (target - start) * progress
    if (progress < 1) {
      mainThemeFadeFrame = window.requestAnimationFrame(tick)
      return
    }
    mainThemeFadeFrame = null
    onComplete?.()
  }
  mainThemeFadeFrame = window.requestAnimationFrame(tick)
}

function startMainTheme(delay: number, fadeDuration: number) {
  const player = playerForMainTheme()
  if (!player) return
  cancelMainThemeTransition()
  mainThemeState = 'starting'
  const begin = () => {
    mainThemeStartTimer = null
    if (mainThemeState !== 'starting') return
    player.volume = 0
    try {
      void player.play().then(() => {
        if (mainThemeState !== 'starting') {
          player.pause()
          return
        }
        hasStartedMainTheme = true
        fadeMainThemeTo(player, MAIN_THEME_VOLUME, fadeDuration, () => {
          if (mainThemeState === 'starting') mainThemeState = 'playing'
        })
      }).catch(() => {
        if (mainThemeState === 'starting') mainThemeState = 'idle'
      })
    } catch {
      mainThemeState = 'idle'
    }
  }
  mainThemeStartTimer = window.setTimeout(begin, delay)
}

function stopMainTheme(fadeDuration: number) {
  const player = playerForMainTheme()
  if (!player || mainThemeState === 'idle') return
  cancelMainThemeTransition()
  mainThemeState = 'stopping'
  fadeMainThemeTo(player, 0, fadeDuration, () => {
    player.pause()
    mainThemeState = 'idle'
  })
}

/** Creates one reusable player and starts loading after the application has rendered. */
export function preloadMainTheme() {
  if (typeof window === 'undefined') return
  const player = playerForMainTheme()
  if (!player) return
  window.setTimeout(() => player.load(), 0)
}

/** A user action is required before any audible BGM playback is attempted. */
export function noteAudioUserGesture() {
  hasAudioUserGesture = true
}

/** Keeps the same native loop alive through the start/question transition. */
export function syncMainTheme(enabled: boolean, stage: string) {
  const shouldPlay = enabled && (stage === 'nbti_start' || stage === 'nbti_question')
  if (!shouldPlay) {
    stopMainTheme(stage === 'nbti_result' ? RESULT_FADE_MS : TOGGLE_OFF_FADE_MS)
    return
  }
  if (!hasAudioUserGesture || mainThemeState === 'starting' || mainThemeState === 'playing') return
  startMainTheme(hasStartedMainTheme ? 0 : INITIAL_START_DELAY_MS, hasStartedMainTheme ? TOGGLE_ON_FADE_MS : INITIAL_FADE_MS)
}

/**
 * Centralized audio boundary. Missing approved assets are a deliberate no-op;
 * the UI may show the preference but never claims that a track was played.
 */
export function playAudioCue(cue: AudioCue, settings: AudioSettings) {
  if (!settings.sfxEnabled) return false
  const player = playerForCue(cue)
  if (!player) return false
  try {
    player.currentTime = 0
    void player.play().catch(() => undefined)
    return true
  } catch {
    return false
  }
}
