import { AUDIO_MANIFEST, type AudioCue } from '../data/audioManifest'
import type { AudioSettings } from './audioController'

const cuePlayers = new Map<AudioCue, HTMLAudioElement>()

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
