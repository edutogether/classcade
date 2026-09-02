import prepThemeM4a from '../assets/audio/classcade-prep-theme.m4a'
import questionThemeM4a from '../assets/audio/classcade-question-theme.m4a'
import resultThemeM4a from '../assets/audio/classcade-result-theme.m4a'
import mainThemeMp3 from '../assets/audio/classcade-main-theme-loop.mp3'
import { clampBgmVolume } from './audioController'
import { getHasAudioUserGesture, noteAudioUserGesture } from './audioGesture'

/** Each phase of the journey has its own track, and only one plays at a time: asking a
 *  new one to play cross-fades the previous one out. Volumes are relative to the user's
 *  chosen BGM volume, so the prep track sits under the questions without a separate
 *  control. Track titles are shown in the header. */
export type SceneTheme = 'prep' | 'main' | 'question' | 'result'

export const SCENE_THEMES: Readonly<Record<SceneTheme, { src: string; title: string; gain: number }>> = {
  prep: { src: prepThemeM4a, title: 'CLASSCADE - 마법사의 서곡', gain: 0.5 },
  main: { src: mainThemeMp3, title: 'CLASSCADE - 담쟁이 서고의 오후', gain: 1 },
  question: { src: questionThemeM4a, title: 'CLASSCADE - 별빛 교실 탐색', gain: 1 },
  /* Trimmed to 3:40 with its own fade-in/out baked in by ffmpeg, so looping it is
     seamless without any per-frame work here. */
  result: { src: resultThemeM4a, title: 'CLASSCADE - 고요한 왕국의 하루', gain: 1 },
}

const FADE_IN_MS = 1500
const FADE_OUT_MS = 1000

type Entry = { audio: HTMLAudioElement; frame: number | null; state: 'idle' | 'starting' | 'playing' | 'stopping' }
const players = new Map<SceneTheme, Entry>()
let current: SceneTheme | null = null
let requestedVolume = 1
/* Browsers refuse audio until the user interacts with the page. The scene that wanted
   music before that point parks its request here, and the first pointer/key anywhere
   replays it — so the music starts on the very first click, not only on 다음 질문. */
let pendingRequest: { theme: SceneTheme; volume: number } | null = null
if (typeof window !== 'undefined') {
  const kick = () => {
    noteAudioUserGesture()
    if (!pendingRequest) return
    const request = pendingRequest
    pendingRequest = null
    playSceneTheme(request.theme, true, request.volume)
  }
  window.addEventListener('pointerdown', kick, { capture: true })
  window.addEventListener('keydown', kick, { capture: true })
}

function entryFor(theme: SceneTheme): Entry | null {
  if (typeof document === 'undefined') return null
  const existing = players.get(theme)
  if (existing) return existing
  try {
    const audio = document.createElement('audio')
    audio.src = SCENE_THEMES[theme].src
    audio.loop = true
    /* Not 'auto': each theme element is created once and kept alive for the rest of the
       tab's life (see the players Map), even for tracks a given visitor's path never
       reaches — 'auto' would eagerly fetch all four tracks (~8.9MB combined) regardless
       of how far a visitor gets. play() below still fetches the full track the moment
       it's actually needed; 'metadata' only skips the unconditional upfront download. */
    audio.preload = 'metadata'
    audio.volume = 0
    /* Attached (invisibly) so devtools and tests can observe playback state. */
    audio.dataset.sceneTheme = theme
    document.body.append(audio)
    const entry: Entry = { audio, frame: null, state: 'idle' }
    players.set(theme, entry)
    return entry
  } catch {
    return null
  }
}

function fade(entry: Entry, target: number, duration: number, onComplete?: () => void) {
  if (entry.frame !== null) window.cancelAnimationFrame(entry.frame)
  const start = entry.audio.volume
  const startedAt = performance.now()
  const tick = (now: number) => {
    const progress = Math.max(0, Math.min(1, (now - startedAt) / duration))
    entry.audio.volume = start + (target - start) * progress
    if (progress < 1) { entry.frame = window.requestAnimationFrame(tick); return }
    entry.frame = null
    onComplete?.()
  }
  entry.frame = window.requestAnimationFrame(tick)
}

function stopEntry(theme: SceneTheme, duration = FADE_OUT_MS) {
  const entry = players.get(theme)
  if (!entry || entry.state === 'idle' || entry.state === 'stopping') return
  entry.state = 'stopping'
  fade(entry, 0, duration, () => {
    entry.audio.pause()
    entry.audio.currentTime = 0
    entry.state = 'idle'
  })
}

export function preloadSceneTheme(theme: SceneTheme) {
  if (typeof window === 'undefined') return
  const entry = entryFor(theme)
  if (entry) window.setTimeout(() => entry.audio.load(), 0)
}

/** Plays `theme`, fading out whatever was playing. Pass null to fade everything out. */
export function playSceneTheme(theme: SceneTheme | null, enabled: boolean, volume: number) {
  requestedVolume = clampBgmVolume(volume)
  if (!enabled || theme === null) {
    for (const key of players.keys()) stopEntry(key)
    current = null
    return
  }
  for (const key of players.keys()) if (key !== theme) stopEntry(key)
  if (!getHasAudioUserGesture()) { pendingRequest = { theme, volume: requestedVolume }; return }
  const entry = entryFor(theme)
  if (!entry) return
  const target = requestedVolume * SCENE_THEMES[theme].gain
  if (entry.state === 'playing') { fade(entry, target, 320); current = theme; return }
  if (entry.state === 'starting') return
  current = theme
  entry.state = 'starting'
  entry.audio.volume = 0
  try {
    void entry.audio.play().then(() => {
      if (entry.state !== 'starting') { entry.audio.pause(); return }
      fade(entry, target, FADE_IN_MS, () => { if (entry.state === 'starting') entry.state = 'playing' })
    }).catch(() => { if (entry.state === 'starting') entry.state = 'idle' })
  } catch {
    entry.state = 'idle'
  }
}

export function currentSceneTheme() { return current }
