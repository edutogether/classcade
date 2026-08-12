export type AudioChannel = 'bgm' | 'sfx'

export type AudioSettings = {
  bgmEnabled: boolean
  bgmVolume: number
  sfxEnabled: boolean
}

/* Booth default: BGM on at full volume (2026-08-12 요청). bgmEnabled's default lives in
   journeyTypes.defaultAudio and is already true. */
export const DEFAULT_BGM_VOLUME = 1

export function clampBgmVolume(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : DEFAULT_BGM_VOLUME))
}

// Audio files are intentionally not connected until approved assets are supplied.
export function toggleAudioChannel(settings: AudioSettings, channel: AudioChannel): AudioSettings {
  return channel === 'bgm'
    ? { ...settings, bgmEnabled: !settings.bgmEnabled }
    : { ...settings, sfxEnabled: !settings.sfxEnabled }
}
